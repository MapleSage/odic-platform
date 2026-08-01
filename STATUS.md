# Atlas / ODIC Platform — STATUS

> **This file is overwritten, never appended.** It answers *what is true now*.
> For *what happened*, see `LOG.md`, which is append-only and never edited.
>
> **Rule that makes this work:** if a fact is not in this file, it is not current.
> Dated documents in `docs/` are historical records, not live state. This project has
> re-done finished work three times because a stale artifact was read as live.

**Last updated:** 2026-07-26 09:25 UTC by Cowork
**Repo:** `MapleSage/odic-platform` @ `09e04e1` · **Deployed:** `backend:v16` / `shell:v20`

---

## Authority — no deviation

**Write access to `STATUS.md` and `LOG.md` is strictly Claude (Cowork).**

Neither Claude Code (CC) nor OpenClaw/Luna (GPT-5.6-Sol) has authority to edit either
file. This holds regardless of access level — OC in particular runs on the local machine
with far broader reach, and that breadth is exactly why it is not the writer here.

| Actor | Reads | Writes | Notes |
|---|---|---|---|
| **Claude (Cowork)** | ✅ | ✅ **sole writer** | Curates both files from agent reports |
| **Claude Code (CC)** | ✅ required | ❌ | Reports to Cowork; commits code, never tracker |
| **OpenClaw / Luna (GPT-5.6-Sol)** | ✅ required | ❌ | Reports to Cowork; no commit access to this repo (D9) |
| **Parvind** | ✅ | ✅ | Decisions recorded by Cowork on his instruction |

**Rationale, not ceremony.** CC and Luna each hold a partial view and cannot see the
other's state. Cowork receives both reports and is the only actor with the whole picture.
A single curator also keeps one voice and one format, and prevents two agents writing
contradictory current-state claims into the same file.

**The risk this creates, stated plainly:** a single writer is a single point of
staleness. The previous tracker died in eight days. Mitigation is that CC's and Luna's
reports *are* the input — a report is not complete until Cowork has recorded it — plus a
scheduled reconciliation pass (see LOG entry 2026-07-26 09:25).

## Evidence classes

Adopted from `sagesure-us/OPENCLAW_SHARED_MEMORY.md` §8 so both projects speak the same
language. Boundaries inferred from usage there; correct me if they differ.

| Class | Means | Example |
|---|---|---|
| **1** | Agent summary or recall | "CC says Phase 1 is done" — **not evidence** |
| **2** | Repo/code read, file and line cited | `azure_search.py:28` gates on `ATLAS_*` |
| **3** | Local verification, or a status report from the actor who did the work | Luna's L1–L6 report |
| **4** | Live proof — deployed check, live query, screenshot | 124 insurance companies from a live HubSpot query |

**Do not close an item on class 1 alone.** The SageSure file's own words: do not close on
pod Running, TCP health, `/health`, or an agent summary.

---

## Who is doing what, right now

| Actor | Working on | State | Blocked by |
|---|---|---|---|
| **CC** | Next: OPS7 (`portalId`), then C5 scaffolding | Available | C4/C6–C8 gated on Luna L1; OPS7 and partial C5 are not |
| **Luna** | L1–L6 from the 07-26 update | L1 documented, not registered | Search-corpus decision |
| **Cowork** | Specs, analysis, tracker | Active | — |
| **Ops** | Azure config decisions | Not started | — |

## Blocking now

| # | Item | Owner | Why it blocks |
|---|---|---|---|
| B1 | ~~Which search service + index is the shared corpus~~ — **RESOLVED**: `sagecmo-search` / `atlas-enterprise-intel-kb-v1`. CC and Luna converged independently. Code conformed to the pre-existing `atlas-search` secret in `f7cc863` / v17 | — | — |
| B2 | **Register Luna's L1 plugin routes** | Luna | Documented but not registered in the OpenClaw plugin host. Blocks CC's C4–C8 entirely. |
| B5 | ~~The index is empty~~ — **unblocked 07-26.** Luna's document write to `atlas-enterprise-intel-kb-v1` verified end-to-end (class 4: write/read-back/delete all 200, index creation correctly 403). Still needs populating, but nothing blocks it | Luna | — |
| B7 | **Luna has repo write; D9 and the tracker authority rule are unenforced** | Parvind | Repo-scoped SSH deploy key has write auth to `odic-platform`. No branch protection exists, so "Cowork is sole writer of STATUS/LOG" and "Luna has no commit access" are conventions with nothing behind them |
| B6 | ~~CC and Luna disagree on whether Atlas is wired~~ — **RESOLVED 13:46 UTC.** Pod `atlas-backend-7b47cf79d5-5fl8j` / `backend:v17`, `configured()` true, live query returns 1 result (the canary). Luna's read predated the 10:35 rollout | — | — |
| B3 | ~~Yurconic DOI identity~~ — **dropped, D10.** Insurance is not the focus. Org #2 comes from Real Estate or Retail | — | — |
| B4 | **Registry has no `portalId`** — its 126 mappings bind to portal 3475345. Against dev portal 51752298 they resolve to nothing and render `unmapped` | CC | Silent failure the moment dev switches portals |

