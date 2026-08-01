# Atlas / ODIC Platform — LOG

> **Append-only. Never edit or delete an entry.** If something here turns out to be
> wrong, add a new entry correcting it — do not rewrite history. Corrections are the
> most valuable entries in this file.
>
> For *current state*, see `STATUS.md`. This file answers *what happened*, not *what is
> true now*.

**Write access is strictly Claude (Cowork).** Neither CC nor OpenClaw/Luna
(GPT-5.6-Sol) may edit this file, regardless of access level. They report; Cowork
records. See `STATUS.md` § Authority.

**Format:** `## YYYY-MM-DD HH:MM UTC — ACTOR — TYPE — one-line claim`
**Types:** `SHIPPED` `DECISION` `DEVIATION` `CORRECTION` `HANDOFF` `BLOCKER` `FINDING`

**Entry discipline** — borrowed from `sagesure-us/VERIFICATION_LOG.md`:
**no entry without a command, file read, or commit attached.** An agent summary is
class 1 and does not close anything on its own. Tag the evidence class where it matters.

The header alone should tell a reader the status, date, actor and claim without opening
the entry.

Newest entries at the top.

---

## 2026-07-26 15:10 UTC — CC — SHIPPED `7f43750` / `backend:v18` — OPS7 done, C5 scaffolded; §3.4's edge vocabulary is invented and the real one wins → D16
**OPS7 complete.** Every HubSpot mapping now carries `portalId` alongside `companyId`.
The generator stamps it automatically and **refuses to emit unqualified mappings** when it
cannot determine the portal. Connector-status now reports a portal *mismatch* explicitly
rather than letting it masquerade as `unmapped`. Verified against real state and a
simulated mismatch via `kubectl exec` (class 4).

That last part matters more than the field itself: B4's danger was never the missing
qualifier, it was that the failure would present as a legitimate state. It is now loud.

**C5 scaffolded, with its limits stated.** `normalizer.py` implements grade derivation and
the full §3.5 validation ruleset. 17 tests pass on the deployed pod, including a
regression fixture built from Smartworld's real 20 edges that reproduces
**A=13 / B=1 / C=5 / D=1 exactly**.

Notably, CC counted corroboration over **distinct source IDs, not record count** — which
is the correct reading of B and was not spelled out in the contract. Two records citing
the same source are not independent verification.

This is *not* the P2 gate; that needs Luna's real evidence via L1. It means P2 becomes
wiring rather than a from-scratch build.

### D16 — the real edge vocabulary wins; §3.4's is retired

CC surfaced, rather than quietly translating around, that Smartworld's actual edge labels
do not match §3.4's table:

| Real (in production data) | §3.4 (invented by Cowork) |
|---|---|
| `land_licensee_of` | `licensee_of` |
| `buyer_catchment` | `bulk_purchaser_of` |
| `escrow_account_holder` | `escrow_for` |

**This is my error, and the second instance of the same one.** §3.4 is tagged
**[PROPOSED]** — I wrote a canonical vocabulary from scratch without checking what the
production data already used. Identical in shape to the `ATLAS_`-prefixed env var mistake:
invent a naming scheme, then discover the deployed system already had one.

**Resolution:** the observed labels are [VERIFIED] production data; my table is a
proposal. **Seed the mapping table from actual observed labels per vertical.** Do not make
Luna translate into a vocabulary I made up. Retail and insurance will bring their own
labels, which is precisely why C6 makes the table per-vertical — so the table is *derived
from data*, never invented ahead of it.

CC translated only inside the test fixture and flagged it. That is the right call, and the
opposite of the failure recorded in OpenClaw's own `CLAUDE.md`: a fix that silences an
error without producing the real data behind it.

## 2026-07-26 14:55 UTC — Luna — FINDING — git checkout still broken; SSH key absent from runtime; third stale read
Luna reports `/workspace/users/odic-platform` remains unusable — `.git` points to a missing
`/tmp/odic-gitdirs/odic-platform.git`. **OPS3 is unresolved.**

**Contradiction with the 11:20 access report (→ OPS10).** That report stated
"Repository-specific SSH deploy key: enabled and verified." Luna now reports "No SSH key is
present in this runtime." Most plausible reconciliation: the key did not survive a
container restart, which is the same non-persistence problem as OPS3 rather than a separate
fault. Not verified — someone should confirm whether the key exists on GitHub's side and
simply isn't persisted in the container.

