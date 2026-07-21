import hashlib
import json
import os
from pathlib import Path

import requests
from fastapi import HTTPException

BASE_DIR = Path(__file__).parent
SOURCE_REGISTRY_PATH = BASE_DIR / "source_registry.json"
DOSSIER_SUMMARY_PATH = BASE_DIR / "data" / "dossiers" / "dossier-status-summary-latest.json"

AZURE_SEARCH_ENDPOINT = os.environ.get("AZURE_SEARCH_ENDPOINT", "").rstrip("/")
AZURE_SEARCH_API_KEY = os.environ.get("AZURE_SEARCH_API_KEY", "")
AZURE_SEARCH_INDEX = os.environ.get("AZURE_SEARCH_INDEX", "atlas-enterprise-intel-kb-v1")
AZURE_SEARCH_API_VERSION = "2024-07-01"


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


def _azure_search_configured() -> bool:
    return bool(AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_API_KEY)


def _doc_to_event(doc: dict) -> dict:
    content = doc.get("content") or ""
    return {
        "eventId": f"azure-search::{AZURE_SEARCH_INDEX}::{doc.get('id')}",
        "entityId": (doc.get("entityRefs") or ["unknown"])[0].split(":")[-1],
        "title": doc.get("title") or "Untitled",
        "sourceId": doc.get("sourceId", ""),
        "sourceUrl": doc.get("sourceUrl", ""),
        "observedAt": doc.get("observedAt"),
        "publishedAt": doc.get("publishedAt"),
        "contentHash": f"sha256:{doc['contentHash']}" if doc.get("contentHash") else None,
        "content": content[:900],
        "entityRefs": doc.get("entityRefs") or [],
        "changeType": doc.get("changeType", "snapshot"),
        "materiality": doc.get("materiality", "medium"),
        "confidence": doc.get("confidence", 0.5),
        "evidenceRefs": doc.get("evidenceRefs") or [],
        "processingStatus": doc.get("processingStatus", "fetched"),
        "status": None,
        "deepDiligenceState": None,
        "origin": "azure-search-live",
    }


def _fetch_azure_search_events() -> list[dict]:
    """Live events from the Azure AI Search KB. Returns [] if unconfigured or unreachable --
    the workspace falls back to staged local dossier evidence rather than erroring the UI out."""
    if not _azure_search_configured():
        return []

    url = f"{AZURE_SEARCH_ENDPOINT}/indexes/{AZURE_SEARCH_INDEX}/docs"
    try:
        response = requests.get(
            url,
            params={"api-version": AZURE_SEARCH_API_VERSION, "search": "*", "$filter": "domain eq 'atlas'", "$top": 50},
            headers={"api-key": AZURE_SEARCH_API_KEY},
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException:
        return []

    docs = response.json().get("value", [])
    return [_doc_to_event(doc) for doc in docs]


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
                "origin": "staged-local",
            }
        )

    live_events = _fetch_azure_search_events()
    known_hashes = {event["contentHash"] for event in events if event.get("contentHash")}
    events.extend(event for event in live_events if event.get("contentHash") not in known_hashes)
    events.sort(key=lambda event: event.get("observedAt") or "", reverse=True)

    return events


def get_intelligence_status() -> dict:
    """Honest ingestion status -- staged local evidence, not a claim of live cloud ingestion."""
    registry = get_source_registry()
    enabled = [source["id"] for source in registry.get("sources", []) if source.get("enabled")]
    events = _build_events()
    last_successful = max((event.get("observedAt") for event in events if event.get("observedAt")), default=None)
    if events:
        live_connected = _azure_search_configured()
        connected_feeds = ["real-estate-dossier-snapshots"]
        if live_connected:
            connected_feeds.append(f"azure-search:{AZURE_SEARCH_INDEX}")
        return {
            "status": "hybrid",
            "mode": "live-kb-plus-staged-intelligence" if live_connected else "seeded-workspace-plus-staged-intelligence",
            "enabledSourceDefinitions": enabled,
            "connectedFeeds": connected_feeds,
            "lastSuccessfulIngestionAt": last_successful,
            "eventCount": len(events),
            "note": (
                "Live events are read from the Azure AI Search enterprise intelligence KB, merged with "
                "staged local dossier evidence. Connector workers populate the KB on a cron cadence outside "
                "this service."
                if live_connected
                else "Source registry and provenance contract are present. Real evidence-backed staged "
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
        if event.get("origin") == "azure-search-live" or not event.get("evidenceRefs"):
            return {
                "event": event,
                "evidence": {
                    "path": event.get("sourceUrl", ""),
                    "content": event.get("content", ""),
                },
            }
        evidence_path = BASE_DIR / event["evidenceRefs"][0]
        return {
            "event": event,
            "evidence": {
                "path": str(evidence_path.relative_to(BASE_DIR)),
                "content": evidence_path.read_text(encoding="utf-8", errors="replace"),
            },
        }
    raise HTTPException(status_code=404, detail="Evidence event not found")
