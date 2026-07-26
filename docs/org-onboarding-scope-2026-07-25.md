# Onboarding organization #2 — what it actually takes

**Date:** 2026-07-25
**Scope:** What is required to stand up a second organization at Smartworld depth.
**Method:** Read of the repo at `ef964be`. Every claim below cites a file or commit.

---

## Headline

**Luna's pipeline does not produce the exposure graph.** These are two separate
artifacts with two separate production paths, and only one of them is automated.

| Artifact | Path | Produced by | Cadence |
|---|---|---|---|
| Dossiers | `data/dossiers/*.md` | OpenClaw/Luna daily refresh (`b764922`) | Cron, outside this service |
| Exposure graph | `data/exposure-network/smartworld.json` | Hand-authored | Committed once, in `e038abf` |

`intelligence.py:156` states it directly: "Connector workers populate the KB on a
cron cadence outside this service."

The dossiers are prose — 5.2 KB for Sky Arc, 6.3 KB for M3M. The exposure graph is
30 KB of structured, graded, source-referenced records. Nothing in the repo converts
one into the other. That conversion is the cost of org #2, and it is currently manual.

Supporting evidence: the graph covers **6 SPVs**; the dossier pipeline has produced
**2 dossiers**. Four of the six centre-column entities have no dossier behind them at
all, so the graph was authored from research that went beyond the pipeline's output.

---

## What is in the Smartworld graph

~60 curated records, from `data/exposure-network/smartworld.json`:

| Section | Count | What it is |
|---|---|---|
| `spvDefs` | 6 | Centre column — project, SPV, CIN, RERA, directors, common directors |
| `leftDefs` | 7 | Supply side — licensees, land cluster, EPC |
| `rightDefs` | 7 | Demand side — lenders, bulk buyers, catchments, escrow |
| `leftExtras` / `rightExtras` | 3 / 3 | Secondary flanks |
| `interlocks` | 4 | Interlocking directorate findings |
| `promoterNetwork` | 5 | Promoter/family leads, marked pending verification |
| `entityRegistry` | 13 entities, 12 children, 24 evidence rows | Drill-down targets (L&T + 12 group cos) |

**Evidence grade distribution: A=13, B=1, C=5, D=1.**

Overwhelmingly primary-source. Source refs are a register — `HRERA-001` through
`HRERA-011` — not free-text URLs. That register is the quality bar, and it is high.
The one D is the L&T EPC hypothesis, correctly labelled as unevidenced.

---

## Exact inputs required for a new org

1. **Registry entry** in `data/orgs/index.json` — `id`, `name`, `packs`, `sources`,
   and `intelligenceEntityIds` for KB matching.
2. **`data/exposure-network/<id>.json`** — ~60 records in the schema above, each with
   a grade and a source-register reference.
3. **`data/orgs/<id>.json`** — only if the org gets the `workspace-data` pack.
   `orgs.py:get_workspace_data` returns `EMPTY_WORKSPACE` when this file is absent.
4. **Azure Search `entityId`** — if the KB holds documents for the org.

Item 2 is the only expensive one. Items 1, 3 and 4 are minutes of work.

---

## Two findings worth acting on

### 1. The two-data-store divergence is already fixed — for the exposure network

`registry.ts` fetches from `GET /api/orgs/:id/exposure-network`. `data.ts` is marked
`DEPRECATED` in its own header. The frontend copy at
`apps/shell/src/exposureNetwork/orgs/smartworld.ts` (24 KB) is now a stale duplicate
reachable only through the back-compat shim.

This closes the item flagged in `0300fd6`.

**Unreachable from the render path — but retained deliberately.** A grep across
`apps/shell/src` shows:

- Nothing imports `exposureNetwork/data.ts`. Zero call sites.
- The only importer of `orgs/smartworld.ts` is `data.ts` itself (line 30), which is
  itself orphaned.
- Live consumers (`ExposureNetwork.tsx`, `main.tsx`) import from `registry.ts` and
  `schema.ts` only.

**Do not delete either file.** `orgs/smartworld.ts` holds the hand-authored Smartworld
graph, which is the known-good baseline the P2 normalizer must reproduce. It has a job:
regression fixture. Annotate the header to say so, so a future reader does not mistake
it for leftovers and edit it expecting a live effect.

See the retention policy in `luna-atlas-integration-contract-2026-07-25.md` — nothing
in this project gets removed on the grounds of being currently unused.

### 2. "No workspace data for Smartworld" is a pack-awareness bug, not missing data

Smartworld's `packs` are `["exposure-network", "gia"]`. It has no `workspace-data`
pack, so `data/orgs/smartworld.json` correctly does not exist, and `orgs.py` correctly
returns `EMPTY_WORKSPACE`.

The bug is that the UI renders workspace tabs for an org that does not have the pack,
then shows an empty state inside them. It should read `packs` and not render those
surfaces at all. This is a frontend fix of a few hours and it removes one of the four
annotated complaints outright.

---

## The real blocker for verticals #2 and #3

Commit `40d089f` generalized the Exposure Network "from Smartworld-hardcoded to per-org
data-driven." That generalized the **loading**, not the **schema**.

