# ODIC/Atlas — Full Project Handover, 2026-07-24

**One consolidated reference for CC (frontend) and Luna (backend/data).** Supersedes reading five scattered docs to reconstruct the current picture — this is the whole picture. Detail docs still exist and are linked below where useful, but this file is the entry point.

## The strategic call (Parvind, 2026-07-24)

HubSpot's own paid Sales Workspace/Agent already auto-adds companies to a workspace based on ICP match. Atlas competing on "which companies match our ICP" is redundant with a feature the customer already pays HubSpot for. **Atlas's actual differentiator is data depth per account and per person** — org structure, contact-level detail, sourced relationship graphs — none of which HubSpot's ICP-matching gives you. Everything below is ranked against that.

Also confirmed directly: this is not about copying HubSpot's UI. Reference screenshots of HubSpot's contact-record layout (three-panel: identity, tabbed activity history, stacked association cards) were used only to illustrate what "a real per-person record" looks like once one exists — the deliverable is Atlas's own data model, not a HubSpot clone.

## Priority order, current

### P0 — Exposure Network graph, generalized off Smartworld hardcoding (frontend half DONE, backend half open)

The bipartite drillable relationship graph (left = suppliers/vendors/licensees, right = capital/buyers, center = platform + project/SPV entities, confidence-graded A-D edges, sub-entity drill-down, interlocking-directorate panel) is the actual core capability — "our Bloomberg Terminal style with ticker and other data," Parvind's words. This was specified from day one in the original Claude Design handoff (`design_handoff_odic_intelligence_platform/README.md`, 2026-07-19), which explicitly called for a generic "backing intelligence object API." What shipped instead was 432 lines of literal Smartworld-only TypeScript that no other org could ever populate.

**Frontend (CC) — done, commit `40d089f` on `main`, 2026-07-24, by Cowork (exception, see process note below):**
- `apps/shell/src/exposureNetwork/schema.ts` — generic `ExposureNetworkData` type + theme constants
- `apps/shell/src/exposureNetwork/orgs/smartworld.ts` — Smartworld's data, unchanged content, repackaged
- `apps/shell/src/exposureNetwork/registry.ts` — `getExposureNetworkData(orgId)` loader, static map for now
- `ExposureNetwork.tsx` — takes `orgId` prop, renders an explicit empty state for orgs with no data file
- `main.tsx` — both render sites + summary card + GIA context builder now pass/use `activeOrg.id`
- Verified: `tsc --noEmit` clean, exit 0. Not yet verified: actual browser render, and no second org has been onboarded to prove the pattern in practice.
- Full detail: `docs/handoff-2026-07-24-exposure-network-generalized.md`

**Backend (Luna) — open:** `registry.ts` is a static in-code map (`TODO(Luna, backend)` marked directly in the file). Needed: `GET /api/orgs/:id/exposure-network` (or equivalent) returning JSON matching `ExposureNetworkData` in `schema.ts` — read that file directly, it's the literal contract. Swapping the registry lookup for a `fetch()` is a small, contained frontend change once this exists.

### P1 — Real search (fully open, both sides)

`GET /api/workspace/search` still takes only `org`, no query param at all — cannot search anything beyond canned per-org JSON. No query path means nothing to report on in real time.

**Backend (Luna):** full-text + faceted search backed by the already-provisioned Azure AI Search indexes (`atlas-enterprise-intel-kb-v1` in `sagecmo-search`, `insurance-*` in `sageinsure-search`), exposed as `GET /api/search?q=<query>&org=<org_id>&facet=<type>`. Result row shape: `{"code": "ORG|PPL|DOC|RSK", "name": "string", "sub": "string", "tag": "string"}`, facets as `{"label": "string", "count": number}`.

**Frontend (CC) — separate bug, found today, not yet fixed:** `SearchWorkspace` in `main.tsx` builds its `/api/search` request with only `q` and `facet` — **it never sends `org`**. This means the Search tab always searches globally regardless of which workspace is active. This is the concrete cause of the bug Parvind screenshotted (Smartworld workspace showing Meridian search results). Fix: default `org` to the active workspace's id, make cross-org search an explicit opt-in toggle rather than the silent default. Not yet implemented — flagging here so it doesn't get lost among the other threads.

