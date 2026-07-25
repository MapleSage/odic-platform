"""File-backed Exposure Network data, served to match apps/shell's ExposureNetworkData
contract (apps/shell/src/exposureNetwork/schema.ts) exactly -- that file is the literal
shape this module must return, field for field.

One JSON file per org under data/exposure-network/<org_id>.json. Nothing is fabricated
for an org without a file: the route returns 404, and the frontend already renders an
explicit "No relationships evidenced yet" empty state for that case.
"""
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data" / "exposure-network"


def get_exposure_network_data(org_id: str) -> dict | None:
    path = DATA_DIR / f"{org_id}.json"
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))
