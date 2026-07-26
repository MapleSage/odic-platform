"""Atlas ingestion normalizer.

Pure transform logic per docs/luna-atlas-integration-contract-2026-07-25.md section 3:
group evidence by claim, derive an A/B/C/D grade, validate the canonical edge record.
No I/O, no storage -- this is deliberately built and tested ahead of L1 (Luna's plugin
routes) landing, against synthetic fixtures derived from the retained, currently-trusted
apps/shell/src/exposureNetwork/orgs/smartworld.ts baseline (see test_normalizer.py).
Once L1 exists, wiring is: fetch evidence -> group_by_claim -> derive_grade -> store.

This module does NOT claim to satisfy the contract's P2 gate ("run over Smartworld
evidence, diff against smartworld.json") -- that requires Luna's real evidence corpus.
It proves the transform logic is correct against a hand-built stand-in, so P2 becomes a
wiring exercise (swap the stand-in for L1's real feed) rather than a from-scratch build.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

# Section 3.4's mapping table. A relationship type not in here is rejected at
# validation time, per section 3.5's "reject, do not coerce" rule -- silently
# defaulting an unknown relationship to a column is how evidence discipline decays.
RELATIONSHIP_COLUMN = {
    "licensee_of": "supply", "contractor_for": "supply", "epc_for": "supply",
    "architect_for": "supply", "supplies_to": "supply", "financed_construction": "supply",
    "advises": "supply", "regulates": "supply",
    "spv_of": "core", "project_of": "core", "asset_of": "core",
    "licence_for": "core", "permit_for": "core",
    "bulk_purchaser_of": "demand", "allottee_of": "demand", "lender_to_buyers": "demand",
    "escrow_for": "demand", "tenant_of": "demand", "invests_in": "demand",
}

OFFICIAL_TIERS = {"official_government", "official_company"}


class ValidationError(Exception):
    pass


def claim_key(record: dict[str, Any]) -> tuple[str, str, str]:
    """Two evidence records describe the same claim iff they agree on entity,
    relationship, and target -- the identity Luna's own claimKey groups on."""
    return (record["entityId"], record["relationship"], record["targetEntityId"])


def group_by_claim(records: list[dict[str, Any]]) -> dict[tuple[str, str, str], list[dict[str, Any]]]:
    groups: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for record in records:
        groups.setdefault(claim_key(record), []).append(record)
    return groups


def derive_grade(records_for_one_claim: list[dict[str, Any]]) -> str:
    """Section 3.3's table, in priority order (A beats B beats C beats D).

    Corroboration (B) is counted over sourceRefs, not records: a claim graded by two
    records that each cite the same single non-official sourceId is NOT corroborated --
    the count is over distinct sourceIds, which is what "independent" means here.
    """
    if not records_for_one_claim:
        raise ValueError("Cannot grade a claim with zero evidence records")

    all_source_refs = [ref for record in records_for_one_claim for ref in record.get("sourceRefs", [])]

    if any(ref.get("sourceTier") == "official_government" for ref in all_source_refs):
        return "A"

    independent_non_official = {
        ref["sourceId"] for ref in all_source_refs
        if ref.get("sourceTier") not in OFFICIAL_TIERS
    }
    if len(independent_non_official) >= 2:
        return "B"

    if any(ref.get("sourceTier") == "official_company" for ref in all_source_refs):
        return "C"

    return "D"


def normalize(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Group raw evidence by claim, derive a grade per claim, and return one canonical
    record per claim (the first record in the group, stamped with the derived grade)."""
    graded: list[dict[str, Any]] = []
    for group in group_by_claim(records).values():
        grade = derive_grade(group)
        canonical = dict(group[0])
        canonical["grade"] = grade
        canonical["sourceRefs"] = [ref for record in group for ref in record.get("sourceRefs", [])]
        graded.append(canonical)
    return graded


def validate_record(record: dict[str, Any], known_source_ids: set[str], now: datetime | None = None) -> None:
    """Section 3.5: reject, do not coerce. Raises ValidationError listing every
    violation found (not just the first), so a bad batch surfaces its full shape."""
    now = now or datetime.now(timezone.utc)
    errors: list[str] = []

    if not record.get("entityId"):
        errors.append("missing entityId")
    if not record.get("entityType"):
        errors.append("missing entityType")

    relationship = record.get("relationship")
    if not relationship:
        errors.append("missing relationship")
    elif relationship not in RELATIONSHIP_COLUMN:
        errors.append(f"relationship type '{relationship}' not present in the column mapping table")

    source_refs = record.get("sourceRefs") or []
    if not source_refs:
        errors.append("zero sourceRefs")
    else:
        for ref in source_refs:
            if ref.get("sourceId") not in known_source_ids:
                errors.append(f"sourceId '{ref.get('sourceId')}' does not resolve in the source register")

    if record.get("grade") == "D" and not record.get("hypothesisNote"):
        errors.append("grade D without an explicit hypothesis note")

    observed_ats = [ref.get("observedAt") for ref in source_refs if ref.get("observedAt")]
    if not observed_ats:
        errors.append("observedAt absent")
    for ts in observed_ats:
        try:
            observed = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            errors.append(f"observedAt '{ts}' is not a valid ISO8601 timestamp")
            continue
        if observed > now:
            errors.append(f"observedAt '{ts}' is in the future")

    if errors:
        raise ValidationError("; ".join(errors))
