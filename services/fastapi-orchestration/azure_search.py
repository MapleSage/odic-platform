"""Minimal dependency-free Azure AI Search adapter for Atlas.

Configured only when all three env vars are present:
ATLAS_AZURE_SEARCH_ENDPOINT, ATLAS_AZURE_SEARCH_INDEX, AZURE_SEARCH_API_KEY.
No network call is made without explicit configuration.
"""
from __future__ import annotations

import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


def configured() -> bool:
    return all(os.getenv(k) for k in ("ATLAS_AZURE_SEARCH_ENDPOINT", "ATLAS_AZURE_SEARCH_INDEX", "AZURE_SEARCH_API_KEY"))


def search(query: str = "", org: str | None = None, facet: str | None = None) -> dict:
    if not configured():
        raise RuntimeError("Azure AI Search is not configured")
    endpoint = os.environ["ATLAS_AZURE_SEARCH_ENDPOINT"].rstrip("/")
    index = quote(os.environ["ATLAS_AZURE_SEARCH_INDEX"], safe="")
    api_version = os.getenv("ATLAS_AZURE_SEARCH_API_VERSION", "2024-07-01")
    payload = {"search": query or "*", "count": True, "top": int(os.getenv("ATLAS_SEARCH_TOP", "50")), "facets": ["type", "org"]}
    filters = []
    if org:
        filters.append(f"orgId eq '{org.replace(chr(39), chr(39)*2)}'")
    if facet:
        filters.append(f"type eq '{facet.replace(chr(39), chr(39)*2).upper()}'")
    if filters:
        payload["filter"] = " and ".join(filters)
    request = Request(f"{endpoint}/indexes/{index}/docs/search?api-version={api_version}", data=json.dumps(payload).encode(), method="POST", headers={"Content-Type": "application/json", "api-key": os.environ["AZURE_SEARCH_API_KEY"]})
    try:
        with urlopen(request, timeout=float(os.getenv("ATLAS_SEARCH_TIMEOUT_SECONDS", "8"))) as response:
            data = json.loads(response.read().decode())
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        raise RuntimeError(f"Azure AI Search request failed: {exc}") from exc
    results = []
    for doc in data.get("value", []):
        results.append({"code": doc.get("code") or doc.get("type", "DOC"), "name": doc.get("name") or doc.get("title", ""), "sub": doc.get("sub") or doc.get("description", ""), "tag": doc.get("tag") or doc.get("status", "")})
    facets = []
    labels = {"ORG": "Organizations", "PPL": "People", "DOC": "Documents", "RSK": "Risks"}
    for bucket in data.get("@search.facets", {}).get("type", []):
        value = str(bucket.get("value", ""))
        facets.append({"label": labels.get(value.upper(), value), "count": bucket.get("count", 0)})
    return {"query": query, "org": org, "results": results, "facets": facets, "total": data.get("@odata.count", len(results)), "source": "azure-ai-search", "index": os.environ["ATLAS_AZURE_SEARCH_INDEX"]}
