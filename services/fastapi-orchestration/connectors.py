"""Shared connector contract for Atlas's federation layer.

Every source-specific connector (HubSpot, Neo4j, Azure Search, ...) returns this
envelope, matching the "Atlas Federated Enterprise Intelligence OS" brief's response
contract (2026-07-25, section 7.5) verbatim. The frontend consumes this shape --
it must never need connector-specific logic.

Statuses:
- "unmapped": the org has no source-specific ID registered for this connector.
- "unavailable": mapped, but the connector itself has no credentials/config here.
- "unauthorized": mapped and configured, but the live call was rejected on permissions.
- "error": mapped and configured, but the live call failed for another reason.
- "live": a real, current response from the source.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel

ConnectorStatus = Literal["live", "unavailable", "unauthorized", "unmapped", "error"]


class ConnectorResponse(BaseModel):
    sourceId: str
    authority: str
    status: ConnectorStatus
    externalId: str | None = None
    fetchedAt: str | None = None
    lastModifiedAt: str | None = None
    data: Any = None
    pagination: dict[str, Any] | None = None
    permissions: dict[str, Any] | None = None
    error: str | None = None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def unmapped(source_id: str, authority: str) -> ConnectorResponse:
    return ConnectorResponse(sourceId=source_id, authority=authority, status="unmapped")


def unavailable(source_id: str, authority: str, external_id: str, reason: str) -> ConnectorResponse:
    return ConnectorResponse(sourceId=source_id, authority=authority, status="unavailable", externalId=external_id, error=reason)
