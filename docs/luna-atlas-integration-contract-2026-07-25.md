# Luna ↔ Atlas integration contract

**Date:** 2026-07-25
**Status:** Proposed contract, for CC and Luna to build against
**Repos:** `MapleSage/odic-platform` (Atlas), `MapleSage/openclaw` (Luna)

> **Read this first.** Every claim below is marked either **[VERIFIED]** — read from
> code, with a file reference — or **[PROPOSED]** — a design decision that needs
> sign-off. Do not treat proposals as discovered fact.

---

## 1. Decision

**Atlas pulls from Luna over scoped plugin routes. Luna's cron webhook is a doorbell,
not a data path.**

```text
Luna (OpenClaw, ACA or AKS/Kata)
  │
  ├── cron job finishes
  │     └── POST doorbell ──────────────► Atlas /api/ingest/notify
  │         { jobId, summary, status }        (run finished, go pull)
  │
  └── plugin HTTP routes (read-only, scope-gated)
        GET /evidence, /manifest, /source-register, /dossiers
                    ▲
                    │ Atlas pulls
                    │
Atlas ingestion normalizer
  │
  ├── group evidence by claim
  ├── derive A/B/C/D grade
  ├── emit entity + relationship records
  └── store EDGES (not layout)
        │
        └── render: derive supply/core/demand columns at view time
```

### Why pull rather than push

Three reasons, all from verified behaviour:

1. Cron webhook delivery is **fire-and-forget**. In `src/gateway/server-cron.ts` the call
   is `void (async () => { await postCronWebhook(...) })()` and failures are
   `logger.warn`, not thrown or requeued. Job-level `retry` config covers execution
   errors, not delivery. A dropped POST is lost silently. **[VERIFIED]**
2. Webhook targets pass through `fetchWithSsrFGuard`, so private/VNet-internal
   endpoints are blocked. Pull avoids the constraint entirely. **[VERIFIED]**
3. Atlas controls cadence and can reconcile gaps, which is impossible when it is a
   passive receiver.

---

## 2. Luna side — plugin routes

### The mechanism exists **[VERIFIED]**

`src/gateway/server/plugins-http.ts` and `plugin-route-runtime-scopes.ts`:

- Plugins register HTTP routes on the gateway
- Per-route `auth: "gateway"`
- Per-route `gatewayRuntimeScopeSurface`: `"write-default"` | `"trusted-operator"`
- **Fail-closed** — a matched route is blocked before any handler runs if auth or
  scope context is missing

This is also the sanctioned seam per `AGENTS.md`: extensions cross into core only via
`openclaw/plugin-sdk/*`, and new seams must be backwards-compatible, documented, and
versioned.

### Proposed route surface **[PROPOSED]**

All read-only. No write path into Luna — an Atlas compromise must not be able to
reach the agent.

```
GET /api/plugins/atlas/evidence?org=<id>&since=<iso8601>&cursor=<opaque>
GET /api/plugins/atlas/manifest?runId=<id>
GET /api/plugins/atlas/manifest/latest?org=<id>
GET /api/plugins/atlas/source-register?org=<id>
GET /api/plugins/atlas/dossiers?org=<id>
```

Every response carries `generatedAtUtc`, `runId`, and a `cursor` where paginated.

### Auth **[PROPOSED]**

| Deployment | Atlas authenticates as |
|---|---|
| AKS / Kata / Entra | Entra service principal — `src/gateway/oidc-entra.ts` already present **[VERIFIED]** |
| ACA | Gateway bearer token |

Same routes, same payloads, no fork. Only the credential differs.

### Doorbell **[PROPOSED]**

Existing cron config, no new code:

```jsonc
{
  "delivery": { "mode": "webhook", "to": "https://atlas.sagesure.io/api/ingest/notify" }
}
```

with `cron.webhookToken` as the bearer secret. Payload is whatever the run emits —
Atlas treats it as a trigger only and never parses intelligence out of it.

---

## 3. Atlas side — what CC builds

### 3.1 Store edges, not layout

**This is the most important decision in the document.**