### P1.5 — Hierarchical org-chart + contact-level depth, for every org (open, both sides, but mostly backend)

A person today is exactly `{"name", "title", "dept", "lastActivity"}` — four fields, verified live against `meridian.json`. Click a person in Key People and there's nowhere to go: no activity history specific to them, no phone/email/LinkedIn, no deals/documents/risks tied to them, no reporting line. CC already shipped a frontend drill-down modal for this (commit `90c7d71`) — it opens onto the same four flat fields, a UI affordance with nothing behind it yet.

**Backend (Luna):** add `reports_to` / `direct_reports` / `level` per person (Kiro §3.2, real hierarchy not a flat list) and direct dial / email / LinkedIn (Kiro §3.1). Also: every document/risk/deal/activity-feed entry that names a specific person should be queryable by that person, not just mentioned in prose.

**Not HubSpot parity** — the HubSpot contact-record screenshots (three-panel: identity / tabbed activity / stacked association cards with live counts) are referenced only as an example of what "depth" looks like once built, not a UI to replicate.

### P0-adjacent — org data completeness (folded into P0 above, not separate)

Only `meridian.json` is a fully populated org file. `smartworld.json` doesn't exist as a separate data file (Smartworld's data currently lives in the Exposure Network's own `orgs/smartworld.ts`, a different system — see architecture note below). Every other registered org shows empty states outside whatever tab it has data for. There is no ingestion path from HubSpot into Atlas's org registry — every org file today is hand-authored.

### P2 — Smartworld/M3M cron delivery bug (open, unconfirmed fixed)

Cron job `75aeaf28-aab0-4bdf-9350-e1fff5f586b0`, delivery target `announce -> last` resolves to no route, fails closed. Flagged since 07-23, no confirmation of a fix seen since.

## Architecture note: two separate per-org data systems exist today, not one

Worth naming explicitly because it's a real gap in itself: `apps/shell/src/exposureNetwork/orgs/<id>.ts` (the graph) and `services/fastapi-orchestration/data/orgs/<id>.json` (organization/search/reports/graph-tab-summary) are two different data stores keyed by the same org ids, maintained separately, with no defined relationship between them. Onboarding a real second org means populating both, and nothing currently enforces or even checks that they agree with each other. Worth Luna and CC agreeing on whether these should eventually be one schema/source before a third org gets onboarded and the divergence compounds.

## Process note

The P0 frontend work above was committed directly by Cowork (`40d089f`), outside the normal division of labor — CC owns frontend code, Luna owns backend/data, Cowork does investigation/coordination/handoff docs. This was an explicit one-time exception (Parvind asked directly, it was done), not a new pattern. Logged in full, including the correction, in `sagesure-us/OPENCLAW_SHARED_MEMORY.md` §62 and in `docs/handoff-2026-07-24-exposure-network-generalized.md`.

## Reference material

- Original day-one design spec: `design_handoff_odic_intelligence_platform/README.md` + the three `.html` mockups in that folder — read this before touching Workspace Shell, Exposure Network, or HubSpot Cards, it is more specific than any brief written since.
- HubSpot reference screenshots (39 files, `/Volumes/Macintosh HD Ext/HubSpot screenShots/`, 2026-07-22): confirm the three-panel contact-record depth pattern referenced in P1.5, and HubSpot's own multi-level nav (Marketing/Content/Sales/Revenue/Service/Data Management/Automation/Reporting, each expanding to 10-15 sub-items) as one example of "detail that goes multiple levels deep."
- Prior gap docs (still accurate in their own detail, this file is the priority-order update): `docs/atlas-backend-data-gaps-2026-07-23.md`, `docs/atlas-backend-brief-for-luna-2026-07-24.md`, `docs/backend/backend-roadmap-next.md`.
