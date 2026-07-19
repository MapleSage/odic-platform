# ODIC Local Run + dev01 Handoff

## What is runnable now
- Frontend shell in `apps/shell`
- API-backed shell fetch path via `GET /api/workspace`
- Real FastAPI app file in `services/fastapi-orchestration/app.py`
- Dependency-free shim for immediate local demos in `services/fastapi-orchestration/mock_workspace_server.py`

## Fastest local demo path in this runtime
This container currently lacks `pip` / `python -m venv`, so the real FastAPI service cannot be installed here yet.

Use the shim server for immediate local verification:

### Terminal 1 — API shim
```bash
python3 services/fastapi-orchestration/mock_workspace_server.py
```

### Terminal 2 — frontend
```bash
cd apps/shell
NODE_ENV=development npm install --include=dev --no-bin-links
npm run build
node node_modules/vite/bin/vite.js preview --host 0.0.0.0 --port 4173
```

Then open:
- frontend: `http://127.0.0.1:4173`
- proxied API: `http://127.0.0.1:4173/api/workspace`
- direct shim API: `http://127.0.0.1:8000/api/workspace`

## Why the frontend still works if the API is down
`apps/shell/src/main.tsx` now:
- fetches `/api/workspace`
- merges live API data over seeded defaults
- falls back cleanly to seed data if the API is unavailable
- shows a small status pill: `LIVE API` or `SEED DATA`

## dev01 handoff — next exact actions
1. Surface the real dev01 infra repo/path into this runtime or mirror it into GitHub/workspace.
2. Map `infra/k8s/base/namespace.yaml` and `infra/k8s/dev01/kustomization.yaml` into the shared dev01 deployment system.
3. Register ODIC services in CI/CD using shared image naming + ACR conventions.
4. Add workload identity / secret sourcing for:
   - Entra auth
   - HubSpot
   - Microsoft / Fabric
   - Azure AI / GIA
5. Put the frontend behind the shared ingress path and route `/api/*` to ODIC backend services.
6. Replace shim/demo workspace payloads with real service aggregation from:
   - orchestration
   - graph
   - search
   - events / ingestion

## Current blocker for “real backend live” in this container
- `pip` is unavailable
- `python -m venv` cannot bootstrap due missing ensurepip / package support

That is a runtime/tooling blocker, not an ODIC app-structure blocker.
