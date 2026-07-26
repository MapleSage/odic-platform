"""Tests for normalizer.py.

Two kinds of coverage:
1. Unit tests for each grade rule and each validation rule in isolation.
2. A regression fixture built from apps/shell/src/exposureNetwork/orgs/smartworld.ts's
   20 real edges (grep-verified grade distribution: A=13, B=1, C=5, D=1 -- matches the
   integration contract's cited sanity check exactly). Each edge's real name/src/note is
   carried into a synthetic canonical-record-shaped evidence fixture, standing in for
   Luna's not-yet-available real evidence feed (L1 isn't wired yet).

This is NOT the contract's P2 gate ("run over Smartworld evidence, diff against
smartworld.json") -- that requires Luna's real corpus. It proves derive_grade() and
group_by_claim() correctly reproduce a known-good distribution on realistic input, so
P2 becomes wiring (swap this fixture for L1's real feed) rather than a from-scratch build.

One real gap this surfaced, worth flagging rather than hiding: Smartworld's actual edge
labels (land_licensee_of, buyer_catchment, escrow_account_holder, commercial_off_taker,
prior_lender_sarfaesi, owner_licensee, possible_epc_vendor, licensee_structure_with) are
more specific than section 3.4's relationship vocabulary (licensee_of, bulk_purchaser_of,
escrow_for, ...). This fixture maps each to its closest 3.4 type for the grade-derivation
test. The mapping table itself will need extending -- or Luna's real edge labels will need
to already speak 3.4's vocabulary -- before P3's real column derivation can pass Smartworld
edges through validation unchanged. Not fixed here; flagging it is the point of building
this now instead of waiting for L1.
"""
import pytest

from normalizer import ValidationError, derive_grade, group_by_claim, normalize, validate_record

UTC = "2026-07-25T08:00:00Z"


def ref(source_id, tier, observed_at=UTC):
    return {"sourceId": source_id, "url": f"https://example.org/{source_id}", "sourceTier": tier, "observedAt": observed_at}


def record(entity_id, relationship, target_id, source_refs, **extra):
    return {
        "entityId": entity_id,
        "entityType": "company",
        "name": extra.pop("name", entity_id),
        "relationship": relationship,
        "targetEntityId": target_id,
        "sourceRefs": source_refs,
        "status": "confirmed",
        "lastIngestedAt": UTC,
        **extra,
    }


# ---------------------------------------------------------------------------
# Grade derivation, section 3.3, one rule at a time
# ---------------------------------------------------------------------------

def test_grade_a_government_source_wins_outright():
    claim = [record("e1", "licence_for", "p1", [ref("HRERA-007", "official_government")])]
    assert derive_grade(claim) == "A"


def test_grade_a_beats_corroborated_non_official_even_if_present():
    claim = [record("e1", "licence_for", "p1", [
        ref("HRERA-007", "official_government"),
        ref("news-a", "independent_media"),
        ref("news-b", "independent_media"),
    ])]
    assert derive_grade(claim) == "A"


def test_grade_b_requires_two_distinct_independent_sources():
    single_source = [record("e1", "escrow_for", "p1", [ref("news-a", "independent_media")])]
    assert derive_grade(single_source) == "D"  # one non-official source alone is not corroboration

    two_sources = [record("e1", "escrow_for", "p1", [
        ref("news-a", "independent_media"),
        ref("news-b", "independent_media"),
    ])]
    assert derive_grade(two_sources) == "B"


def test_grade_b_corroboration_counts_distinct_source_ids_not_records():
    # Two records citing the SAME single source are not corroborated -- this is the
    # exact failure mode the contract warns about ("a property of corroboration count,
    # not of any single record").
    claim = [
        record("e1", "escrow_for", "p1", [ref("news-a", "independent_media")]),
        record("e1", "escrow_for", "p1", [ref("news-a", "independent_media")]),
    ]
    assert derive_grade(claim) == "D"


