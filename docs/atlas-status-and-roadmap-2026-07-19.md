# Atlas — Current State & Planned Features (2026-07-19)

Prepared for hand-off into shared memory (Claude-Cowork / OpenClaw Obsidian
Memory). This is a snapshot as of the work described below — treat it as a
point-in-time reference, not a live source of truth once further work lands.

---

## What Atlas is

Atlas (internal codename ODIC, "Enterprise Intelligence OS") is a workspace
for investigating organizations, people, risks, opportunities, and
counterparty relationships. Public product surface at `atlas.sagesure.io`.
Repo: `MapleSage/odic-platform`.

Origin note: this project was previously abandoned ("trashed") roughly a
year before this rebuild, specifically because it risked becoming — in the
project owner's words — "another dummy site." That context matters: the
owner has a real, personal stake in one of the datasets Atlas surfaces (see
Smartworld/Sky Arc below), and the explicit standard for this rebuild is
real, sourced data over polished-looking placeholders.

## Current state — what's actually live and working

### Frontend (`apps/shell`)
- React + Vite SPA, IBM Plex Sans/Mono typography, navy/orange design system
  matching the original Claude-Design handoff spec
  (`design_handoff_odic_intelligence_platform/*.html`)
- Workspace switcher in the topbar — a real dropdown, not a static label —
  toggles between registered organizations. Each tab (Organization, Search,
  Reports, Graph) gates its content to the selected org; orgs without data
  for a given surface show an explicit empty state rather than silently
  displaying another org's data.
- **Organization workspace**: Overview / Timeline / Relationships /
  Documents / AI Insights / Activity Feed tabs. Currently only populated for
  "Meridian Health Systems" — fictional seed/demo data, explicitly labeled
  as such in the UI ("SEED DATA" pill).
- **Graph workspace / Exposure Network**: a 360° counterparty network for
  "Smartworld Developers" — SVG connector lines colored/dashed by evidence
  grade (A–D), a click-through detail modal with breadcrumb drill-down, an
  "Open as Full Chart" full-screen overlay, and a distinctly-styled
  "Promoter & Family Office Network — pending verification" section that
  deliberately does not use the A–D grading (every entry there is an
  unconfirmed lead, not a sourced fact). This is real diligence data, not a
  demo dataset — see "The Smartworld dataset" below.
- Reports and Search workspaces exist but are still Meridian-only.

### Auth
- Real Entra OIDC via a new SPA/public-client App Registration
  (`atlas.sagesure.io`, no client secret — PKCE flow), matching the
  `app1.sagesure.io` convention already used elsewhere in the org.
- Backend validates bearer tokens against the tenant's JWKS; accepts both
  SageSure/org accounts and personal Microsoft accounts (a deliberate,
  flagged decision — there is currently no company/domain restriction on
  who can sign in).
- No client secrets stored anywhere. Full details, including exact env vars
  and what's verified vs. not, in `docs/backend/entra-oidc-2026-07-19.md`.
- **Known gap**: no real authorization/role model yet — any authenticated
  user (any Microsoft account) sees the same data. Fine for a fictional
  demo org; not fine once real, sensitive data (e.g. the Smartworld
  dossier) is the primary content.

### Backend (`services/fastapi-orchestration`)
- FastAPI, serves the fictional Meridian workspace data over
  `/api/workspace*`, protected by the same JWKS validation as the frontend.
- No real data source, no database — everything is an in-memory Python dict.
- No RAG, no retrieval, no citations at the API layer (the Exposure
  Network's citations are currently hardcoded in the frontend's
  `data.ts`, not served from a backend index).

### Infrastructure
- AKS: `aks-sageinfra-new-dev01` (eastus), namespace `odic-dev01`, shared
  cluster also running live SageSure agent services (claims-manager,
  policy-assistant, underwriter-agent, etc.) — Atlas is isolated in its own
  namespace and does not touch those.
- Ingress: dedicated ingress-nginx + cert-manager install (the cluster had
  none pre-existing), real Let's Encrypt TLS cert, live at
  `atlas.sagesure.io` → `51.8.65.9`.
- Images: `sageinfranewdev01.azurecr.io/odic/{shell,backend}`, built via
  `az acr build` (no local Docker daemon dependency).
