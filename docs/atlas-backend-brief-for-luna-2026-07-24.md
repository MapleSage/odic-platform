# Atlas — Backend/Data Brief for Luna, 2026-07-24

Supersedes `atlas-backend-data-gaps-2026-07-23.md` on priority order only — the underlying gaps described there are still accurate and verified against the live repo today (commit `7f942f1`, nothing merged since). This doc re-ranks them based on a strategic call Parvind made on 2026-07-24 and adds one new workstream (P0). Read the 07-23 doc first for the original technical detail; this doc is the update, not a replacement of that detail.

**Scope reminder, unchanged:** this is a gap list, not an implementation assignment for the frontend side. Data flow is one-way — Luna/backend produces data behind the contracts below; Claude Code's side (Atlas frontend + fastapi-orchestration wiring) consumes and displays it. No feedback loop expected back into the backend pipeline.

## Why the re-rank

Parvind's read, prompted by noticing HubSpot's own Sales Workspace/Agent: HubSpot already auto-adds companies to a workspace based on ICP match — that's a paid, already-solved feature. Atlas competing on "which companies match our ICP" is redundant with something the customer is already paying HubSpot for. The place Atlas actually adds value is **data depth per account and per person** — the org chart, the harvested contact detail, the cross-referenced intelligence — because that is *not* something HubSpot's ICP-matching gives you.

Practically: the two items the 07-23 doc ranked lowest (P3 hierarchy, P5 contact-level harvesting) are the ones that differentiate Atlas. They should not sit behind search and org-completeness in sequence — run them in parallel once P0/P1 below are addressed, not strictly after P2.

## P0 — CORRECTED, this is the actual core: generalize the Exposure Network graph so every org gets one, not just Smartworld

**This supersedes the P0 originally written above (bring more real orgs online) — that's now folded in as a sub-requirement of this one, because they're the same gap.** Parvind confirmed 2026-07-24: the bipartite drillable graph (left flank = suppliers/vendors/licensees, right flank = capital/buyers, center = platform + project/SPV entities, full drill-down into sub-entities, interlocking-directorate panel) is the actual core differentiator — "our Bloomberg Terminal style with ticker and other data." Not the flat People list, not HubSpot-style contact records — this graph, for every customer.

**What's actually there today, verified by reading the files directly:** `apps/shell/src/exposureNetwork/data.ts` (432 lines) and `ExposureNetwork.tsx` (472 lines). This is real, well-built, evidence-graded work — `SPV_DEFS` has six actual Smartworld project SPVs with CINs, RERA registration numbers, director names, land-title/SARFAESI chains; `LEFT_DEFS`/`RIGHT_DEFS` are the supplier and buyer flanks with A-D confidence grades and source IDs; `INTERLOCKS` maps shared directors across SPVs; drill-down goes card → modal → sub-entity chart → breadcrumb stack back out. Genuinely good.

