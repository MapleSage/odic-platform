# Update for CC and Luna — 2026-07-26

> ## ⚠ CORRECTION — 2026-07-26 10:05 UTC, before you act on §2.2 or §5
>
> **Atlas's current focus is Real Estate and Retail. Not Insurance.**
>
> §2.2 below recommends The Yurconic Agency as org #2 on the grounds that US Insurance is
> the deepest cell in the CRM. That reasoning was sound about the data and wrong about the
> product — I optimised for the largest number without checking it against what Atlas is
> for. Insurance is a SageSure vertical; it is not an Atlas priority. **Decision D6 is
> retired, replaced by D10.**
>
> **What this changes:**
>
> - **CC:** org #2 is no longer Yurconic. It comes from Real Estate or Retail — see the
>   revised comparison below. C1 stands: the 126 merged registry entries are real CRM
>   records and stay (D4). Only the *sequencing* changed, not the work.
> - **Luna:** **stop L4.** Yurconic DOI resolution is dropped.
>   `docs/luna-worklist-insurance.csv` is deprioritised, not deleted (D4). L1, L2, L3, L5
>   and L6 are unchanged and still wanted.
>
> **Revised org #2 comparison, against the correct constraint:**
>
> | | Real Estate | Retail |
> |---|---|---|
> | Companies in CRM | 47 | **150 — largest cluster** |
> | Schema work | **None** — Smartworld proves `spvDefs` | C6 first; `spvDefs` does not describe a retailer |
> | Proves | Transform generalises | Transform *and* the vertical abstraction |
>
> Real Estate is the cheap validation; Retail is the bigger book and forces C6. Org #2 not
> yet picked — do not start against either until it is.
>
> **New CC task, blocking before the portal switch — B4:**
>
> All new dev work moves to portal **51752298** (D11), brought to full parity with 3475345.
> Export/import, cleaning and mapping are handled in HubSpot and are **not** an agent task.
>
> But **HubSpot does not preserve record IDs across portals.** The 126 mappings merged in
> `09e04e1` bind `sources.hubspot.companyId` to 3475345 IDs — Yurconic is `55207832972`
> there. Against 51752298 they resolve to nothing and render `unmapped`, which the honest
> status design will report as a legitimate state rather than a fault. Add a portal
> qualifier before the switch:
>
> ```json
> "hubspot": { "portalId": "3475345", "companyId": "55207832972",
>              "grade": "A", "basis": "hubspot_object_id" }
> ```
>
> Per-environment entries, or resolve the environment at load. `scripts/build_org_registry.py`
> needs the same change.
>
> **Also new (D12):** the dev portal runs HubSpot Projects with GitHub CI/CD. That is a
> deployment path for the ODIC HubSpot Cards (Company / Contact / Deal) that Claude-Design
> produced in July and which have had nowhere to go since.
>
> Live state is in `STATUS.md`. This document is a task list, not current state.


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

**C3 — ~~Scope the activity feed to the selected org.~~ ALREADY DONE — do not re-fix.**

