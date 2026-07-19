# ODIC Platform Task Plan

## Goal
Turn the current ODIC shell scaffold into a runnable real app foundation based on the Claude design handoff, starting with the workspace shell and core views, then validating it with a local build.

## Current Phase
Phase 3 — deepen graph/exposure fidelity beyond first shell pass

## Phases
- [complete] Phase 1: Replace placeholder shell with real ODIC workspace shell UI and sample state
- [complete] Phase 2: Add Organization / Search / Reports / Graph view switching and GIA panel behavior
- [pending] Phase 3: Bring in first-class Exposure Network view implementation or embed-compatible surface
- [complete] Phase 4: Validate app build and note next backend wiring targets
- [complete] Phase 5: Wire frontend to `/api/workspace` with graceful fallback and local verification path

## Constraints
- Move fast, but keep the app runnable.
- Use Claude handoff as visual/interaction reference, not as literal production code.
- Prefer simple local state and deterministic mock data for first pass.
- Do not block frontend progress on missing dev01 infra path.

## Open Questions
- Whether to fully recreate the separate exposure-network screen in this pass or ship it as the Graph workspace first.
- Whether HubSpot cards belong in the main app immediately or in a separate package later.

## Errors Encountered
| Error | Attempt | Resolution |
|---|---:|---|
| `pnpm install` failed with `EPERM futime` on workspace filesystem | 1 | Switched to app-local `npm install` flow instead of repeating pnpm at repo root. |
| `npm install` initially omitted devDependencies because runtime had `NODE_ENV=production` and `npm config omit=dev` | 2 | Re-ran install with `NODE_ENV=development npm install --include=dev`. |
| npm bin symlink creation failed with `EACCES` in workspace | 3 | Installed with `--no-bin-links` and updated package scripts to invoke `node node_modules/...` directly. |
