# Atlas — Backend/Data Gaps for Codex / Luna / GPT-5.5

Compiled by Claude Code, 2026-07-23. This is a gap list only — consumption side (Claude Code) does not implement any of this. Data flow is one-way: you produce data behind these contracts, the frontend consumes and displays it. No feedback loop expected back into your pipeline.

## Priority 1 — Real search (currently blocks basic usability)

`GET /api/workspace/search` today returns one static hardcoded JSON blob per org, no query parameter at all — there is no way to search anything beyond the ~2 demo orgs' canned data.

Needed: real full-text + faceted search backed by the Azure AI Search indexes already provisioned (`atlas-enterprise-intel-kb-v1` in `sagecmo-search`, `insurance-*` in `sageinsure-search`, etc.), exposed as something like:

```
GET /api/search?q=<query>&org=<org_id>&facet=<type>
```

Frontend currently expects result rows shaped like:
```json
{"code": "ORG|PPL|DOC|RSK", "name": "string", "sub": "string", "tag": "string"}
```
and facet counts shaped like `{"label": "string", "count": number}`. Happy to adjust the contract if a richer shape is more natural for you — just needs to be specified back.

## Priority 2 — Org data completeness for every registered org

`/api/organizations` now returns a data-driven registry (`services/fastapi-orchestration/data/orgs/index.json`), but only `meridian.json` has a fully populated `organization/search/reports/graph` payload. `smartworld.json` doesn't exist yet, so Smartworld shows empty states outside its Exposure Network tab. Any org added to the index needs a matching `data/orgs/<id>.json` — use `meridian.json` as the reference schema.

## Priority 3 — Hierarchical org-chart data

People tab today is a flat list (`name/title/dept/lastActivity`), no reporting structure. Per the original Kiro requirements doc (§3.2), need `reports_to` / `direct_reports` / `level` per person so the frontend can render a real hierarchy instead of a flat list.

## Priority 4 — Smartworld/M3M cron delivery bug (Luna's own finding, unresolved)

Cron job `75aeaf28-aab0-4bdf-9350-e1fff5f586b0` — delivery target `announce -> last` resolves to no route and fails closed instead of notifying anyone. Needs an explicit delivery target/channel set. Flagging since it hasn't been confirmed fixed.

## Priority 5 — Contact-level harvesting (direct dials, email, LinkedIn)

Per Kiro spec §3.1 — none of this exists for any org yet. Lowest priority until search (P1) and org data completeness (P2) are real, since there's currently nothing to attach contact-level data to beyond the 2 demo orgs.

---
Reference: full original spec at `/Users/parvind/Downloads/ODIC-2026/Organizational Data Intelligence System - Requirements Document.md`.
