# Monorepo Scaffold

## Apps
- `apps/shell` — workspace shell, routing, layout, auth integration, GIA entry points

## Packages
- `ui` — Fluent UI wrappers, tokens bridge, reusable design-system primitives
- `workspace-core` — workspace shell model, nav, tabs, shared entity layouts
- `graph` — relationship viewer, graph adapters, React Flow/D3 integration layer
- `maps` — Azure Maps integration helpers
- `ai-gia` — GIA client, prompt contracts, reasoning surface helpers
- `auth` — Azure Entra auth adapters
- `reporting` — report object model and viewers
- `dashboards` — generated dashboard containers and embedding adapters

## Services
- `api-gateway` — edge API contract and BFF layer
- `fastapi-orchestration` — orchestration, connector composition, GIA backend flows
- `rust-graph-service` — graph/entity APIs and traversal
- `rust-search-service` — search, ranking, indexing helpers
- `connectors-hubspot` — HubSpot CRM/project/task/forms connector layer
- `connectors-microsoft` — Graph/Entra/Fabric/Power BI connector layer
- `connectors-fabric` — Fabric-specific data/semantic/dashboard integration
