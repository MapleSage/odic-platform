import hashlib
import json
from pathlib import Path

from fastapi import HTTPException

BASE_DIR = Path(__file__).parent
SOURCE_REGISTRY_PATH = BASE_DIR / "source_registry.json"
DOSSIER_SUMMARY_PATH = BASE_DIR / "data" / "dossiers" / "dossier-status-summary-latest.json"


def _sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def get_source_registry() -> dict:
    """Configured source connectors and their current contract metadata."""
    if not SOURCE_REGISTRY_PATH.exists():
        return {"version": "0.1.0", "sources": [], "eventContract": {}}
    return json.loads(SOURCE_REGISTRY_PATH.read_text())


def _load_dossier_summary() -> dict:
    if not DOSSIER_SUMMARY_PATH.exists():
        return {"items": []}
    return json.loads(DOSSIER_SUMMARY_PATH.read_text())


def _build_events() -> list[dict]:
    summary = _load_dossier_summary()
    generated_at = summary.get("generatedAtUtc")
    events: list[dict] = []

    for item in summary.get("items", []):
        latest_path = BASE_DIR / (item.get("latestPath") or item.get("path") or "")
        if not latest_path.exists():
            continue
        content = latest_path.read_text(encoding="utf-8", errors="replace")
        excerpt_lines = [line.strip() for line in content.splitlines() if line.strip()][:6]
        excerpt = " ".join(excerpt_lines)[:900]
        event_id = f"real-estate-dossier::{item['key']}::{summary.get('date', 'latest')}"
        entity_refs = [item.get("label", item["key"])]
        if "smartworld" in item["key"]:
            entity_refs.append("Smartworld Developers")
        if "m3m" in item["key"]:
            entity_refs.append("M3M")

        events.append(
            {
                "eventId": event_id,
                "entityId": item["key"],
                "title": f"{item.get('label', item['key'])} dossier refresh",
                "sourceId": "official-company-site",
                "sourceUrl": f"file://{latest_path}",
                "observedAt": generated_at,
                "publishedAt": generated_at,
                "contentHash": f"sha256:{_sha256_text(content)}",
                "content": excerpt,
                "entityRefs": entity_refs,
                "changeType": "updated",
                "materiality": "material",
                "confidence": 0.9,
                "evidenceRefs": [str(latest_path.relative_to(BASE_DIR))],
                "processingStatus": "staged_local_only",
                "status": item.get("status"),
                "deepDiligenceState": item.get("deepDiligenceState"),
            }
        )

    return events


def get_intelligence_status() -> dict:
    """Honest ingestion status -- staged local evidence, not a claim of live cloud ingestion."""
    registry = get_source_registry()
    enabled = [source["id"] for source in registry.get("sources", []) if source.get("enabled")]
    events = _build_events()
    last_successful = max((event.get("observedAt") for event in events if event.get("observedAt")), default=None)
    if events:
        return {
            "status": "hybrid",
            "mode": "seeded-workspace-plus-staged-intelligence",
            "enabledSourceDefinitions": enabled,
            "connectedFeeds": ["real-estate-dossier-snapshots"],
            "lastSuccessfulIngestionAt": last_successful,
            "eventCount": len(events),
            "note": (
                "Source registry and provenance contract are present. Real evidence-backed staged "
                "dossier events are available locally; connector workers, cloud KB upload, and daily "
                "automated refresh run outside this service."
            ),
        }
    return {
        "status": "scaffold",
        "mode": "seeded-workspace",
        "enabledSourceDefinitions": enabled,
        "connectedFeeds": [],
        "lastSuccessfulIngestionAt": None,
        "eventCount": 0,
        "note": "Source registry and provenance contract are present; no staged dossier events are bundled yet.",
    }


def get_intelligence_events(entity_id: str | None = None) -> dict:
    events = _build_events()
    if entity_id:
        needle = entity_id.strip().lower()
        events = [
            event
            for event in events
            if event.get("entityId", "").lower() == needle or needle in {ref.lower() for ref in event.get("entityRefs", [])}
        ]
    return {"count": len(events), "events": events}


def get_intelligence_evidence(event_id: str) -> dict:
    for event in _build_events():
        if event["eventId"] != event_id:
            continue
        evidence_path = BASE_DIR / event["evidenceRefs"][0]
        return {
            "event": event,
            "evidence": {
                "path": str(evidence_path.relative_to(BASE_DIR)),
                "content": evidence_path.read_text(encoding="utf-8", errors="replace"),
            },
        }
    raise HTTPException(status_code=404, detail="Evidence event not found")