Consequence for B7: if the key is absent from the runtime, Luna currently has **no working
write path** to the repo. That lowers urgency but does not resolve B7 — the grant still
exists on GitHub and nothing prevents re-provisioning.

**Third stale read.** Luna reports `main` at `f7cc863`. CC pushed `7f43750` at 15:10.
Same pattern as the B6 "env vars absent" report. Luna should read `STATUS.md` and `git
ls-remote` at the start of a report, not rely on carried state.

Luna also corrected its own name in `/workspace/users/IDENTITY.md` and logged it to
`.learnings/LEARNINGS.md`. Workspace files, nothing repo-side to commit.

## 2026-07-26 13:46 UTC — CC — FINDING — B6 settled with class-4 evidence; Atlas is wired and querying live
Pod `atlas-backend-7b47cf79d5-5fl8j`, image `backend:v17`, created 10:35 UTC. All three
env vars set, `configured()` returns `True`, live query against
`atlas-enterprise-intel-kb-v1` succeeds — **1 result, the canary doc**.

**B6 resolved. OPS8 done.** Luna's "environment variables are absent" read predates the
v17 rollout at 10:35 UTC. The contradiction was a stale read, as suspected — but it was
settled by a query, not by the assumption. That is the standard: pod name, image tag,
creation time, and a live result.

This also confirms B5's shape empirically rather than by inference: Atlas connects
successfully and returns exactly one document. The "working, no data" failure mode is now
observed, not predicted. **OPS9 is the thing that changes it.**

**CC's clarification on D10 vs C1, accepted and recorded as a note under D10:** the D10
focus reversal does *not* invalidate the C1 registry merge. The 124 insurance companies
are real HubSpot records with real object IDs — unprioritised, not wrong. They stay, which
is also what D4 requires. Nothing about them needs rolling back.

**Policy check, unprompted and worth recording:** both CC and Luna independently declined
to write to `LOG.md` / `STATUS.md`, citing the Cowork-only rule, and both relayed findings
for Cowork to record instead. The authority rule is being honoured. OPS1 remains open
because honoured-by-convention is not the same as enforced — but the convention is holding
in the meantime.

**Stale item in Luna's carry-forward list:** it still lists B6 as "a contradiction
requiring one live query." That was true when written and is now closed. Luna should
refresh from `STATUS.md` rather than from its own carried notes — the exact failure mode
this tracker exists to prevent.

## 2026-07-26 11:40 UTC — Parvind — DECISION — org #2 is M3M India; org #3 from Retail; authority rule gets teeth → D13, D14, D15 + OPS1–OPS9
Accepted the recommendations from the 11:20 profile.

- **D13 — Org #2 is M3M India** (`52933028787`). Chosen because Luna already holds the
  `m3m-ecosystem` dossier and `m3m` is already in Smartworld's `intelligenceEntityIds`.
  India RE reuses the MCA+RERA path and `spvDefs` unchanged. It isolates the C5 transform
  with no new registry scheme, no new schema and no new research. Only 1 CRM contact —
  acceptable, because org #2's job is proving the transform generalises, not CRM depth.
- **D14 — Org #3 from Retail**, Blackberrys (6c) or Insignian Home (7c). Forces C6 and
  opens the 152-company cluster.
- **D15 — the tracker authority rule gets enforcement.** Branch protection + `CODEOWNERS`
  on `STATUS.md` / `LOG.md`, rather than relying on convention while Luna holds a
  write-capable deploy key.

Nine checkpoints recorded in `STATUS.md` with named owners: OPS1 branch protection,
OPS2 revoke the dead `github-pat`, OPS3 Azure Files git checkout, OPS4 Central India
managed identity, OPS5 record Luna's role assignments, OPS6 HubSpot industry/country
backfill, OPS7 registry `portalId`, OPS8 settle B6 with one live query, OPS9 populate the
index past the canary.

Each is small. Each fails silently if skipped — which is the whole reason they are
written down rather than remembered.