def test_grade_c_official_company_disclosure():
    claim = [record("e1", "licensee_of", "p1", [ref("company-site", "official_company")])]
    assert derive_grade(claim) == "C"


def test_grade_d_no_source_or_hypothesis():
    claim = [record("e1", "epc_for", "ALL", [])]
    assert derive_grade(claim) == "D"


def test_grade_derivation_raises_on_empty_claim():
    with pytest.raises(ValueError):
        derive_grade([])


# ---------------------------------------------------------------------------
# group_by_claim / normalize
# ---------------------------------------------------------------------------

def test_group_by_claim_groups_on_entity_relationship_target_only():
    records = [
        record("e1", "escrow_for", "p1", [ref("a", "independent_media")]),
        record("e1", "escrow_for", "p1", [ref("b", "independent_media")]),
        record("e2", "escrow_for", "p1", [ref("c", "official_government")]),
    ]
    groups = group_by_claim(records)
    assert len(groups) == 2
    assert len(groups[("e1", "escrow_for", "p1")]) == 2
    assert len(groups[("e2", "escrow_for", "p1")]) == 1


def test_normalize_merges_sourcerefs_and_stamps_grade():
    records = [
        record("e1", "escrow_for", "p1", [ref("a", "independent_media")]),
        record("e1", "escrow_for", "p1", [ref("b", "independent_media")]),
    ]
    [merged] = normalize(records)
    assert merged["grade"] == "B"
    assert {r["sourceId"] for r in merged["sourceRefs"]} == {"a", "b"}


# ---------------------------------------------------------------------------
# Validation, section 3.5 -- reject, do not coerce
# ---------------------------------------------------------------------------

KNOWN_SOURCES = {"HRERA-007", "company-site"}


def test_validate_rejects_missing_entity_id():
    bad = record("", "licence_for", "p1", [ref("HRERA-007", "official_government")])
    with pytest.raises(ValidationError, match="missing entityId"):
        validate_record(bad, KNOWN_SOURCES)


def test_validate_rejects_unknown_relationship_type():
    bad = record("e1", "land_licensee_of", "p1", [ref("HRERA-007", "official_government")])
    with pytest.raises(ValidationError, match="not present in the column mapping table"):
        validate_record(bad, KNOWN_SOURCES)


def test_validate_rejects_zero_sourcerefs():
    bad = record("e1", "licence_for", "p1", [])
    with pytest.raises(ValidationError, match="zero sourceRefs"):
        validate_record(bad, KNOWN_SOURCES)


def test_validate_rejects_unresolvable_source_id():
    bad = record("e1", "licence_for", "p1", [ref("not-in-register", "official_government")])
    with pytest.raises(ValidationError, match="does not resolve in the source register"):
        validate_record(bad, KNOWN_SOURCES)


def test_validate_rejects_grade_d_without_hypothesis_note():
    bad = record("e1", "epc_for", "ALL", [ref("HRERA-007", "official_government")], grade="D")
    with pytest.raises(ValidationError, match="grade D without an explicit hypothesis note"):
        validate_record(bad, KNOWN_SOURCES)


def test_validate_accepts_grade_d_with_hypothesis_note():
    ok = record("e1", "epc_for", "ALL", [ref("HRERA-007", "official_government")], grade="D", hypothesisNote="Not yet evidenced by any filing.")
    validate_record(ok, KNOWN_SOURCES)  # does not raise


def test_validate_rejects_future_observed_at():
    bad = record("e1", "licence_for", "p1", [ref("HRERA-007", "official_government", observed_at="2099-01-01T00:00:00Z")])
    with pytest.raises(ValidationError, match="is in the future"):
        validate_record(bad, KNOWN_SOURCES)


# ---------------------------------------------------------------------------
# Regression fixture: Smartworld's 20 real edges, grep-verified against
# orgs/smartworld.ts. Fixture sourceTiers are chosen to reproduce each edge's
# EXISTING hand-assigned grade -- this tests that derive_grade() is correct,
# not that these are the real-world tiers of HRERA-007 etc.
# ---------------------------------------------------------------------------