Fixed by CC in `7f942f1` on 2026-07-24 ("Scope the intelligence feed to the org that
actually owns it"), and re-verified intact on 2026-07-26: Meridian has no
`intelligenceEntityIds`, so its events fetch never fires.

This item was raised in error. It came from the annotated screenshots dated 2026-07-22,
which predate the fix by two days — and `7f942f1` was visible in the git log at the time
the item was written. **Screenshots are not current state.** Check `git log` against any
defect before scheduling it. This is the third time work in this repo has been queued
for re-doing because a stale artifact was read as live.

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

**L4 — ~~Resolve the insurance registry leg.~~ DROPPED — see the correction at the top.**

Insurance is not Atlas's focus (D10). Stop this work.
`docs/luna-worklist-insurance.csv` is retained and deprioritised per D4, not deleted —
the resolution method it encodes is correct and will be reused.

**Replacement, once org #2 is picked from Real Estate or Retail:** same worklist shape,
different registry scheme. India RE reuses the MCA CIN + state RERA path that produced
Smartworld's [A]-grade evidence. Retail will need its own scheme decided — company
registry plus, where applicable, GST/import-export registration.

Do not start until org #2 is named.

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

## 6a. Azure resource map — added 2026-07-26

From a tenant resource export (208 resources). This closes Luna's Q1 unknown and
surfaces one decision that must be made before anything is provisioned.

### Luna's identity is known

| Identity | Resource group | Region |
|---|---|---|
| **`id-aca-luna-knowledge-auditor`** | `rg-openclaw` | East US 2 |
| `id-aca-phase2-kb-ingestion` | `rg-openclaw` | East US 2 |

Luna reported it could not inspect its own principal from inside the container. It does
not need to — the identity is named, co-located with `ca-openclaw` / `env-openclaw`, and
its role assignments are readable from the portal. **Ops: pull the role assignments for
`id-aca-luna-knowledge-auditor` and record them here.**

### Six search services — pick one shared index

| Service | Resource group | Region |
|---|---|---|
| `oc-search` | `rg-openclaw` | East US 2 |
| `sage-search` | `rg-openclaw` | West US 2 |
| `sageinsure-search` | `sageinsure-rg` | East US |
| `sagesure-search` | `DefaultResourceGroup-CID` | Central US |
| `sagecmo-search` | `SageCMO` | East US |
| `srch-sageinfra-new-dev01` | `rg-sageinfra-new-dev01` | East US |

`oc-search` is co-located with Luna's ACA. `sageinsure-search` is the natural home for
insurance content.

**Risk:** if Luna indexes into one service and Atlas points at another, neither sees the
other's data and it fails *silently* as `unavailable` — the same failure Smartworld shows
today. This is the `data/orgs/` vs `data/exposure-network/` divergence repeating one
layer down, now across four regions and six billable services.

**Decision required:** one service + one index name as the Atlas↔Luna shared corpus.
Smartworld's registry entry already claims
`azureSearch.entityId: "organization:smartworld-developers"`, so an index somewhere
already holds that content. **Find which one first** — the `unavailable` status may
resolve with zero provisioning.

### Env var names: the spec is wrong, the code is right

`azure_search.py:28` gates on:

```
ATLAS_AZURE_SEARCH_ENDPOINT
ATLAS_AZURE_SEARCH_INDEX
AZURE_SEARCH_API_KEY
```

Requirements §12 lists `AZURE_SEARCH_ENDPOINT` — **unprefixed**. Anyone provisioning
from the spec sets the wrong name, `configured()` returns `False`, and the source reports
`unavailable`, indistinguishable from having no credentials. §12 itself says to use the
actual runtime configuration rather than invent names, so §12 is the thing to correct.

**Check whether the deployment already has wrong-named variables set** before concluding
credentials are missing.

### Key Vault: prefer removing the secret over duplicating it

There is no Key Vault in `rg-openclaw` (East US 2); the nearest is `kv-openclaw-cid`
(Central India). Adding `kv-openclaw` in East US 2 is reasonable — but a second vault is
a second place the same secret can drift, and this project has now hit that shape three
times (two org stores, six search services, two vaults).

**Better:** Azure AI Search supports RBAC. Granting `id-aca-luna-knowledge-auditor` the
*Search Index Data Contributor* role removes `AZURE_SEARCH_API_KEY` from circulation
entirely — nothing to store, nothing to rotate, nothing to diverge.

**Blocker for that:** `azure_search.py:65` sends `"api-key": os.environ[...]` and has no
token-credential path. §12 already anticipates "or managed identity configuration"; the
code does not implement it. Adding a `DefaultAzureCredential` branch is a small CC task
and it deletes a secret rather than copying it.

If a second vault is still wanted, state which vault owns which secrets. No key should
exist in both.

### Deployment shape (confirms the ACA / AKS split)

| | ACA (internal) | AKS (GTM / Kata) |
|---|---|---|
| OpenClaw | `ca-openclaw`, `env-openclaw` — East US 2 | `aks-openclaw-cid` — Central India |
| Also present | `ca-openclaw-cid`, `ca-openclaw-rahul`, `ca-sagesure-runner` | `sagesure-aks-prod`, `aks-sageinfra-new-dev01` |

The plugin-route contract in §3.1 is unaffected by which of these Luna runs on — only
the credential differs.

---

## 7. Open items, with owners

| Item | Owner | Blocking? |
|---|---|---|
| ~~Managed identity principal ID~~ — resolved: `id-aca-luna-knowledge-auditor`. Role assignments still need reading | Ops | No |
| **Which search service + index is the shared corpus** | Ops + CC | **Yes — blocks Azure Search for both sides** |
| Locate the index already holding `organization:smartworld-developers` | Ops | Yes — may resolve `unavailable` with no provisioning |
| Correct §12 env var names to the `ATLAS_`-prefixed form | CC | No, but causes silent misconfiguration |
| Managed-identity path in `azure_search.py` (removes `AZURE_SEARCH_API_KEY`) | CC | No — but decides whether a second Key Vault is needed |
| ACA production egress allowlist | Ops | No — only matters if push is revisited |
| Actual cron expressions (`openclaw cron list` on the deployment) | Ops | No |
| Wall-clock discovery cost | Luna (L2) | Yes, for sequencing C6 |
| 3 manifest blockers | Luna (L3) | Unknown until reported |
| Backfill `industry` (547 companies) and `country` (542) | RevOps | No — but every vertical count is a floor until done |