## 2026-07-26 11:20 UTC — Cowork — FINDING — full CRM export profiled; org #2 candidates named; Luna write access verified (class 4)
Full production export received: 1,192 companies × 12 cols, 1,690 contacts × 16 cols.
**The contacts export carries `Associated Company IDs`** — the join key missing from the
earlier spreadsheet, so contact→company is now an ID join rather than a name match
(rule #7 satisfied).

**Coverage is worse than the API counts suggested:** `Industry` filled on 645/1192 (54%),
`Country/Region` on 756/1192 (63%). All cluster counts below are floors.

**Against the correct focus (D10):**

| Cluster | Companies | Contacts | ≥3 contacts | Dominant geo |
|---|---|---|---|---|
| **Retail** | 152 | 239 | 19 | India (112) |
| **Real Estate** | 49 | 60 | 5 | UAE (28), US (12), India (6) |

Real Estate leaders: ALDAR 7c (UAE, `31018821531`), JLL 4c (US), The First Group 3c,
Arada 3c, RAK Properties 3c — UAE-weighted.
Retail leaders: ONDC 10c, Bhartiya 8c, Insignian Home 7c, Ruby Wines 6c (US),
Blackberrys 6c, LNJ Bhilwara 5c, SuperBottoms 5c — India-weighted.

**Two corrections to earlier claims of mine:**

- **Bhartiya is classified `Apparel & Fashion`, not Real Estate.** D5 called it "Bhartiya
  Group (India real estate)" from the partial spreadsheet. HubSpot says otherwise. It is
  a Retail candidate, not an RE one.
- **M3M India is already in HubSpot** — `52933028787`, Real Estate, India. Luna already
  holds an `m3m-ecosystem` dossier, and `m3m` / `m3m-ecosystem` are already in Smartworld's
  `intelligenceEntityIds`. The intelligence largely exists; only 1 CRM contact.

**Luna's Azure access verified end-to-end (class 4 — actual HTTP codes from inside ACA):**
MI token 200 · doc read 200 · write 200 · read-back 200 · delete 200 · index creation
**403** (correctly denied) · post-delete count back to 1. Write scope is exactly
`sagecmo-search` / `atlas-enterprise-intel-kb-v1`, documents only. **B5 is unblocked** —
Luna can populate the index.

Explicitly not granted: AKS, ACR, Storage, Key Vault, OpenAI config, index schema,
RG/subscription contributor, role assignment. Least privilege, verified rather than
assumed.

**Governance conflict, needs a decision (→ B7).** Luna now holds a repo-scoped SSH deploy
key with **write** authorisation to `MapleSage/odic-platform`. D9 says Luna does not get
commit access to this repo, and the tracker authority rule says `STATUS.md` and `LOG.md`
are Cowork-only. **There is no branch protection**, so both rules are currently social
conventions with nothing enforcing them.

**Smaller items:** the ACA `github-pat` is invalid (401) and should be revoked rather than
left in place. The Azure Files checkout fails on `chmod` of `.git/config.lock` — SMB
mounts do not support the POSIX permission ops git expects. Central India
`ca-openclaw-cid` still has no managed identity, which will matter for the AKS/Kata GTM
path.

## 2026-07-26 10:40 UTC — Cowork — CORRECTION — I had the env-var error backwards. The code invented the prefix, not the spec
CC (`f7cc863`, `backend:v17`) and Luna independently converged on the same target:
**`sagecmo-search` / `atlas-enterprise-intel-kb-v1`**. B1 resolved.

**My 08:40 entry was wrong in direction.** I wrote "the spec is wrong; the code is right"
and told CC to correct §12 to the `ATLAS_`-prefixed form. The actual history, per CC
(class 2 — the `atlas-search` k8s secret, deployed 2026-07-21):

- The secret was deployed on 07-21 with unprefixed names, **before `azure_search.py`
  existed**
- The code later invented the `ATLAS_` prefix and never matched what was already deployed
- §12 was right the whole time

CC fixed it the correct way round — conformed the code to the deployed config, citing
§12's own instruction to use existing runtime configuration rather than invent names. The
principle I cited was right; the conclusion I drew from it was inverted. Had CC followed
my instruction he would have changed the spec to match a mistake.

**Contradiction between the two reports, unresolved (→ B6):** CC reports v17 "verified
live against the real (already-existing) secret." Luna reports "Atlas is not wired to it
because the Search environment variables are absent." Most likely Luna's read predates
v17, but that is an assumption, not a check. One live query settles it.

**B1 resolved does not mean unblocked (→ B5).** Luna reports the index contains **only
the `SWD-001` canary document**. So Smartworld's
`azureSearch.entityId: "organization:smartworld-developers"` will connect successfully and
return nothing — presenting as "working, no data" rather than "misconfigured," which is
harder to diagnose. The corpus needs populating, which is Luna's ingestion path (L1/L6),
still not implemented.

**Both agents deferred correctly.** CC held the `DefaultAzureCredential` change back as
its own reviewed change because it alters security posture. Luna declined to set
environment variables or restart Atlas without explicit go-ahead. Both are the right call.

## 2026-07-26 10:05 UTC — Parvind — DECISION — Atlas focus is Real Estate and Retail, not Insurance → D10, D11, D12
Three corrections, all mine to own.

**1. Wrong vertical.** I recommended The Yurconic Agency as org #2 because US Insurance
was the deepest cell in the CRM (89 companies). Atlas's current focus is **Real Estate
and Retail**; insurance is a SageSure vertical but not an Atlas priority. I optimised for
the largest number in the data without checking it against what the product is for. D6
retired, D10 recorded.

Consequence for org #2, restated against the right constraint:

- **Real Estate** — Smartworld already proves the `spvDefs` schema (project / SPV / CIN /
  RERA) works. A second RE org needs **zero schema work**. Cluster is 47 companies.
- **Retail** — **150 companies, the largest cluster in the CRM**. Needs the centre-column
  abstraction (C6) first, because `spvDefs` does not describe a retailer.

The original D5 reasoning was closer to correct than D6 was.

**2. Not an agent task.** Export, import, data cleaning and mapping for the portal parity
work are handled inside HubSpot. I offered to generate import CSVs and enumerate schemas;
none of that was wanted. Parity to the main portal is full parity, already decided.

**3. Misread the constraint.** Parvind wrote "we are not able to mirror it"; I replied
asking whether 51752298 is a sandbox and explaining sandbox sync — re-asking a question
already answered in the message I was responding to.

**Still standing from the 09:50 analysis (class 2, unaffected by the above):** record IDs
do not survive a cross-portal import. The 126-org registry merged in `09e04e1` binds
`sources.hubspot.companyId` to 3475345 IDs (Yurconic `55207832972`). Against 51752298
those resolve to nothing and render as `unmapped` — indistinguishable from genuinely
unmapped. The registry needs a `portalId` qualifier before dev switches portals.

**New, from D12:** HubSpot Projects + GitHub CI/CD in the dev portal is a deployment path
for the ODIC HubSpot Cards (Company / Contact / Deal) that Claude-Design produced and
which have had nowhere to go since.

## 2026-07-26 09:25 UTC — Parvind — POLICY — tracker write access is Cowork-only, no deviation
Write access to `STATUS.md` and `LOG.md` is strictly Claude (Cowork). Neither CC nor
OpenClaw/Luna (GPT-5.6-Sol) has authority, and OC's much broader local-machine access is
the reason it is excluded rather than an argument for including it.

Conventions adopted from `/Volumes/Macintosh HD Ext/sagesure-us/OPENCLAW_SHARED_MEMORY.md`
(1,938 lines, read directly — class 2):

- **Evidence classes 1–4**, with class 1 (agent summary) explicitly not closing anything
- **Self-describing headers** — status, date, actor and claim readable from the ToC
- **Corrections owned by name** — that file's "CORRECTION, mine to own" convention
- **Partial supersession stated inline** rather than wholesale replacement
- **No entry without a command or file read attached**, from its `VERIFICATION_LOG.md`

Not adopted: numbered sections. That file has two §11s, two §14s, two §15s, two §16s and
two §17s from concurrent appends — the exact failure a timestamped append-only log avoids.

**Open follow-up:** §24 of that file records an automated reconciliation cron
(`sagesure-memory-reconcile`) established 2026-07-18 specifically "to stop the
documented-then-repeated failure loop." That is the mitigation for single-writer
staleness, and ODIC has no equivalent. Not yet set up here.

## 2026-07-26 09:10 UTC — Cowork — SHIPPED — STATUS.md and LOG.md created, backfilled from git
Created `STATUS.md` and `LOG.md`. Backfilled from git history and the current session.

Root cause this addresses: `progress.md` / `task_plan.md` / `findings.md` were the
tracker and stopped being maintained on 2026-07-19. Twelve dated handover docs grew in
`docs/` to fill the gap — the same sprawl `18d826a` tried to consolidate on 07-24, and it
regrew within two days. Dated documents cannot carry live state; they are read as
current long after they stop being true.

Split enforced: `STATUS.md` is overwritten and answers *what is true now*. `LOG.md` is
appended and answers *what happened*. Neither does both.

Per D4, the three superseded root files are retained and marked historical, not deleted.

## 2026-07-26 08:55 UTC — Cowork — FINDING
Azure resource export (208 resources) reviewed. Three results:

- **Luna's managed identity is `id-aca-luna-knowledge-auditor`** (`rg-openclaw`, East US 2),
  alongside `id-aca-phase2-kb-ingestion`. Closes Luna's Q1 unknown — it could not inspect
  its own principal from inside the container, but the identity is named and its role
  assignments are portal-readable.
- **Six Foundry IQ search services across four regions.** If Luna indexes into `oc-search`
  and Atlas points at `sageinsure-search`, neither sees the other and it fails silently as
  `unavailable`. Same divergence shape as `data/orgs/` vs `data/exposure-network/`, one
  layer down. Recorded as B1.
- **No Key Vault in `rg-openclaw`** (nearest is `kv-openclaw-cid`, Central India).
  Recommended granting the identity *Search Index Data Contributor* rather than adding a
  second vault — that deletes `AZURE_SEARCH_API_KEY` instead of duplicating it. Blocked by
  `azure_search.py:65` having no token-credential path.

## 2026-07-26 08:40 UTC — Cowork — CORRECTION
§12 of the requirements lists `AZURE_SEARCH_ENDPOINT`. `azure_search.py:28` gates on
`ATLAS_AZURE_SEARCH_ENDPOINT` / `ATLAS_AZURE_SEARCH_INDEX` / `AZURE_SEARCH_API_KEY`.

Provisioning from the spec sets the wrong names, `configured()` returns `False`, and the
source reports `unavailable` — indistinguishable from missing credentials. This may be the
actual cause of Smartworld's status. **The spec is wrong; the code is right.** §12 itself
says to use the runtime configuration rather than invent names.

## 2026-07-26 08:35 UTC — Luna — CORRECTION
Withdrew the framing of blocker #1. External `web_search` being unavailable is not the
same as Azure AI Search being unavailable; the latter is an existing Atlas integration.
Corrected `_real_estate_refresh.py` and `blockers-2026-07-25.md`, logged to
`.learnings/LEARNINGS.md`.

Cowork's addition: Azure AI Search is *retrieval over an indexed corpus*, not discovery.
It cannot return Yurconic's DOI licence because that fact was never ingested. The
resolution path needs neither Azure Search nor a web-search provider — it needs a targeted
fetch against a known registry endpoint, exactly as Smartworld's [A]-grade evidence came
from `haryanarera.gov.in` directly. **B3 is not actually blocked.** → D7.

## 2026-07-26 08:26 UTC — CC — SHIPPED `09e04e1` / `backend:v16` `shell:v20`
C0–C2 complete, verified live.

- `data.ts` and `orgs/smartworld.ts` re-annotated per D4; the latter explicitly named as
  the P2 regression baseline
- 124-company insurance registry merged — 126 orgs total, no ID collisions, Yurconic's
  HubSpot mapping confirmed live
- New `PendingIngestionState` ("Not yet ingested"), distinct from "no workspace data
  configured" — which claims the opposite
- Org switcher given filter + scroll before shipping as an unusable 126-item dropdown

Stopped at the C4 boundary rather than pushing ahead speculatively. Correct call.

## 2026-07-26 08:20 UTC — CC — CORRECTION
Flagged that C3 in the 07-26 update was stale: the Meridian/Smartworld activity bleed was
fixed in `7f942f1` on 2026-07-23 and re-verified intact. Meridian has no
`intelligenceEntityIds`, so its events fetch never fires.

**Cowork's error.** The item was written from screenshots dated 2026-07-22 — two days
before the fix — and `7f942f1` was visible in the git log at the time of writing.
Third instance of stale-artifact-read-as-live in this project. Directly motivated the
`STATUS.md` / `LOG.md` split.

## 2026-07-26 07:50 UTC — Luna — SHIPPED
L1–L6 addressed. L1 contract written but **routes not registered** in the plugin host.
L2 run timing added. L3 three blockers reported — of which only #1 was an impediment;
#2 and #3 were scope and hygiene statements. L4 Yurconic seeded, registry leg unresolved,
**no DOI licence invented**. L5 both grading axes preserved plus `claimKey`,
`corroborationCount`, `corroborationSources`, `gradeBasis`. L6 source register published
locally — 37 records, not yet route-exposed.

## 2026-07-26 06:40 UTC — Cowork — CORRECTION
Reported US Insurance as ~5 companies from the uploaded spreadsheet. **Wrong by ~25×.**

Live CRM: 1,192 companies, 1,690 contacts. Insurance = 124 (89 US). The spreadsheet was a
partial export (~70% of companies) skewed toward the India textile book. Corrected in
`hubspot-contacts-profile-2026-07-26.md` with a notice on the file.

Lesson: an uploaded export is not the system of record. Query the source. → D6

## 2026-07-26 05:30 UTC — Cowork — SHIPPED
`scripts/build_org_registry.py` plus 124 generated insurance registry entries and Luna's
resolution worklist. Registry entries now carry provenance on the mapping itself —
`grade: A`, `basis: hubspot_object_id` — which the registry previously lacked entirely.

## 2026-07-26 04:10 UTC — Parvind — DECISION → D4
**Nothing gets deleted.** Reverses Cowork's recommendation to delete `data.ts` and
`orgs/smartworld.ts`. Empty and stubbed surfaces — org charts, reports, the Relationships
canvas — are roadmap, not abandonment. Absence today is not evidence something is
unwanted.

Also changed C2's design: surfaces are *not* hidden for packs an org lacks — that encodes
absence as intentional. They render with an honest pending state instead.

## 2026-07-25 22:00 UTC — Cowork — FINDING
OpenClaw repo reviewed. Plugin HTTP routes with per-route `auth: "gateway"` and runtime
scope surfaces exist and fail closed — this is the "expose APIs, not the whole thing"
mechanism, and the sanctioned seam per OpenClaw's own `AGENTS.md`.

Cron webhook delivery verified as **fire-and-forget**: `void (async () => …)()` with
`logger.warn` on failure, no requeue; job-level `retry` covers execution, not delivery.
Also SSRF-guarded, so private/VNet targets are blocked. → D2

## 2026-07-25 19:40 UTC — CC — SHIPPED `ef964be` / `backend:v15`
Phase 1: shared response contract + explicit org source mappings.
`GET /api/organizations/{id}/sources` returns the §7.5 shape with honest per-source status.
Meridian `unmapped` on all three — correct, since Meridian is fictional. Smartworld's
`azureSearch` shows `unmapped→unavailable` with a real `entityId`.

## 2026-07-25 19:23 UTC — Cowork — SHIPPED `0300fd6`
Marked handover P0/P1/P1.5 closed; flagged the two-data-store divergence as the remaining
item. *(CC later read this as a concurrent third-party writer. It was Cowork.)*

## 2026-07-25 11:19 UTC — CC — SHIPPED `e038abf`
Exposure Network served from a real backend API; Azure Search field mapping fixed; person
hierarchy and contact depth added. **This closed the graph half of the two-data-store
divergence** — `registry.ts` now fetches from the API and `data.ts` is orphaned.

## 2026-07-24 21:36 UTC — CC — HANDOFF `18d826a`
Consolidated full-project handover "supersedes reading five scattered docs."
*Two days later `docs/` held twelve top-level markdown files again.*

## 2026-07-24 21:09 UTC — CC — SHIPPED `40d089f`
Exposure Network generalized from Smartworld-hardcoded to per-org data-driven.
**Generalized the loading, not the schema** — `spvDefs` still requires project/SPV/CIN/
RERA, which is Indian real estate. This is why C6 exists.

## 2026-07-23 21:43 UTC — CC — SHIPPED `7f942f1`
Intelligence feed scoped to the org that owns it. *Fixes the Meridian/Smartworld activity
bleed. Re-queued in error on 07-26 — see the 08:20 correction.*

## 2026-07-21 19:43 UTC — CC — SHIPPED `b764922`
Evidence-backed intelligence API wired from OpenClaw/Luna's daily dossier refresh.
First Luna→Atlas data path — **via files committed by hand**, which is the manual transfer
D2 exists to eliminate.

## 2026-07-19 21:45 UTC — CC — HANDOFF `7740d66`
Atlas current-state and roadmap snapshot. *Last update to `progress.md` / `task_plan.md` /
`findings.md`. The tracker lapsed here.*

## 2026-07-19 09:27 UTC — Claude-Design — HANDOFF `a450e7d`
Frontend handover: workspace shell, exposure network, HubSpot cards.
**Introduced Meridian, Northstar and Vantage as demo data.** Meridian was subsequently
read as a real CRM account for roughly a week, including in the requirements document's
Definition of Done.

## 2026-07-18 22:22 UTC — CC — SHIPPED `249534f`
Monorepo scaffold.
