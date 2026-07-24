"""Deterministic local search across every registered org's workspace data.

Used as the default search backend, and as the fallback when Azure AI Search
(azure_search.py) is unconfigured or a live request to it fails.
"""
from __future__ import annotations

from typing import Any

from orgs import get_organizations, get_workspace_data

LABELS = {"ORG": "Organizations", "PPL": "People", "DOC": "Documents", "RSK": "Risks", "OPP": "Opportunities"}


def _rows(org_id: str, workspace: dict[str, Any]) -> list[dict[str, str]]:
    organization = workspace.get("organization", {})
    name = organization.get("name", org_id)
    rows: list[dict[str, str]] = []

    if name:
        rows.append({
            "code": "ORG", "name": name,
            "sub": f"{organization.get('meta', {}).get('industry', '')} - {organization.get('meta', {}).get('hq', '')}",
            "tag": organization.get("meta", {}).get("riskLevel", "Organization"), "org": org_id,
        })
    for person in organization.get("people", []):
        rows.append({"code": "PPL", "name": person.get("name", ""), "sub": f"{person.get('title', '')} - {name}", "tag": "Person", "org": org_id})
    for risk in organization.get("risks", []):
        rows.append({"code": "RSK", "name": risk.get("title", ""), "sub": f"Risk - {name}", "tag": risk.get("severity", "Risk"), "org": org_id})
    for doc in organization.get("documents", []):
        rows.append({"code": "DOC", "name": doc.get("name", ""), "sub": f"{doc.get('type', 'Document')} - {name}", "tag": doc.get("tag", "Document"), "org": org_id})
    for opp in organization.get("opportunities", []):
        rows.append({"code": "OPP", "name": opp.get("title", ""), "sub": f"Opportunity - {name}", "tag": opp.get("stage", "Opportunity"), "org": org_id})
    return rows


def local_search(query: str = "", org_id: str | None = None, facet: str | None = None) -> dict[str, Any]:
    org_ids = [org_id] if org_id else [org["id"] for org in get_organizations()]
    rows = [row for oid in org_ids for row in _rows(oid, get_workspace_data(oid))]

    q = query.strip().lower()
    if q:
        rows = [r for r in rows if q in " ".join(v for k, v in r.items() if k != "org").lower()]
    if facet:
        wanted = facet.strip().upper()
        rows = [r for r in rows if r["code"] == wanted]

    counts: dict[str, int] = {}
    for row in rows:
        counts[row["code"]] = counts.get(row["code"], 0) + 1

    return {
        "query": query,
        "org": org_id,
        "results": rows,
        "facets": [{"label": label, "count": counts.get(code, 0)} for code, label in LABELS.items() if counts.get(code, 0) or not facet],
        "total": len(rows),
        "source": "local-org-registry",
    }
