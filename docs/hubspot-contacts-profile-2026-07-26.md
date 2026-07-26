# HubSpot CRM profile and org #2 recommendation

**Date:** 2026-07-26
**Sources:** Live HubSpot query (portal 3475345), plus `HubSpot-Zoom-contacts(AutoRecovered).xlsx`
**Purpose:** Establish which vertical × geo cells have real depth, and pick organization #2 on evidence.

> **Correction notice.** An earlier revision of this document profiled only the uploaded
> spreadsheet and reported US Insurance as ~5 companies. That was wrong. The
> spreadsheet is a partial export. Live CRM shows **124 insurance companies, 89 of them
> in the US** — off by a factor of ~25. All figures below come from the live CRM.

---

## 1. Actual CRM size

| Object | Live CRM | Uploaded XLSX | XLSX coverage |
|---|---|---|---|
| Companies | **1,192** | 837 | 70% |
| Contacts | **1,690** | 1,084 | 64% |

The spreadsheet is roughly two thirds of the CRM and is not representative by vertical —
it skewed heavily toward the India textile/apparel book and under-sampled US insurance
almost entirely.

---

## 2. Vertical composition

| Vertical (grouped industries) | Companies |
|---|---|
| **Retail cluster** — Retail, Apparel & Fashion, Textiles, Consumer Goods, Luxury Goods, Supermarkets, Wholesale | **150** |
| **Insurance** | **124** |
| **Real estate cluster** — Real Estate, Commercial Real Estate, Construction, Building Materials | **47** |
| *No industry set* | **547 (46%)** |

**All three counts are floors.** With 46% of companies carrying no industry value, the
true totals are higher. Backfilling `industry` is cheap and would sharpen every number
in this document.

## 3. Geography

| Country | Companies |
|---|---|
| United States | 291 |
| India | 284 |
| United Arab Emirates | 75 |
| *Other / unset* | 542 |

## 4. The cell that matters

**US × Insurance = 89 companies.** That is the single deepest vertical × geo
intersection in the CRM, and it is SageSure's own domain.

For comparison, the entire real-estate cluster worldwide is 47.

---

## 5. What the insurance book actually contains

Top insurance companies by associated contacts:

| Company | Contacts | Country | Domain |
|---|---|---|---|
| The Yurconic Agency | 9 | US | yurconic.com |
| TRMG / The Risk Management Group | 7 | US | trmg.net |
| Ambridge Group / Ambridge Partners LLC | 5 | US | ambridge-group.com |
| IFC National Marketing | 5 | US | ifcnationalmarketing.com |
| Liberty Mutual Insurance | 3 | US | libertymutual.com |
| Manulife | 3 | Canada | manulife.com |
| CannGen, NGL, DTRIC, Insur-Fi | 2 each | US | — |

Also present: Baldwin Risk Partners, Greater New York Insurance, Pekin Insurance,
Nsure.com, National Safety & Risk, Blue Zebra (AU), Boxx (CA), APOLLO (CA), PIB Secure
(UAE), Etiqa (SG).

**This is the insurance distribution ecosystem** — agencies, MGAs, program managers,
brokers, specialty carriers. Not a random industry list.

### Why that matters for the exposure graph

An insurance distribution network has the same three-part shape as the Smartworld
value chain:

| Smartworld (real estate) | Insurance distribution |
|---|---|
| **Supply** — licensees, EPC, banks, regulators | Carriers, reinsurers, capital providers, TPAs, claims vendors, state DOIs |
| **Core** — SPVs, projects, licences, permits | MGA/agency entities, programs, books of business, appointments |
| **Demand** — bulk buyers, allottees, escrow, catchments | Retail agents, policyholders, referral partners, premium finance |

And the US public-source stack for insurance is strong — arguably richer than RERA:
NAIC annual statements, state DOI licence and appointment lookups, SERFF rate/form
filings, market conduct and financial exam reports, A.M. Best / Demotech ratings.
Insurance is one of the most heavily disclosed industries in the United States.

---

## 6. Recommendation — revised

**Organization #2: The Yurconic Agency** (US, insurance, 9 contacts, `yurconic.com`).

This reverses the earlier recommendation in this document, which named Bhartiya Group
on the strength of the partial spreadsheet. The reasoning has changed with the data:

| | Bhartiya Group (India RE) | The Yurconic Agency (US Insurance) |
|---|---|---|
| Contacts | 8 | 9 |
| Companies behind it in the same cell | ~2 | **89** |
| Schema work needed | None — `spvDefs` applies | Centre column must be abstracted |
| Source stack | MCA + RERA (proven) | NAIC, state DOI, SERFF, A.M. Best (unproven here) |
| Commercial relevance | Low | **Core business** |

**Do the schema abstraction now rather than later.** Onboarding a second India
real-estate org is cheap precisely because it proves nothing new — it exercises the
same schema against the same registry stack. Meanwhile the 89-company cell that
actually matters stays unaddressable.

### Suggested sequence

1. **P2 regression first, unchanged.** Build the normalizer, run it over Luna's
   Smartworld evidence, diff against the existing `smartworld.json`. This validates the
   transform against known-good output and is independent of which vertical comes next.
2. **Abstract the centre column.** `spvDefs` (project / SPV / CIN / RERA) becomes a
   generic core-entity shape with a per-vertical field profile. Real estate keeps its
   current profile; insurance gets entity / programs / appointments / licences.
3. **Org #2 — The Yurconic Agency.** First insurance graph, US sources.
4. **Org #3 — an India retail/textile company.** 150-company cluster, third field
   profile, and by then the abstraction is proven twice.

Real estate stays covered by Smartworld throughout; nothing is lost by not adding a
second one immediately.

---

## 7. Data quality actions, cheap and high-value

1. **Backfill `industry` on the 547 companies missing it.** Nearly half the CRM is
   invisible to any vertical analysis, including this one.
2. **Backfill `country`** — 542 companies have no country or fall outside the three
   target markets.
3. Both can be substantially inferred from domain and company name, then reviewed.

---

## 8. Notes on the uploaded spreadsheet

Retained as a secondary source. Useful properties it has that the CRM query did not
surface: job titles at high fill (98.8%), phone numbers (92.6%), and first-engagement
dates.

Structural limits, unchanged from the earlier profile:

- **No HubSpot company ID column** — only contact `Record ID`. It cannot populate
  `sources.hubspot.companyId`. The live CRM `hs_object_id` values can, and are now
  available directly (e.g. Yurconic = `55207832972`).
- **No source column** distinguishing HubSpot rows from Zoom rows.
- 707 of 837 companies in it have a single contact — a prospecting list, not an
  account base. Org charts cannot be seeded from CRM contacts alone; they need the
  registry/filings path that already worked for Smartworld.
- 1,070 emails and 1,004 phone numbers. Per the integration contract, contact detail
  stays on the federated HubSpot path rather than being loaded into the agent
  workspace.