Atlas's current schema is not a graph. `spvDefs`, `leftDefs`, `rightDefs`,
`leftExtras`, `rightExtras`, `interlocks`, `promoterNetwork` are **layout buckets** —
they encode which column an entity renders in. **[VERIFIED —
`data/exposure-network/smartworld.json`]**

Storing layout discards the relationship type, which makes the columns unrecomputable
when rules change — and they will change, because insurance and retail need different
column rules over the same edges.

**Store Luna-shaped edge records. Derive columns at render time.**

### 3.2 Canonical record **[PROPOSED — extends Luna's own draft]**

```json
{
  "entityId": "entity_riverday_infrastructure",
  "entityType": "company",
  "name": "Riverday Infrastructure Private Limited",
  "relationship": "promoter_of",
  "targetEntityId": "project_smartworld_sky_arc",
  "grade": "A",
  "sourceTier": "official_government",
  "confidence": "high",
  "materiality": "material",
  "sourceRefs": [
    {
      "sourceId": "HRERA-007",
      "url": "https://haryanarera.gov.in/...",
      "sourceTier": "official_government",
      "observedAt": "2026-07-25T07:16:04Z"
    }
  ],
  "evidenceRefs": ["sha256:..."],
  "status": "confirmed",
  "lastIngestedAt": "2026-07-25T08:00:00Z"
}
```

Note `grade`, `sourceTier` and `confidence` are all retained. Luna's model separates
two orthogonal axes — *who said it* (`sourceTier`) and *how sure we are*
(`confidence`) — while Atlas's A/B/C/D conflates them. Keep both axes in storage and
derive the display letter. No UI change, no information loss.

### 3.3 Grade derivation **[PROPOSED]**

| Condition | Grade | Meaning |
|---|---|---|
| `sourceTier = official_government` | **A** | Primary source |
| ≥2 independent non-official sources agreeing on the same claim | **B** | Independent verification |
| `sourceTier = official_company` | **C** | First-party disclosure |
| No source, or explicitly flagged hypothesis | **D** | Analytical hypothesis |

**B is derived, not mapped.** It is a property of corroboration count, not of any
single record. The normalizer must group evidence by claim before grading, or B can
never be produced. This is the one non-mechanical step.

Sanity check against the existing hand-built graph: A=13, B=1, C=5, D=1.
**[VERIFIED]** A correct normalizer should reproduce roughly that distribution.

### 3.4 Relationship → column mapping **[PROPOSED]**

Real estate (the only vertical with data today):

| Column | Relationship types |
|---|---|
| **Supply** | `licensee_of`, `contractor_for`, `epc_for`, `architect_for`, `supplies_to`, `financed_construction`, `advises`, `regulates` |
| **Core** | `spv_of`, `project_of`, `asset_of`, `licence_for`, `permit_for` |
| **Demand** | `bulk_purchaser_of`, `allottee_of`, `lender_to_buyers`, `escrow_for`, `tenant_of`, `invests_in` |

Insurance and retail get their own tables over the same edge store. **That is the
whole abstraction** — a new vertical is a new mapping table, not a new schema.

### 3.5 Validation — what Atlas rejects on write **[PROPOSED]**

Reject, do not coerce:

- node missing `entityId` or `entityType`
- edge missing `relationship`
- any record with zero `sourceRefs`, or a `sourceId` that does not resolve in the
  source register
- grade `D` without an explicit hypothesis note
- `observedAt` absent or in the future
- **relationship type not present in the mapping table**

That last rule matters most. Silently defaulting an unknown relationship to a column
is exactly how the evidence discipline decays. Reject it and make someone extend the
table deliberately.

---

## 4. Smartworld is a free regression test

Both halves already exist: Luna holds the evidence corpus, and this repo holds a
hand-authored graph built from it that is already trusted.

**Build the normalizer, run it over Smartworld's evidence, diff against the existing
`smartworld.json`.** If it reproduces those ~60 records at approximately the right
grade distribution, the transform is proven — and org #2 becomes automated rather than
estimated.

Do this before onboarding any new organization.

---

## 5. Work for CC, in order

Each phase gates on the one before it.

**P1 — Ingestion storage**
Edge-shaped store, the canonical record above, `lastIngestedAt` per record.
Do not touch the render path.
*Gate:* records round-trip; existing UI unchanged.