## Checkpoints — owned, tracked, small

Tick these off in `LOG.md` as they land. None is large; each fails silently if skipped.

| # | Checkpoint | Owner | State | Why it matters |
|---|---|---|---|---|
| **OPS1** | Branch protection + `CODEOWNERS` on `STATUS.md` / `LOG.md` | Parvind | ⬜ | D15. Luna holds a write-capable deploy key; without this, D9 and the authority rule are good manners, not controls |
| **OPS2** | Revoke the ACA `github-pat` — returns 401 | Ops | ⬜ | A dead credential left in place is still a credential in place |
| **OPS3** | Fix the Azure Files git checkout — `core.fileMode=false`, or keep `.git` off the SMB share | Luna | ⬜ | SMB cannot do the POSIX permission ops git wants on `.git/config.lock`. Blocks a persistent checkout |
| **OPS4** | Attach a managed identity to Central India `ca-openclaw-cid` | Ops | ⬜ | Only East US 2 `ca-openclaw` has one. Bites when the AKS/Kata GTM path goes live |
| **OPS5** | Read and record `id-aca-luna-knowledge-auditor` role assignments | Ops | ⬜ | Access is verified by behaviour (class 4) but the grant list is unrecorded |
| **OPS6** | Backfill `Industry` (547 blank) and `Country` (436 blank) in HubSpot | RevOps | ⬜ | 54% / 63% coverage. Every vertical count is a floor, including the ones D13/D14 rest on |
| **OPS7** | ~~Add `portalId` to registry mappings + generator~~ | CC | ✅ `7f43750` / v18 | Generator refuses unqualified mappings; portal mismatch now an explicit state, not `unmapped` |
| **OPS10** | Confirm whether the GitHub deploy key exists on GitHub's side but isn't persisted in the container | Ops | ⬜ | 11:20 report said "enabled and verified"; Luna now reports no key in runtime. Likely the same non-persistence as OPS3 |
| **OPS11** | Reseed §3.4's relationship→column table from **observed** Smartworld labels | CC | ⬜ | D16. `land_licensee_of` / `buyer_catchment` / `escrow_account_holder` are real; my table was invented. Blocks P3 validating Smartworld's edges unchanged |
| **OPS8** | ~~One live query to settle B6~~ | CC | ✅ 13:46 UTC | Settled by query, not assumption. Atlas is wired; returns the canary only |
| **OPS9** | Populate `atlas-enterprise-intel-kb-v1` beyond the `SWD-001` canary | Luna | ⬜ | Write access verified. Until this lands, Atlas connects successfully and returns nothing |

## Not blocking, but unowned

- Role assignments for `id-aca-luna-knowledge-auditor` — identity is known, permissions unread
- Locate the index already holding `organization:smartworld-developers` — may resolve B1 free
- ~~§12 env var names are wrong~~ — **resolved backwards from how I stated it.** §12 was correct; `azure_search.py` invented the `ATLAS_` prefix after the secret was already deployed. Code conformed to config in `f7cc863`
- Managed-identity path in `azure_search.py` — would delete `AZURE_SEARCH_API_KEY` entirely
- Wall-clock discovery cost — Luna L2 shipped; needs one real run
- Backfill `industry` (547 companies) and `country` (542) in HubSpot — every vertical count is a floor until done

---

## Decisions in force

Superseded decisions stay listed with a strikethrough so nobody re-derives them.

