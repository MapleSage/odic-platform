import json
from pathlib import Path

from fastapi import HTTPException

from auth import is_admin

BASE_DIR = Path(__file__).parent
ORGS_DIR = BASE_DIR / "data" / "orgs"
INDEX_PATH = ORGS_DIR / "index.json"

EMPTY_WORKSPACE = {
    "organization": {"name": "", "meta": {}, "stats": [], "people": [], "risks": [], "opportunities": []},
    "search": {"summary": "", "facets": [], "results": []},
    "reports": {"title": "", "sections": []},
    "graph": {"score": 0, "vendors": [], "counterparties": [], "edges": []},
}


def get_organizations() -> list[dict]:
    """The org registry -- adding a customer means adding an entry here plus a
    data/orgs/<id>.json file, not editing application code."""
    if not INDEX_PATH.exists():
        return []
    return json.loads(INDEX_PATH.read_text()).get("organizations", [])


def _org_ids() -> set[str]:
    return {org["id"] for org in get_organizations()}


def _org_by_id(org_id: str) -> dict | None:
    return next((org for org in get_organizations() if org["id"] == org_id), None)


def is_org_restricted(org_id: str) -> bool:
    """Org-level access gate, server-side. Previously every endpoint below only
    checked "is this a valid signed-in user" (any authenticated org member could read
    any org's data, including the most sensitive Smartworld forensic material) -- this
    is the first piece of actual per-org authorization, not just authentication.
    Defaults to False (unrestricted) for any org that doesn't set the field, so this
    is opt-in per org, not a behavior change for orgs nobody has flagged yet."""
    org = _org_by_id(org_id)
    return bool(org and org.get("restricted", False))


def require_org_access(org_id: str, user: dict) -> None:
    """Call at the top of any endpoint that returns one org's data. Raises before any
    data is read or returned -- restriction is enforced at the access-control layer,
    not by filtering an already-fetched response."""
    if is_org_restricted(org_id) and not is_admin(user):
        raise HTTPException(status_code=403, detail=f"Organization '{org_id}' requires Atlas Admin access")


def get_workspace_data(org_id: str) -> dict:
    if org_id not in _org_ids():
        raise HTTPException(status_code=404, detail=f"Unknown organization: {org_id}")

    org_path = ORGS_DIR / f"{org_id}.json"
    if not org_path.exists():
        # Registered (e.g. an Exposure-Network-only org) but no workspace-data JSON yet.
        return EMPTY_WORKSPACE
    return json.loads(org_path.read_text())


def get_source_mapping(org_id: str, source: str) -> dict:
    """Explicit external-ID mapping for one connector (e.g. source='hubspot' ->
    {'companyId': ...}). Never resolved by matching org name -- absent/null means
    unmapped, not "try the name."""
    for org in get_organizations():
        if org["id"] == org_id:
            return org.get("sources", {}).get(source, {})
    raise HTTPException(status_code=404, detail=f"Unknown organization: {org_id}")