**P2 — Normalizer + Smartworld regression**
Grade derivation including the corroboration pass for B. Run over Smartworld evidence,
diff against `smartworld.json`.
*Gate:* ~60 records reproduced, grade distribution within tolerance of A=13/B=1/C=5/D=1.

**P3 — Derive columns at render**
Mapping table applied at view time. `ExposureNetwork.tsx` reads the edge store.
*Gate:* Smartworld renders identically to today. Zero visual deviation.

**P4 — Pull loop + reconcile + doorbell receiver**
`POST /api/ingest/notify` (trigger only), scheduled pull, manifest reconcile for
dropped doorbells.
*Gate:* killing the doorbell mid-run still converges on the next scheduled pull.

**P5 — Honest per-surface state (not surface hiding)**

Smartworld's `packs` are `["exposure-network", "gia"]`, so `data/orgs/smartworld.json`
correctly does not exist and `orgs.py` returns `EMPTY_WORKSPACE`. **[VERIFIED]**

There are two ways to resolve the resulting "No workspace data for Smartworld" screen,
and under the retention policy the obvious one is wrong:

- ~~Hide the tabs for packs the org lacks~~ — treats absence as intentional. It is not.
  Smartworld is expected to gain workspace data, org charts and reports.
- **Show the surface with an honest state** — `Not yet ingested`, `Pending`, or
  `Unmapped`, consistent with the §8 source-status vocabulary already in the
  requirements, plus a last-checked timestamp.

Take the second. The surface stays visible because it is coming; the state tells the
truth about why it is empty today. This also matches how every other connector state
is already rendered, so it needs no new UI vocabulary.

*Gate:* Smartworld shows a workspace tab in a labelled pending state, never a bare
"no data" dead end.

### Retention policy — nothing gets deleted

**Standing rule for this project: do not remove code, files, surfaces, or placeholder
UI.** Surfaces that are currently empty or stubbed — org charts, reports, the
Relationships canvas — are roadmap, not abandonment. Absence today is not evidence
that something is unwanted; it is usually evidence that it has not been built yet.
Removing it destroys intent that is not written down anywhere else.

This supersedes any earlier deletion recommendation, including one made in an earlier
revision of this document.

Two consequences for the work below:

1. **`apps/shell/src/exposureNetwork/data.ts` and `orgs/smartworld.ts` stay.**
   They are unreachable from the live render path — nothing imports `data.ts`, and the
   only importer of `orgs/smartworld.ts` is `data.ts` itself. **[VERIFIED]** But
   `orgs/smartworld.ts` is the hand-authored graph, which makes it **the known-good
   fixture for the P2 regression test**. Give it that job explicitly rather than
   treating it as leftovers: annotate the file header as the P2 baseline, and let P2
   diff the normalizer output against it. That removes the misdirected-edit risk by
   giving the file a defined purpose, not by removing the file.

2. **The Relationships tab placeholder stays until P3 replaces it.** The design canvas
   specifies `relationship graph canvas -- force-directed org / person / document
   network`; the four-node stick graph is a faithful build of that placeholder, not a
   deviation from it. **[VERIFIED]** It is holding the slot for the org chart. Once P3
   lands, the tab renders the shared edge store scoped to one organization — the
   placeholder is fulfilled, not deleted.

---

## 6. Open items — not blockers, but unowned

| Item | Owner |
|---|---|
| Managed identity principal ID + role assignments. Luna has an identity endpoint but zero verified write access. Needed only if push is ever preferred over pull. | Ops |
| **3 blockers** on the latest Luna manifest run — never examined | Luna |
| Actual cron expressions. `.openclaw/cron/jobs.json` is empty locally; production jobs live in the cron store on the deployment. `openclaw cron list` against the deployment answers it. **[VERIFIED]** | Ops |
| Wall-clock cost of a first-discovery run. The measured 964s run was 31 items, 0 adds, 0 updates — a no-change refresh, which tells us nothing about discovery. Luna proposes adding `runStartedAtUtc` / `runFinishedAtUtc` / `durationSeconds` to every manifest. Do that first. | Luna |
| ACA production egress policy. Outbound works from the runtime; the VNet/NAT allowlist is not visible. Only matters if push is revisited. | Ops |
