# Atlas — Backend/Data Brief for Luna, 2026-07-24

Supersedes `atlas-backend-data-gaps-2026-07-23.md` on priority order only — the underlying gaps described there are still accurate and verified against the live repo today (commit `7f942f1`, nothing merged since). This doc re-ranks them based on a strategic call Parvind made on 2026-07-24 and adds one new workstream (P0). Read the 07-23 doc first for the original technical detail; this doc is the update, not a replacement of that detail.

**Scope reminder, unchanged:** this is a gap list, not an implementation assignment for the frontend side. Data flow is one-way — Luna/backend produces data behind the contracts below; Claude Code's side (Atlas frontend + fastapi-orchestration wiring) consumes and displays it. No feedback loop expected back into the backend pipeline.

## Why the re-rank

Parvind's read, prompted by noticing HubSpot's own Sales Workspace/Agent: HubSpot already auto-adds companies to a workspace based on ICP match — that's a paid, already-solved feature. Atlas competing on "which companies match our ICP" is redundant with something the customer is already paying HubSpot for. The place Atlas actually adds value is **data depth per account and per person** — the org chart, the harvested contact detail, the cross-referenced intelligence — because that is *not* something HubSpot's ICP-matching gives you.

Practically: the two items the 07-23 doc ranked lowest (P3 hierarchy, P5 contact-level harvesting) are the ones that differentiate Atlas. They should not sit behind search and org-completeness in sequence — run them in parallel once P0/P1 below are addressed, not strictly after P2.

## P0 — New: bring more real orgs online (was implicit, now explicit)

Only `meridian.json` is a fully populated org data file. `smartworld.json` still does not exist (confirmed today — `services/fastapi-orchestration/data/orgs/` has only `index.json` + `meridian.json`). Every other registered org shows empty states outside its Exposure Network tab.

Ask: for every current HubSpot customer/org that should be visible in Atlas, produce a `data/orgs/<id>.json` matching the `meridian.json` schema. This is the literal blocker for "add all current HubSpot customers" — right now there is no ingestion path from HubSpot into Atlas's org registry at all; each org file today is hand-authored, not synced.

## P1 — Real search (unchanged from 07-23, still fully open)

Verified today: `GET /api/workspace/search` still takes only `org`, no query param — literally cannot search anything beyond canned per-org JSON. This is the "split-second reporting" gap — there is no query path, so there is nothing to report on in real time.

Needed: full-text + faceted search backed by the already-provisioned Azure AI Search indexes (`atlas-enterprise-intel-kb-v1` in `sagecmo-search`, `insurance-*` in `sageinsure-search`), exposed as:

```
GET /api/search?q=<query>&org=<org_id>&facet=<type>
```

Result row shape the frontend expects: `{"code": "ORG|PPL|DOC|RSK", "name": "string", "sub": "string", "tag": "string"}`; facets as `{"label": "string", "count": number}`. Open to a richer shape if that's more natural on your end — just needs to be specified back so the frontend contract can change with it.

## P2 (elevated from P3) — Hierarchical org-chart + contact-level depth, together

Merging the old P3 and P5 into one workstream since they're the actual differentiator and should ship together, not staggered.

**Org chart:** People tab today is a flat list — verified live: a person record is exactly `{name, title, dept, lastActivity}`, four fields, nothing else. Per the original Kiro requirements doc §3.2, need `reports_to` / `direct_reports` / `level` per person so the frontend can render a real hierarchy instead of a flat list. Claude Code already shipped the frontend affordance for this (clickable Key People rows opening a drill-down modal, commit `90c7d71`) — but it's a UI pattern sitting on top of the same four flat fields. There's currently nothing underneath it to drill into beyond activity-feed text mentions.

**Contact-level harvesting:** per Kiro spec §3.1 — direct dials, email, LinkedIn. None of this exists for any org yet. This was ranked lowest in the 07-23 doc; per the re-rank above, treat it as equal priority to the org chart, not an afterthought.

**Reference pattern (from HubSpot screenshots Parvind shared 2026-07-24):** the concrete UI target for "detail that goes multiple levels deep" is HubSpot's own contact record — three-panel layout: left panel is identity + quick actions (Note/Email/Call/Task/Meeting), center panel is tabbed activity history (All activities/Notes/Emails/Calls/Tasks/Meetings) with full threaded email bodies inline, right panel is stacked collapsible association cards (Companies/Lead stage tracker/Deals/Quotes), each with its own count and +Add. Atlas's Meridian workspace already has the shell of this (six tabs, graph canvas) — the gap is exactly what's listed above: no per-person activity thread, no association depth beyond the four flat fields, and nothing behind it for any org but Meridian.

## P3 (was P4) — Smartworld/M3M cron delivery bug

Unresolved and unconfirmed as of 07-23: cron job `75aeaf28-aab0-4bdf-9350-e1fff5f586b0`, delivery target `announce -> last` resolves to no route and fails closed. Still flagging since no confirmation of a fix has been seen.

## Not re-ranked, still last

Everything else in the original 07-23 doc not mentioned above stands as written there.

---
Reference: full original spec at `/Users/parvind/Downloads/ODIC-2026/Organizational Data Intelligence System - Requirements Document.md`. Prior version: `atlas-backend-data-gaps-2026-07-23.md`.
