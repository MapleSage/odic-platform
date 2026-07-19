# ODIC Backend Immediate Roadmap

## Now that frontend references are present
The backend should move from generic scaffolding to design-driven contracts.

## Immediate workstreams
### 1. Workspace aggregate APIs
First-class workspace loads for:
- organization
- search
- reports
- graph/exposure

### 2. Exposure network backend
Required because the frontend handoff includes a concrete relationship graph with:
- sourced edges
- confidence grades
- drill-down modals
- full-chart expansion
- interlocking directorate panel

### 3. HubSpot card backend
Required because design now includes specific company/contact/deal card layouts.

### 4. Activity + sync backbone
Required because the design includes channel sync chips and filtered feed behavior.

## Recommended namespace + service rollout
- namespace: `odic-dev01`
- first deployables:
  - `api-gateway`
  - `fastapi-orchestration`
  - `rust-graph-service`
  - `rust-search-service`
  - `rust-events-service`
  - `rust-ingestion-service`

## Dependency assumptions
- shared AKS / dev01 platform reused
- ODIC workloads isolated by namespace and config
- shared CI/CD patterns reused from dev01 / SageRetail platform

## What to request next from infra owner
1. actual dev01 infra repo/path
2. current AKS namespace conventions
3. ingress/workload identity standard
4. preferred deployment mechanism (Helm, Kustomize, Argo, GitHub Actions, etc.)
5. ACR naming rules
6. secrets/config sourcing pattern
