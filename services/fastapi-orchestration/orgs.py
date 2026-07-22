import json
from pathlib import Path

from fastapi import HTTPException

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


def get_workspace_data(org_id: str) -> dict:
    if org_id not in _org_ids():
        raise HTTPException(status_code=404, detail=f"Unknown organization: {org_id}")

    org_path = ORGS_DIR / f"{org_id}.json"
    if not org_path.exists():
        # Registered (e.g. an Exposure-Network-only org) but no workspace-data JSON yet.
        return EMPTY_WORKSPACE
    return json.loads(org_path.read_text())
