#!/usr/bin/env python3
"""
Build Atlas org-registry entries from HubSpot companies.

Emits `data/orgs/index.json` entries with the HubSpot leg populated and every other
source leg explicitly null. Nulls are correct, not missing: they render as `unmapped`
in the UI, which is honest. Never guess an ID.

Rule #7 (no name-only entity matching) is enforced structurally here -- the only
mapping this script asserts is `hubspot.companyId`, which is an object-ID lookup and
therefore graded A. Registry, Azure Search and Neo4j legs are left for a resolution
run to fill with provenance.

Usage
-----
    export HUBSPOT_ACCESS_TOKEN=...
    python scripts/build_org_registry.py --industry INSURANCE --out /tmp/registry.json
    python scripts/build_org_registry.py --all --out /tmp/registry.json
    python scripts/build_org_registry.py --industry INSURANCE --worklist /tmp/work.csv

Merging into the live registry is a deliberate, reviewed step. This script never
writes to data/orgs/index.json directly.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

HUBSPOT_SEARCH_URL = "https://api.hubapi.com/crm/v3/objects/companies/search"
HUBSPOT_ACCOUNT_INFO_URL = "https://api.hubapi.com/account-info/v3/details"
PROPERTIES = ["name", "domain", "country", "industry", "num_associated_contacts"]

# Legal-form suffixes stripped when deriving a slug. Order matters: longest first.
LEGAL_SUFFIXES = [
    "private limited", "pvt ltd", "pvt. ltd.", "pvt", "limited", "ltd.", "ltd",
    "incorporated", "inc.", "inc", "llc", "l.l.c.", "llp", "plc", "corporation",
    "corp.", "corp", "company", "co.", "gmbh", "s.a.", "n.v.", "b.v.", "ag",
    "group", "holdings", "holding",
]

# Registry scheme per market. The authoritative external identity differs by
# jurisdiction; this is the lookup Luna must perform, not something to infer.
REGISTRY_SCHEME = {
    "India": "in-mca-cin",
    "United States": "us-doi-licence",
    "United Arab Emirates": "ae-trade-licence",
    "Canada": "ca-corp-number",
    "United Kingdom": "uk-companies-house",
}


def slugify(name: str, domain: str | None, taken: set[str]) -> str:
    """Stable, collision-free slug. Falls back to the domain label, then a counter."""
    base = (name or "").lower()
    base = re.sub(r"[|/,&()]+", " ", base)
    for suffix in LEGAL_SUFFIXES:
        base = re.sub(rf"\b{re.escape(suffix)}\b", " ", base)
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    base = re.sub(r"-{2,}", "-", base)

    if not base and domain:
        base = re.sub(r"[^a-z0-9]+", "-", domain.split(".")[0].lower()).strip("-")
    if not base:
        base = "org"

    slug = base
    if slug in taken and domain:
        # Disambiguate with the domain label, but only if it actually differs from
        # the base -- otherwise "metlife" + "metlife.com.tr" yields "metlife-metlife".
        label = re.sub(r"[^a-z0-9]+", "-", domain.split(".")[0].lower()).strip("-")
        if label and label != base:
            slug = f"{base}-{label}"
        else:
            # Fall back to the domain's country/TLD suffix, e.g. metlife-com-tr.
            suffix = re.sub(r"[^a-z0-9]+", "-",
                            ".".join(domain.lower().split(".")[1:])).strip("-")
            if suffix:
                slug = f"{base}-{suffix}"
    n = 2
    while slug in taken:
        slug = f"{base}-{n}"
        n += 1
    taken.add(slug)
    return slug


def fetch_portal_id(token: str) -> str:
    """Every companyId in this registry is a HubSpot object ID, which is only
    meaningful within the portal it was fetched from -- record IDs do not survive a
    cross-portal import or a dev/prod portal switch. Stamping the source portal on
    every mapping turns a silent "resolves to nothing, looks unmapped" failure into a
    detectable "portal mismatch" one. Fail loudly rather than emit unqualified IDs."""
    req = urllib.request.Request(
        HUBSPOT_ACCOUNT_INFO_URL,
        headers={"Authorization": f"Bearer {token}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.load(resp)
    except urllib.error.HTTPError as exc:
        sys.exit(f"HubSpot account-info API error {exc.code}: {exc.read().decode()[:400]}")
    portal_id = body.get("portalId")
    if not portal_id:
        sys.exit("HubSpot account-info response had no portalId -- refusing to emit unqualified companyId mappings")
    return str(portal_id)


def fetch_companies(token: str, industry: str | None) -> list[dict]:
    """Page through the HubSpot search API. Returns raw company records."""
    out: list[dict] = []
    after: str | None = None
    while True:
        payload: dict = {"properties": PROPERTIES, "limit": 100}
        if industry:
            payload["filterGroups"] = [
                {"filters": [{"propertyName": "industry",
                              "operator": "EQ", "value": industry}]}
            ]
        if after:
            payload["after"] = after

        req = urllib.request.Request(
            HUBSPOT_SEARCH_URL,
            data=json.dumps(payload).encode(),
            headers={"Authorization": f"Bearer {token}",
                     "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = json.load(resp)
        except urllib.error.HTTPError as exc:
            sys.exit(f"HubSpot API error {exc.code}: {exc.read().decode()[:400]}")

        out.extend(body.get("results", []))
        after = body.get("paging", {}).get("next", {}).get("after")
        if not after:
            return out


def to_registry_entry(company: dict, taken: set[str], now: str, portal_id: str) -> dict:
    props = company.get("properties", {}) or {}
    name = (props.get("name") or "").strip()
    domain = (props.get("domain") or "").strip() or None
    country = (props.get("country") or "").strip() or None
    contacts = int(props.get("num_associated_contacts") or 0)

    # Packs are provisional. An org gets workspace-data once a connector actually
    # serves it; exposure-network once a graph exists. Do not grant packs by default.
    packs = ["gia"]
    if contacts > 0:
        packs.insert(0, "workspace-data")

    return {
        "id": slugify(name, domain, taken),
        "name": name,
        "packs": packs,
        "sources": {
            "hubspot": {
                "companyId": str(company.get("id")),
                "portalId": portal_id,
                "grade": "A",
                "basis": "hubspot_object_id",
                "resolvedAt": now,
            },
            "registry": {
                "scheme": REGISTRY_SCHEME.get(country or "", None),
                "entityId": None,
                "grade": None,
                "basis": None,
            },
            "azureSearch": {"entityId": None},
            "neo4j": {"nodeId": None},
        },
        "_meta": {
            "domain": domain,
            "country": country,
            "industry": props.get("industry"),
            "associatedContacts": contacts,
        },
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    grp = ap.add_mutually_exclusive_group(required=True)
    grp.add_argument("--industry", help="HubSpot industry enum, e.g. INSURANCE")
    grp.add_argument("--all", action="store_true", help="every company in the portal")
    ap.add_argument("--out", help="write registry entries here (JSON)")
    ap.add_argument("--worklist", help="write the Luna resolution worklist here (CSV)")
    args = ap.parse_args()

    token = os.environ.get("HUBSPOT_ACCESS_TOKEN")
    if not token:
        sys.exit("HUBSPOT_ACCESS_TOKEN is not set. Never hardcode the token.")

    portal_id = fetch_portal_id(token)
    print(f"portal: {portal_id}")
    companies = fetch_companies(token, None if args.all else args.industry)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    taken: set[str] = set()
    entries = [to_registry_entry(c, taken, now, portal_id) for c in companies]
    entries.sort(key=lambda e: (-e["_meta"]["associatedContacts"], e["id"]))

    if args.out:
        with open(args.out, "w") as fh:
            json.dump({"organizations": entries}, fh, indent=2)
        print(f"wrote {len(entries)} registry entries -> {args.out}")

    if args.worklist:
        with open(args.worklist, "w", newline="") as fh:
            w = csv.writer(fh)
            w.writerow(["atlas_id", "name", "domain", "country",
                        "registry_scheme", "hubspot_portal_id", "hubspot_company_id",
                        "associated_contacts", "registry_entity_id", "grade",
                        "basis", "resolved_by", "notes"])
            for e in entries:
                m = e["_meta"]
                w.writerow([e["id"], e["name"], m["domain"] or "", m["country"] or "",
                            e["sources"]["registry"]["scheme"] or "UNKNOWN",
                            e["sources"]["hubspot"]["portalId"],
                            e["sources"]["hubspot"]["companyId"],
                            m["associatedContacts"], "", "", "", "", ""])
        print(f"wrote {len(entries)} worklist rows -> {args.worklist}")

    unresolvable = sum(1 for e in entries if not e["sources"]["registry"]["scheme"])
    no_domain = sum(1 for e in entries if not e["_meta"]["domain"])
    print(f"  {len(entries)} companies")
    print(f"  {unresolvable} without a known registry scheme (country missing/unmapped)")
    print(f"  {no_domain} without a domain -- these cannot be resolved automatically")


if __name__ == "__main__":
    main()
