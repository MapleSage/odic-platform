# Progress Log

## 2026-07-19
- Re-aligned local work onto live repo state (`real-app` tracking `origin/main`).
- Confirmed Claude design handoff files are present in repo.
- Started real implementation pass for `apps/shell`.
- Created planning files for durable execution state in `odic-platform`.
- Replaced the placeholder `apps/shell/src/main.tsx` with a real ODIC shell pass and added `apps/shell/src/styles.css`.
- Implemented the core workspace shell, top bar, left nav, utility rail, GIA panel, stat cards, and Organization/Search/Reports/Graph workspace switching.
- Implemented Organization sub-tabs and seeded them with design-aligned mock data.
- Added first-pass dark graph/exposure workspace instead of leaving Graph as a stub.
- Hit three environment-specific install/build issues (`pnpm` futime failure, npm devDependency omission under production env, npm symlink permissions) and worked around them without blocking delivery.
- Updated `apps/shell/package.json` scripts to use direct `node node_modules/...` entrypoints.
- Verified build success with `npm run build` in `apps/shell`.
- Started local Vite preview and confirmed HTTP 200 from `http://127.0.0.1:4173`.
- Expanded `services/fastapi-orchestration/app.py` from health-only stub to initial ODIC workspace API endpoints (`/api/workspace`, `/api/workspace/organization`, `/api/workspace/search`, `/api/workspace/reports`, `/api/workspace/graph`).
- Verified Python syntax for the FastAPI app with `python3 -m py_compile services/fastapi-orchestration/app.py`.
- Refactored `apps/shell/src/main.tsx` so the shell now fetches `/api/workspace`, merges live data onto the seeded UI model, and shows `LIVE API` vs `SEED DATA` state visibly.
- Updated `apps/shell/vite.config.ts` to proxy `/api` to `127.0.0.1:8000` in both dev and preview.
- Rebuilt the shell successfully after the API wiring changes.
- Could not run real FastAPI in this container because there is no `pip` and `venv` bootstrap support is missing; created `services/fastapi-orchestration/mock_workspace_server.py` as a dependency-free runtime shim instead.
- Verified shim health on `http://127.0.0.1:8000/health` and verified proxied workspace data through frontend preview on `http://127.0.0.1:4173/api/workspace`.
- Added `docs/backend/local-run-and-dev01-handoff.md` with the fastest local demo path plus exact dev01 handoff steps.
