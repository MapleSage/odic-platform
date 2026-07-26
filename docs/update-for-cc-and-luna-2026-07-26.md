# Update for CC and Luna — 2026-07-26

**Read this before continuing.** Several decisions have changed since CC's Phase 1
report and since Luna's scoping answers. Two of them reverse advice given earlier in
this repo, including advice I gave.

**Who wrote this:** Cowork. The `0300fd6` commit CC flagged as a concurrent writer was
also me — not a third party. Treat it as known, not as something to reconcile against.

---

## 1. Answer to CC's open question

> *"Phase 2 (Neo4j/AuraDB) needs you to create a free Aura instance… or Phase 3
> (HubSpot) in stub mode. Your call on which to unblock first."*

**Neither. Do not provision Aura.**

Three findings make Phase 2 the wrong next move:

1. **The exposure graph has no producer.** Luna confirmed it did not create
   `data/exposure-network/smartworld.json` — that file does not exist anywhere in its
   runtime. Luna produced the *evidence*; the graph was hand-assembled from it. A graph
   database is storage for an artifact that currently has no pipeline behind it.
2. **Nothing visibly broken needs Neo4j.** The four annotated defects — Meridian's feed
   showing Smartworld content, the four-node Relationships graph, Timeline misalignment,
   "No workspace data for Smartworld" — are all fixable today with zero new credentials.
3. **AuraDB was never in the requirements.** §6 says "Neo4j"; §12 says `NEO4J_URI`.
   Aura is one hosted implementation. You already run Kubernetes, so an in-cluster Neo4j
   needs no signup and no credential passed through chat — worth knowing for when the
   graph does need a store.

**Phase 3 also doesn't need stub mode for the registry leg** — see §4.

---

## 2. Decisions that reverse earlier guidance

### 2.1 Nothing gets deleted — standing rule

Currently-empty or stubbed surfaces (org charts, reports, the Relationships canvas) are
**roadmap, not abandonment**. Absence today is not evidence something is unwanted, and
removing it destroys intent that is not written down anywhere else.

This reverses a recommendation I made to delete `apps/shell/src/exposureNetwork/data.ts`
and `orgs/smartworld.ts`. **Both stay.** `orgs/smartworld.ts` holds the hand-authored
Smartworld graph, which makes it the known-good baseline for the P2 regression test.
Annotate its header to say so, so nobody mistakes it for leftovers.

### 2.2 Org #2 is US insurance, not real estate

An earlier revision of `hubspot-contacts-profile` reported US Insurance as ~5 companies.
That was profiled from a partial spreadsheet and was wrong by ~25×.

Live CRM (portal 3475345): **1,192 companies, 1,690 contacts.**

| Vertical | Companies |
|---|---|
| Retail cluster | 150 |
| **Insurance** | **124 (89 US)** |
| Real estate cluster | 47 |
| *No industry set* | 547 (46%) |

**US × Insurance = 89 is the deepest cell in the CRM**, and it is SageSure's own
domain. Org #2 is **The Yurconic Agency** (`yurconic.com`, HubSpot ID `55207832972`,
9 contacts).

Consequence: the centre-column abstraction moves **earlier**, not later. Adding a second
India real-estate org is cheap precisely because it proves nothing — same schema, same
registry stack — while the cell that matters stays unreachable.

---

## 3. Architecture decisions now settled

### 3.1 Atlas pulls from Luna. The cron webhook is a doorbell.

**Verified in `openclaw`:** `src/gateway/server/plugins-http.ts` and
`plugin-route-runtime-scopes.ts` let a plugin register HTTP routes with per-route
`auth: "gateway"` and runtime scope surfaces, failing closed before any handler runs.
That is the "expose APIs, not the whole thing" mechanism, and it is the sanctioned seam
per OpenClaw's own `AGENTS.md`.

Push was considered and rejected on verified behaviour: cron webhook delivery in
`src/gateway/server-cron.ts` is `void (async () => …)()` with `logger.warn` on failure —
**fire-and-forget**, no requeue. Job-level `retry` covers execution, not delivery. It
also passes through `fetchWithSsrFGuard`, which blocks private/VNet targets.

So: Luna's cron fires a doorbell (`{jobId, summary, status}` — trigger only, Atlas never
parses intelligence from it), and Atlas pulls the real payload from scoped plugin routes.
A dropped doorbell is recovered by the next scheduled pull.