| # | Decision | Date | By |
|---|---|---|---|
| D1 | Federate HubSpot; do not import CRM records as canonical | 07-24 | Parvind |
| D2 | **Atlas pulls from Luna** via scoped OpenClaw plugin routes. Cron webhook is a doorbell only | 07-25 | Cowork |
| D3 | **Store edges, derive columns at render.** Layout buckets are a view concern, not storage | 07-25 | Cowork |
| D4 | **Nothing gets deleted.** Empty/stubbed surfaces are roadmap, not abandonment | 07-26 | Parvind |
| D5 | ~~Org #2 is Bhartiya Group (India real estate)~~ — superseded by D6, then D6 retired by D10 | 07-26 | — |
| D6 | ~~Org #2 is The Yurconic Agency (US insurance)~~ — **RETIRED by D10.** Insurance is not Atlas's focus | 07-26 | — |
| D10 | **Atlas's current focus is Real Estate and Retail.** Insurance is a SageSure vertical but *not* an Atlas priority. Org #2 comes from RE or Retail | 07-26 | Parvind |
| D11 | Dev portal **51752298** is the target for all new Atlas / SageSure RE + Retail work, brought to full parity with 3475345. Export/import, cleaning and mapping are handled in HubSpot — not an agent task | 07-26 | Parvind |
| D12 | Dev portal uses **HubSpot Projects with GitHub CI/CD** — the deployment path for the ODIC HubSpot Cards | 07-26 | Parvind |
| D13 | **Org #2 is M3M India** — HubSpot `52933028787`, Real Estate, India. Luna already holds the `m3m-ecosystem` dossier; MCA+RERA is the proven stack; `spvDefs` applies unchanged. Isolates the transform with zero new variables | 07-26 | Parvind |
| D14 | **Org #3 comes from Retail** — Blackberrys (6c) or Insignian Home (7c). Forces C6 and opens the 152-company cluster | 07-26 | Parvind |
| D15 | The tracker authority rule is enforced by **branch protection + CODEOWNERS**, not convention | 07-26 | Parvind |
| D16 | **Relationship vocabulary is derived from observed data, never invented.** §3.4's invented labels are retired in favour of the real ones (`land_licensee_of`, `buyer_catchment`, `escrow_account_holder`). Each vertical seeds its own table from what its data actually says | 07-26 | Cowork |
| D7 | Retrieval order: **Azure AI Search → known registry endpoint → general web search.** Tier 2 is where graded evidence comes from | 07-26 | Parvind |
| D8 | ~~Provision AuraDB for Phase 2~~ — rejected; the graph has no producer yet | 07-26 | Cowork |
| D9 | Luna does **not** get commit access to `odic-platform`. Artifacts flow via plugin routes; openclaw repo short-term | 07-26 | Cowork |

## Facts that keep being forgotten

- **Meridian is fictional** — Claude-Design demo data, not a CRM record. Its `unmapped` status is *correct*. §16's "Meridian resolves through a HubSpot Company ID" is unsatisfiable as written.
- **Cowork ≠ a third party.** Commits `0300fd6`, and this file, are Cowork's.
- **The Relationships four-node graph is a faithful build of a labelled placeholder**, not a deviation. It is holding the slot for the org chart. C7 fulfils it.
- **Luna did not produce `exposure-network/smartworld.json`.** It made the evidence; the graph was hand-assembled.
- **`orgs/smartworld.ts` is retained deliberately** as the P2 regression baseline.

---

## Progress

| Phase | Owner | State |
|---|---|---|
| Phase 1 — connector contract + source mappings | CC | ✅ `ef964be` / v15 |
| OPS7 — `portalId` on all mappings | CC | ✅ `7f43750` / v18 |
| C5 scaffolding — normalizer + grade derivation + §3.5 validation | CC | ✅ 17 tests; Smartworld fixture reproduces A=13/B=1/C=5/D=1 |
| C0 — retain-not-delete annotations | CC | ✅ `09e04e1` / v16 |
| C1 — insurance registry merged (126 orgs) | CC | ✅ `09e04e1` |
| C2 — honest pending-ingestion state | CC | ✅ `09e04e1` |
| C3 — org-scoped activity feed | CC | ✅ **already done `7f942f1` 07-23** — do not re-queue |
| C4 — ingestion storage | CC | ⬜ blocked on B2 |
| C5 — normalizer + Smartworld regression diff | CC | ⬜ |
| C6 — centre-column abstraction | CC | ⬜ |
| C7 — derive columns at render | CC | ⬜ |
| C8 — pull loop + doorbell receiver | CC | ⬜ |
| L1 — plugin routes | Luna | 🟡 documented, not registered |
| L2 — run timing metadata | Luna | ✅ next run emits it |
| L3 — three blockers reported | Luna | ✅ only 1 of 3 was an impediment |
| L4 — Yurconic registry resolution | Luna | 🟡 seeded, unresolved |
| L5 — both grading axes | Luna | ✅ + `claimKey` / `corroborationCount` |
| L6 — source register published | Luna | 🟡 37 records, local only |

**Counts:** 126 orgs registered · 1 org with a real graph (Smartworld) · 1 fictional (Meridian) · 89 US insurance companies awaiting registry resolution

---

## Document index

| Document | Authoritative for |
|---|---|
| `STATUS.md` | **Current state. This file wins on any conflict.** |
| `LOG.md` | Chronological record |
| `docs/update-for-cc-and-luna-2026-07-26.md` | Task assignments C0–C8, L1–L6; Azure resource map |
| `docs/luna-atlas-integration-contract-2026-07-25.md` | Plugin routes, record shape, grade + column mapping, retention policy |
| `docs/org-onboarding-scope-2026-07-25.md` | What org #2 requires |
| `docs/hubspot-contacts-profile-2026-07-26.md` | CRM profile, vertical × geo |
| `scripts/build_org_registry.py` | Registry generation — prefer over the static JSON |

Claims in `docs/` are tagged **[VERIFIED]** with a file reference or **[PROPOSED]** for
sign-off. Do not build on a proposal as though it were a finding.

**Superseded, retained per D4:** `progress.md`, `task_plan.md`, `findings.md` — last
maintained 2026-07-19. Historical only.