**The problem:** every one of those data structures is hardcoded as literal TypeScript, specific to Smartworld Developers Pvt Ltd by name. There is no schema, no per-org JSON, no backend endpoint — nothing generic underneath. Open this tab for Meridian or any other org and there's nothing to render, because the component isn't parameterized to point at different data; it *is* the data. This exactly matches the "Exposure network backend" item already flagged in `docs/backend/backend-roadmap-next.md` (#2: "concrete relationship graph with sourced edges, confidence grades, drill-down modals, full-chart expansion, interlocking directorate panel") — that roadmap doc had this right; this brief previously under-ranked it.

**The ask:** define a generic per-org exposure-graph schema — platform node, project/SPV/entity nodes, left-flank supplier/vendor/licensee edges, right-flank capital/buyer edges, confidence grade (A-D) + source ID per edge, sub-entity children for drill-down, interlocking-directorate list — and produce a `data/orgs/<id>/exposure-network.json` (or equivalent) per customer, so the same renderer that currently only works for Smartworld can render any org. This absorbs the original "bring more real orgs online" ask (`data/orgs/<id>.json` for org/search/reports/graph) as part of the same schema-generalization work, not a separate task.

**UPDATE 2026-07-24, later same day — frontend half of this is now DONE, commit `40d089f` on `main`.** The schema described above already exists in code: `apps/shell/src/exposureNetwork/schema.ts` defines `ExposureNetworkData` (and its constituent types — `SpvDef`, `FlankDef`, `ExtraDef`, `EntityDef`, etc.) almost exactly as specified two paragraphs up. Smartworld's data has been repackaged (unchanged content) into `apps/shell/src/exposureNetwork/orgs/smartworld.ts` as the first `ExposureNetworkData` object, loaded via `apps/shell/src/exposureNetwork/registry.ts`'s `getExposureNetworkData(orgId)`. `ExposureNetwork.tsx` now takes an `orgId` prop and renders whatever the registry returns, with an explicit empty state for orgs with no file yet — it no longer has Smartworld baked in. Typechecked clean (`tsc --noEmit`, exit 0), Smartworld still renders identically.

**What's actually still needed from Luna, narrowed:** `registry.ts` is a static in-code map right now (`{ smartworld: smartworldExposureNetwork }`), explicitly marked `TODO(Luna, backend)` in both `registry.ts` and `orgs/smartworld.ts`. The real ask is now concrete and testable against real code, not hypothetical: a `GET /api/orgs/:id/exposure-network` (or equivalent) endpoint returning JSON matching the `ExposureNetworkData` shape in `schema.ts` — read that file directly, it's the contract. Once it exists, swapping `registry.ts`'s lookup for a `fetch()` is a small, contained frontend change (loading/error state added to the component), not a redesign.

## P1 — Real search (unchanged from 07-23, still fully open)

Verified today: `GET /api/workspace/search` still takes only `org`, no query param — literally cannot search anything beyond canned per-org JSON. This is the "split-second reporting" gap — there is no query path, so there is nothing to report on in real time.

Needed: full-text + faceted search backed by the already-provisioned Azure AI Search indexes (`atlas-enterprise-intel-kb-v1` in `sagecmo-search`, `insurance-*` in `sageinsure-search`), exposed as:

```
GET /api/search?q=<query>&org=<org_id>&facet=<type>
```

Result row shape the frontend expects: `{"code": "ORG|PPL|DOC|RSK", "name": "string", "sub": "string", "tag": "string"}`; facets as `{"label": "string", "count": number}`. Open to a richer shape if that's more natural on your end — just needs to be specified back so the frontend contract can change with it.

## P1.5 (elevated from P3/P5) — Hierarchical org-chart + contact-level depth, together, for EVERY org

Merging the old P3 and P5 into one workstream since they're the actual differentiator and should ship together, not staggered.

**This is a data-architecture requirement, not a UI-parity request. Not trying to rip off HubSpot.** The ask is that "person" stops being a row and becomes a real record — for every org in the registry, not just Meridian, and not as a one-off demo polish.

**What's broken today, precisely:** a person is exactly this object, verified live against `meridian.json`:
```json
{"name": "Dana Ferris", "title": "CFO", "dept": "Finance", "lastActivity": "2d ago"}
```
Four fields. Nothing else. Click a person in the Key People list and there is nowhere to go — no activity history specific to them, no phone/email/LinkedIn, no deals/documents/risks tied to that person, no reporting line. Claude Code already shipped a frontend drill-down modal for this (commit `90c7d71`), but it opens onto the same four flat fields — a UI affordance with nothing behind it.

**What "drillable" means, concretely, per person, per org:**
- `reports_to` / `direct_reports` / `level` (Kiro §3.2) — a real hierarchy, not a flat list
- direct dial, email, LinkedIn (Kiro §3.1)
- every document/risk/deal/activity-feed entry that names or involves that specific person, queryable, not just mentioned in prose

**Reference point (from HubSpot screenshots Parvind shared 2026-07-24) — for illustrating the shape, not for copying:** HubSpot's own contact record shows what a real per-person record looks like once it exists — identity panel, tabbed activity history (All activities/Notes/Emails/Calls/Tasks/Meetings) with full email threads inline, and stacked association cards (Companies/Deals/Quotes) each with a live count. That's one example of "depth," included only so there's no ambiguity about what "flat 4-field person" vs. "drillable record" means in practice. The actual deliverable is Atlas's own data model, populated for every org — Meridian, Smartworld, and everything added under P0 — not a HubSpot clone.

## P3 (was P4) — Smartworld/M3M cron delivery bug

Unresolved and unconfirmed as of 07-23: cron job `75aeaf28-aab0-4bdf-9350-e1fff5f586b0`, delivery target `announce -> last` resolves to no route and fails closed. Still flagging since no confirmation of a fix has been seen.

## Not re-ranked, still last

Everything else in the original 07-23 doc not mentioned above stands as written there.

---
Reference: full original spec at `/Users/parvind/Downloads/ODIC-2026/Organizational Data Intelligence System - Requirements Document.md`. Prior version: `atlas-backend-data-gaps-2026-07-23.md`.