One plugin serves both deployments. Only the credential differs — Entra service
principal on AKS/Kata (`src/gateway/oidc-entra.ts` already exists), gateway bearer token
on ACA.

### 3.2 Store edges, derive columns at render

**This is the most consequential call in the contract.**

`spvDefs`, `leftDefs`, `rightDefs`, `interlocks`, `promoterNetwork` are **layout
buckets**, not a graph. Storing layout discards the relationship type, which makes the
columns unrecomputable when the rules change — and they will change, because insurance
and retail need different column rules over the same edges.

Store Luna-shaped edge records. Apply a per-vertical relationship→column table at view
time. A new vertical then becomes a new mapping table, not a schema migration.

### 3.3 Meridian is fictional

Meridian Health Systems was invented by Claude-Design as demo data. It is not a CRM
record. Therefore:

- CC's Phase 1 result — `unmapped` on all three sources — is **correct**, not a gap.
- Meridian's feed rendered Smartworld content because Meridian has no content and the
  system fell back to the only real data present.
- **§16's "Meridian resolves through an explicit HubSpot Company ID" is unsatisfiable**
  as written. Satisfying it would require fabricating a CRM record, breaking rule #6.
  Treat that DoD line as retired, or re-point it at Yurconic.

### 3.4 The two-data-store divergence is already closed for the graph half

`registry.ts` fetches `GET /api/orgs/:id/exposure-network`; `data.ts` is marked
deprecated in its own header and nothing imports it (grep-verified). CC's flag from
Phase 1 is resolved. What remains is the *workspace* half — `data/orgs/<id>.json`
becomes registry-derived rather than canonical, which is §5 work, not Phase 2 work.

---

## 4. Work for CC, in order

**Immediately unblocked, no credentials, no decisions pending:**

**C0 — Annotate, don't delete.** Header comments on `data.ts` and `orgs/smartworld.ts`
marking them retained-and-inactive, with `orgs/smartworld.ts` named as the P2 baseline.

**C1 — Load the registry.** `scripts/build_org_registry.py` is in the repo. It pages
the HubSpot search API and emits entries with the HubSpot leg populated and every other
leg explicitly null. `docs/registry-insurance-proposed.json` has all 124 insurance
companies already generated — 124 unique slugs, no collisions. Review and merge into
`data/orgs/index.json`.

The mapping shape adds provenance to the registry itself, which it previously lacked:

```json
"hubspot":     { "companyId": "55207832972", "grade": "A",
                 "basis": "hubspot_object_id", "resolvedAt": "..." },
"registry":    { "scheme": "us-doi-licence", "entityId": null,
                 "grade": null, "basis": null },
"azureSearch": { "entityId": null },
"neo4j":       { "nodeId": null }
```

`grade: A` because an object ID is a lookup, not an inference. Nulls render as
`unmapped` — which Phase 1 already does correctly.

**C2 — Honest per-surface state.** Smartworld's packs are `["exposure-network","gia"]`,
so `EMPTY_WORKSPACE` is correct behaviour. Do **not** hide tabs for missing packs —
that encodes absence as intentional. Show the surface with `Not yet ingested` /
`Pending`, reusing the §8 source-status vocabulary. Kills the "No workspace data" dead
end without removing anything.

**C3 — Scope the activity feed to the selected org.** Meridian must never render
Smartworld's dossier text. §10 violation, live today, no connector required to fix.

**Then, in dependency order:**

**C4 — Ingestion storage.** Edge-shaped store per §3.2 of the contract, `lastIngestedAt`
per record. Do not touch the render path. *Gate:* records round-trip, UI unchanged.

**C5 — Normalizer + Smartworld regression.** Grade derivation including the
corroboration pass. Run over Luna's Smartworld evidence, diff against the retained
`orgs/smartworld.ts`. *Gate:* ~60 records reproduced, distribution near A=13 / B=1 /
C=5 / D=1. **Do not onboard org #2 before this diff passes.**

**C6 — Abstract the centre column.** `spvDefs` becomes a generic core-entity shape with
a per-vertical field profile. Real estate keeps its current profile; insurance gets
entity / programs / appointments / licences.

**C7 — Derive columns at render.** *Gate:* Smartworld renders identically to today.