- **Real, already-provisioned, currently unused infra found in the same
  resource group** (`rg-sageinfra-new-dev01`), relevant to the KB/RAG plan
  below:
  - `srch-sageinfra-new-dev01` — Azure AI Search, Basic tier, running,
    zero indexes.
  - `oai-sageinfra-new-dev01` — Azure OpenAI, `gpt-4o` deployed, no
    embedding model yet.
  - `stsageinfranewdev01` — storage account for raw documents.
  - Separately, other Azure Search services in the subscription
    (`sageinsure-search`, `sagecmo-search`, `sage-search`, `oc-search`)
    have real indexed content — most notably `insurance-general-kb` with
    **2,825 real documents**. `sageretail-retail-intel-index` has a real
    schema but 0 documents (provisioned, not yet populated).

### HubSpot integration (`services/connectors-hubspot`)
- Three CRM Card UI extensions (Company/Contact/Deal) built as a real
  HubSpot developer project (platform version `2026.03`), typechecked and
  linted against the actual published `@hubspot/ui-extensions` package —
  zero errors. Currently static/sample data matching the Meridian dataset.
- **Not deployed.** Deploying requires the HubSpot CLI authenticated
  interactively (`hs auth`) against a developer account — not available in
  this environment. Someone with that access needs to run
  `hs project upload` from `services/connectors-hubspot`.

### The Smartworld dataset — important context
The Exposure Network's Smartworld/M3M content comes from a real diligence
dossier (source register, confidence rubric, project/SPV mapping,
common-control graph, a deep Sky Arc regulatory chronology) compiled by an
OpenClaw agent, not from the original design mockup's smaller placeholder
data. Reading it closely revealed this is tied to the project owner's own
personal situation — the `strategic_relationship_map.csv` in the source
dossier explicitly frames Smartworld as an "existing customer/investor
relationship" with a note to "keep personal and professional tracks
separate," alongside apartment-dispute-shaped tracking (transfer/
cancellation/reinstatement decision paths). This is why the confidence
grading (A–D) and the "pending verification, not fact" framing for
promoter/family relationships is treated as load-bearing in the UI, not
cosmetic — the underlying source dossier itself insists on it, and getting
it wrong would misrepresent a real, personally consequential situation, not
a demo.

## What's explicitly NOT built yet

- **KB/RAG pipeline.** No embedding model deployed, no populated index for
  Atlas's own content, no retrieval/citation layer in the backend. Division
  of labor as directed by the project owner: **data collection/ingestion is
  being handled by a GPT-based agent ("legwork"), not by this Claude
  session** — Atlas's job is the consumption side (retrieval + citation +
  UI), once real indexes exist to query. This was mid-scoping when the
  Smartworld dossier arrived and superseded the immediate priority; not
  resumed yet.
- **Web crawling / scraping workers.** Explicitly deferred — needs
  per-site ToS/robots.txt review, not a generic pipeline.
- **Social monitoring connectors.** Explicitly deferred — needs real
  developer API credentials per platform, none exist yet.
- **Real authorization/role model.** Currently any Microsoft account =
  full access.
- **Reports and Search tied to non-Meridian orgs.** Only the Graph tab is
  currently org-aware; Reports/Search still assume Meridian or show an
  empty state.
- **HubSpot card deployment.** Code is done; deployment needs a human with
  HubSpot CLI access.
- **Code-splitting.** The frontend bundle is >500KB post-Exposure-Network;
  flagged but not addressed.

## Planned next (as currently scoped, subject to the owner's direction)

1. Resume KB/RAG consumption-side scoping: once real indexes exist
   (Smartworld and others), wire Atlas's backend to query them with
   citations, replacing hardcoded `data.ts` content where it makes sense.
2. Expand the organization registry beyond Meridian/Smartworld as more
   real datasets become available (ZoomInfo data across insurance, retail,
   manufacturing, real estate; LinkedIn data; HubSpot's existing ZoomInfo
   integration in the main portal).
3. Real authorization model before any of the above ships broadly, given
   the sensitivity of the underlying data.
4. HubSpot card deployment once CLI access is available.
5. Extend org-awareness to Reports and Search tabs.

## Where things live (for anyone picking this up)

- Frontend: `apps/shell/src/main.tsx`, workspace switcher + tab gating;
  `apps/shell/src/exposureNetwork/` (data.ts + ExposureNetwork.tsx) for the
  Smartworld network.
- Backend: `services/fastapi-orchestration/app.py` (routes),
  `auth.py` (JWKS validation).
- Auth: `packages/auth/` (MSAL), `docs/backend/entra-oidc-2026-07-19.md`.
- Infra: `infra/k8s/dev01/*.yaml`.
- HubSpot: `services/connectors-hubspot/` (see its own README for exact
  remaining deployment steps).
- This document: point-in-time snapshot, not maintained automatically —
  regenerate rather than hand-edit if it drifts far from reality.