The schema is still real-estate-shaped. `spvDefs` requires `project`, `spv`, `cin`,
`rera`, `directors`, `commonDirectors` — a project-per-SPV structure specific to Indian
real estate. The left/right flanks are generic (`name`, `role`, `grade`, `target`,
`edgeLabel`, `note`, `src`) and would carry over fine. The centre column would not.

For **Insurance**, the centre is carriers/MGAs/programs. For **Retail**, it is
banners/formats/locations. Neither is an SPV.

So a second *real-estate* org in India reuses the schema as-is. A first *insurance* or
*retail* org needs the centre column abstracted first. That is a schema change in
`schema.ts` plus `ExposureNetwork.tsx`, and it should happen before the second vertical
is attempted, not during.

---

## Recommended sequence

1. Annotate `data.ts` and `orgs/smartworld.ts` as retained-and-inactive, with
   `orgs/smartworld.ts` named as the P2 regression baseline. Nothing is deleted.
2. Make the workspace pack-aware so orgs stop rendering surfaces they do not have.
3. Onboard org #2 as **another India real-estate org** — it exercises the full path with
   zero schema work and produces an honest measurement of how long the manual
   dossier-to-graph step actually takes.
4. Use that measured number to decide whether the step gets automated before verticals
   #2 and #3, or whether it stays analyst work.
5. Abstract the centre column only once (3) has given a real number.

---

## Answered by Luna, 2026-07-25

Luna was queried directly. Its answers close most of the open items.

### Luna did not produce the exposure graph — confirmed

`exposure-network/smartworld.json` does not exist in Luna's runtime. Luna produced the
**evidence**; the graph is a hand-assembled view over it. Luna's actual artifacts:

```
/workspace/users/daily-knowledge-refresh/real-estate/
  briefing-<date>.md
  evidence-<date>.jsonl
  manifest-<date>.json
  staging-manifest-<date>.jsonl
  dossiers/*.md
  dossiers/dossier-status-summary-latest.json
  generate_dossier_snapshots.py          <- the pipeline

/workspace/users/smartworld-developers-intelligence-dossier/
  data/live_intelligence_snapshot.json
  data/source_register.csv
  deliverables/Smartworld-M3M-counterparty-ledger-v1-2026-07-17.csv
  deliverables/Smartworld-M3M-board-report-v2-2026-07-25.html
```

**Implication:** the build is not "teach Luna to emit graphs." It is a transform from
Luna's evidence schema to Atlas's graph schema. That transform does not exist anywhere.

### The source register resolves

`HRERA-001`…`HRERA-011` are real IDs in `source_register.csv` and
`live_intelligence_snapshot.json`, bound to specific projects (One DXP, The Edition,
Orchard, Sky Arc). Not labels. The register is local/file-backed and has never been
published to Azure Search or any Atlas-readable surface.

### Luna's grading model is richer than Atlas's

Luna emits per-record: `source_tier` (e.g. `official_government`), `confidence`,
`materiality`, `content_hash`, `evidence_hygiene`, plus `entities`, `projects`,
`spvs_counterparties` arrays. It does not emit A/B/C/D.

Mapping is a lookup table, not a research step — `official_government` + `high` is
grade A.

**Design note:** Luna separates two orthogonal axes — *who said it* (`source_tier`) and
*how sure we are* (`confidence`). Atlas's A/B/C/D conflates them: A and C describe
source type, D describes confidence. Recommend storing Luna's two axes and deriving the
display letter at render time. No UI change, no information loss at ingestion.

### Authorization is the blocker, not capability

| Check | Result |
|---|---|
| Managed identity endpoint | Present (`IDENTITY_ENDPOINT`, ACA-style) |
| Principal ID / scope / role assignments | **Not inspectable from runtime** |
| Write to Blob | Not verified |
| Write to Atlas Azure AI Search index | Not verified |
| Write to Key Vault | Not verified |
| Outbound HTTPS | **Working** (`example.com` 200; `management.azure.com` 400 = reachable, unauthenticated) |

Push-to-Atlas is technically viable from the current runtime. What is missing is a role
assignment, which is an Azure RBAC task rather than an engineering one, and it gates
everything downstream.

### Measured cost of the missing wire

Luna's dossier summary: `2026-07-25T07:16`.
The copy committed in this repo: `2026-07-21T08:05`.

**Atlas is four days stale** because the transfer is manual.

### Recommendation: the transform lives on the Atlas side

Luna posts evidence in its own schema; Atlas assembles the graph. This keeps Luna
generic across verticals, and when the centre column is abstracted for insurance and
retail, only Atlas changes — no Luna redeploy.

## Still open

- **Wall-clock cost of the manual assembly step** — Luna's answer to this was truncated.
  Still needed before deciding whether to automate the transform ahead of verticals 2/3.
- **Exact cron expression.** Luna confirms daily runs by timestamp (monitoring ~06:01,
  dossier snapshot ~07:16, 17 items tracked) but the scheduler definition is not in its
  accessible workspace.
- **ACA production egress policy.** Outbound works from the current runtime, but the
  VNet/NAT/firewall allowlist is not visible, so production push is not yet proven.