**C8 — Pull loop, reconcile, doorbell receiver.** *Gate:* killing the doorbell mid-run
still converges on the next scheduled pull.

Do not fix the Relationships tab before C7. The four-node graph is a faithful build of a
labelled placeholder in the design canvas (`relationship graph canvas -- force-directed
org / person / document network`) — not a deviation. It is holding the slot for the org
chart, and C7 fulfils it.

---

## 5. Work for Luna

**Your scoping answers are received and folded into
`luna-atlas-integration-contract-2026-07-25.md`.** Three of your answers changed the
design; thank you for marking unverified items as unverified rather than guessing.

**L1 — Expose the plugin routes.** Read-only, scope-gated, no write path into Luna at
all. Proposed surface:

```
GET /api/plugins/atlas/evidence?org=<id>&since=<iso8601>&cursor=<opaque>
GET /api/plugins/atlas/manifest?runId=<id>
GET /api/plugins/atlas/manifest/latest?org=<id>
GET /api/plugins/atlas/source-register?org=<id>
GET /api/plugins/atlas/dossiers?org=<id>
```

**L2 — Add run timing to every manifest**, as you proposed:
`runStartedAtUtc`, `runFinishedAtUtc`, `durationSeconds`, `recordsFetched`,
`recordsChanged`. Nothing can be costed until this exists. Note that the 964s run you
cited was 31 items with 0 adds and 0 updates — a no-change refresh. Discovery cost is
still unmeasured.

**L3 — Report the 3 blockers** on the latest manifest run. They appear in the summary
and nobody has looked at them. Blockers on a monitoring run quietly become permanent.

**L4 — Resolve the registry leg.** `docs/luna-worklist-insurance.csv` — 124 rows,
sorted by contact count. For the **89 US rows**, resolve domain → legal entity → state
DOI licence number. Fill `registry_entity_id`, `grade`, `basis`. Start with
`the-yurconic-agency` / `yurconic.com`.

US insurance public sources are strong — NAIC annual statements, state DOI licence and
appointment lookups, SERFF rate/form filings, market conduct and financial exams,
A.M. Best / Demotech. Arguably richer than RERA.

**L5 — Keep both grading axes.** Your model separates *who said it* (`source_tier`) from
*how sure we are* (`confidence`); Atlas's A/B/C/D conflates them. Keep both in the
payload and let Atlas derive the display letter. Mapping:

| Condition | Grade |
|---|---|
| `source_tier = official_government` | A |
| ≥2 independent non-official sources agreeing on the same claim | B |
| `source_tier = official_company` | C |
| No source, or explicitly flagged hypothesis | D |

**B is derived, not mapped** — it is a property of corroboration count, so evidence must
be grouped by claim before grading. That is the one non-mechanical step.

**L6 — Publish the source register.** `HRERA-001`…`011` resolve correctly in
`source_register.csv`, but that file is local-only. It needs to be reachable through L1
or the graders have nothing to dereference.

---

## 6. Reference

| Document | Covers |
|---|---|
| `luna-atlas-integration-contract-2026-07-25.md` | Plugin routes, pull+doorbell, record shape, grade and column mapping, validation, retention policy |
| `org-onboarding-scope-2026-07-25.md` | What org #2 requires; Luna's answers; what's automated vs manual |
| `hubspot-contacts-profile-2026-07-26.md` | Live CRM profile, vertical × geo, org #2 rationale |
| `registry-insurance-proposed.json` | 124 generated registry entries |
| `luna-worklist-insurance.csv` | Luna's resolution worklist |
| `scripts/build_org_registry.py` | Reproducible generator — prefer over the static JSON |

Claims in these docs are tagged **[VERIFIED]** with a file reference or **[PROPOSED]**
for sign-off. Do not build on a proposal as though it were a finding.

---

## 7. Open items, with owners

| Item | Owner | Blocking? |
|---|---|---|
| Managed identity principal ID + role assignments | Ops | No — pull model doesn't need it |
| ACA production egress allowlist | Ops | No — only matters if push is revisited |
| Actual cron expressions (`openclaw cron list` on the deployment) | Ops | No |
| Wall-clock discovery cost | Luna (L2) | Yes, for sequencing C6 |
| 3 manifest blockers | Luna (L3) | Unknown until reported |
| Backfill `industry` (547 companies) and `country` (542) | RevOps | No — but every vertical count is a floor until done |
