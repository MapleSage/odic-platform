# Atlas deployment handoff — 2026-07-19

## What this bundle is
A clean source handoff of the current `odic-platform` worktree for deployment handoff.

## Product naming direction now locked in code
- Public product name: **Atlas**
- Preferred host/subdomain: **`atlas.sagesure.io`**
- Internal codename remains: **ODIC**
- In-product assistant wording for this surface: **Atlas / Atlas AI**
- Do **not** use `GIA` or `SageSure AI` as the user-facing assistant name inside this app surface.

## What changed in the frontend
The shell has been updated to reflect the Atlas naming direction:
- sidebar brand now shows **Atlas**
- subtitle now shows **Enterprise Intelligence OS**
- top search wording now says users can **ask Atlas**
- assistant panel wording now says **Ask Atlas** / **Atlas AI**
- browser title updated to `Atlas | Enterprise Intelligence OS`

Primary files:
- `apps/shell/src/main.tsx`
- `apps/shell/src/styles.css`
- `apps/shell/index.html`
- `apps/shell/vite.config.ts`

## Current runtime/app status
- Frontend shell builds successfully.
- Frontend fetches `GET /api/workspace`.
- Backend stub/shim path exists for local verification.
- Real AKS deployment is **not** completed in this runtime.

## Verified local gate
From `apps/shell`:
- `npm run build` ✅

## Important current deployment blockers from this runtime
These are blockers for the OpenClaw runtime that produced this bundle, not necessarily blockers for the deployer:
- Azure CLI was present but this runtime was **not logged into Azure**.
- AKS target discovery was unavailable from this runtime.
- Visible ODIC k8s overlay in this repo is still only namespace-level scaffolding:
  - `infra/k8s/base/namespace.yaml`
  - `infra/k8s/dev01/kustomization.yaml`
- Full deployment/service/ingress manifests are **not** present here in completed form.
- Auth implementation is still placeholder-level in `packages/auth` and not yet real Entra OIDC parity.

## Recommended deployer actions
1. Pull this bundle into the deployment-capable environment.
2. Build and serve the frontend from `apps/shell`.
3. Wire host as `atlas.sagesure.io`.
4. Route `/api/*` to the ODIC backend path or temporary shim/BFF as appropriate.
5. Reuse existing shared dev01/AKS patterns instead of inventing a new platform shape.
6. Keep `ODIC` internal if needed, but present **Atlas** publicly.

## Auth guidance
Do not ship public Atlas UX using `GIA` or `SageSure AI` labels.
Target eventual auth parity with existing Entra-backed surfaces, but note that real auth implementation is not yet finished in this code state.

## Suggested immediate deploy goal
Treat this as a **frontend/dev deployment handoff** for Atlas branding and shell validation, not as a claim that full production auth/orchestration is complete.
