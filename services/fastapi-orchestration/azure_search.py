"""Minimal dependency-free Azure AI Search adapter for Atlas.

Configured only when all three env vars are present:
AZURE_SEARCH_ENDPOINT, AZURE_SEARCH_INDEX, AZURE_SEARCH_API_KEY (unprefixed -- matching
the k8s secret `atlas-search` that's been deployed on atlas-backend since 2026-07-21,
and the original requirements doc's own naming. An earlier version of this file invented
an ATLAS_-prefixed scheme that never matched what was actually deployed, which meant
Azure Search silently reported "unavailable" as if no credentials existed at all, even
though the secret -- pointing at the correct service/index, sagecmo-search /
atlas-enterprise-intel-kb-v1 -- was there the whole time. Corrected 2026-07-26.
No network call is made without explicit configuration.

Field mapping matches the actual deployed schema of atlas-enterprise-intel-kb-v1
(verified live 2026-07-24: id, domain, corpus, title, content, sourceId, sourceType,
owner, entityRefs, category, materiality, confidence, ... -- no code/name/sub/tag/orgId
fields exist, so this does NOT reuse local search.py's row shape verbatim). `owner` is
a human-readable org display name (e.g. "Smartworld Developers"), not the org registry's
short id, so org filtering resolves id -> name via orgs.py before building the OData
filter. There is no per-record type code (ORG/PPL/DOC/RSK) in this schema; `category`
is the closest analog and is what `facet` filters against.
"""
from __future__ import annotations

import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from orgs import get_organizations


def configured() -> bool:
    return all(os.getenv(k) for k in ("AZURE_SEARCH_ENDPOINT", "AZURE_SEARCH_INDEX", "AZURE_SEARCH_API_KEY"))


def _escape(value: str) -> str:
    return value.replace("'", "''")


def _org_display_name(org_id: str) -> str:
    for org in get_organizations():
        if org.get("id") == org_id:
            return org.get("name", org_id)
    return org_id


def search(query: str = "", org: str | None = None, facet: str | None = None) -> dict:
    if not configured():
        raise RuntimeError("Azure AI Search is not configured")
    endpoint = os.environ["AZURE_SEARCH_ENDPOINT"].rstrip("/")
    index = quote(os.environ["AZURE_SEARCH_INDEX"], safe="")
    api_version = os.getenv("AZURE_SEARCH_API_VERSION", "2024-07-01")
    payload = {
        "search": query or "*",
        "count": True,
        "top": int(os.getenv("ATLAS_SEARCH_TOP", "50")),
        "facets": ["category", "sourceType", "materiality"],
    }
    filters = []
    if org:
        filters.append(f"owner eq '{_escape(_org_display_name(org))}'")
    if facet:
        filters.append(f"category eq '{_escape(facet)}'")
    if filters:
        payload["filter"] = " and ".join(filters)
    request = Request(
        f"{endpoint}/indexes/{index}/docs/search?api-version={api_version}",
        data=json.dumps(payload).encode(),
        method="POST",
        headers={"Content-Type": "application/json", "api-key": os.environ["AZURE_SEARCH_API_KEY"]},
    )
    try:
        with urlopen(request, timeout=float(os.getenv("ATLAS_SEARCH_TIMEOUT_SECONDS", "8"))) as response:
            data = json.loads(response.read().decode())
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise RuntimeError(f"Azure AI Search request failed: {exc}") from exc

    results = []
    for doc in data.get("value", []):
        results.append({
            "code": (doc.get("category") or "record").upper()[:12],
            "name": doc.get("title", ""),
            "sub": f"{doc.get('sourceType', '')} -- {doc.get('owner', '')}".strip(" -"),
            "tag": doc.get("materiality", ""),
            "org": doc.get("owner", ""),
        })
    facets = []
    for facet_field in ("category", "sourceType", "materiality"):
        for bucket in data.get("@search.facets", {}).get(facet_field, []):
            facets.append({"label": str(bucket.get("value", "")), "count": bucket.get("count", 0)})

    return {
        "query": query,
        "org": org,
        "results": results,
        "facets": facets,
        "total": data.get("@odata.count", len(results)),
        "source": "azure-ai-search",
        "index": os.environ["AZURE_SEARCH_INDEX"],
    }