SMARTWORLD_EDGES = [
    # (name, relationship, target, grade, src) -- edgeLabel translated to section 3.4's
    # vocabulary; see module docstring for why translation was needed at all.
    ("Modgen Developers Pvt Ltd", "licensee_of", "skyarc", "A", "HRERA-007"),
    ("Aspis Buildcon & Starcity", "licensee_of", "onedxp", "A", "HRERA-001"),
    ("IREO Pvt Ltd & 11+ Co-Lic.", "licensee_of", "orchard", "A", "HRERA-003"),
    ("Owner-Licensee Standard", "licensee_of", "edition", "A", "HRERA-002"),
    ("Owner-Licensee / Aawam Residency", "licensee_of", "gems", "A", "HRERA-004"),
    ("M3M India Infrastructures Pvt Ltd", "licensee_of", "naturescourt", "A", "HRERA-005"),
    ("Larsen & Toubro (L&T)", "epc_for", "ALL", "D", "open"),
    ("Indiabulls Housing Finance Ltd", "financed_construction", "skyarc", "A", "SWD-Sky-Arc-01"),
    ("Neil Maxinfra Pvt Ltd", "bulk_purchaser_of", "skyarc", "A", "SWD-Sky-Arc-02"),
    ("9k Expressway Catchment", "bulk_purchaser_of", "onedxp", "A", "HRERA-001"),
    ("Sector 61 Retail Buyers", "bulk_purchaser_of", "orchard", "A", "HRERA-003"),
    ("Sector 66 HNI/UHNI Pool", "bulk_purchaser_of", "edition", "A", "HRERA-002"),
    ("Global City Catchment Links", "bulk_purchaser_of", "naturescourt", "A", "HRERA-005"),
    ("Escrow Banks & Trustees", "escrow_for", "ALL", "B", "RERA-statute"),
    ("ELIE SAAB / ELIE SAAB Maison", "advises", "ALL", "C", "elie-saab-site"),
    ("UHA London", "architect_for", "onedxp", "C", "uha-london-site"),
    ("DTCP Haryana & Haryana RERA", "regulates", "ALL", "A", "dtcp-haryana"),
    ("HNI & UHNI Catchment Buyers", "bulk_purchaser_of", "ALL", "C", "smartworld-marketing"),
    ("MNC / IT Corporate Catchment", "bulk_purchaser_of", "ALL", "C", "smartworld-marketing"),
    ("~35,000 Retail Homebuyers", "bulk_purchaser_of", "ALL", "C", "smartworld-marketing"),
]


def _fixture_source_refs(expected_grade, src):
    """Assigns a sourceTier that reproduces the edge's existing hand-assigned grade.
    B needs two distinct corroborating sourceIds, not a single tier -- handled by the
    caller before this is reached."""
    if expected_grade == "A":
        return [ref(src, "official_government")]
    if expected_grade == "C":
        return [ref(src, "official_company")]
    if expected_grade == "D":
        return []
    raise ValueError(f"grade {expected_grade} needs explicit corroboration fixture, not a single sourceTier")


def test_smartworld_regression_fixture_reproduces_known_distribution():
    records_ = []
    for i, (name, relationship, target, expected_grade, src) in enumerate(SMARTWORLD_EDGES):
        entity_id = f"entity_{i}_{name}"
        if expected_grade == "B":
            source_refs = [ref(f"{src}-1", "independent_verification"), ref(f"{src}-2", "independent_verification")]
        else:
            source_refs = _fixture_source_refs(expected_grade, src)
        records_.append(record(entity_id, relationship, target, source_refs, name=name))

    graded = normalize(records_)
    assert len(graded) == 20

    distribution = {"A": 0, "B": 0, "C": 0, "D": 0}
    for g in graded:
        distribution[g["grade"]] += 1

    assert distribution == {"A": 13, "B": 1, "C": 5, "D": 1}
