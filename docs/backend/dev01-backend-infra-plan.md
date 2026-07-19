# ODIC Backend Infra Plan — dev01 Reuse Strategy

## Intent
Stand up ODIC backend infrastructure by reusing the existing `dev01` infrastructure patterns, shared AKS control plane, and Rust service approach already being repurposed for SageRetail.

## Current Assumption
The exact `dev01` infra repo/path is not yet present in this workspace, so this package defines the ODIC-side contract and scaffolding using the following assumption:

- shared dev01 subscription / cluster-level platform remains common
- ODIC gets its own AKS namespace, config boundary, secrets boundary, and release flow
- Rust crates follow the same platform conventions already used for SageRetail/dev01
- HubSpot, Microsoft, Fabric, Graph, OpenSearch, and GIA orchestration remain ODIC services, not cluster-global app logic

## Reuse Model
### Shared from dev01
- AKS cluster / node pools
- ingress controller / cert-manager / external-dns patterns
- Azure Container Registry
- centralized observability stack (logs, metrics, traces)
- base CI/CD conventions
- shared secret/bootstrap conventions
- common network and policy controls

### ODIC-specific
- namespace: `odic-dev01`
- release names and Helm/Kustomize overlays
- app config maps and secrets
- service accounts / workload identity bindings
- service-to-service auth contracts
- ODIC API gateway, orchestration, graph, search, ingestion, connector workloads
- ODIC data stores / indexes / queues where isolated persistence is required

## Recommended Namespace Topology
- `odic-dev01` — app workloads
- optionally later: `odic-jobs-dev01` for heavy async jobs if workload isolation is needed

## Service Topology (initial)
### API / orchestration tier
- `api-gateway` — frontend-facing BFF / edge aggregation
- `fastapi-orchestration` — orchestration, GIA workflows, workflow composition, scheduled intelligence jobs

### Rust core services
- `rust-graph-service` — entity graph traversal, relationship APIs, graph projections
- `rust-search-service` — search APIs, ranking, indexing adapter layer
- `rust-events-service` — event intake, change-notification fanout, activity/timeline backbone
- `rust-ingestion-service` — normalized ingestion pipelines for connectors and source refresh jobs

### Connector tier
- `connectors-hubspot`
- `connectors-microsoft`
- `connectors-fabric`

## Infra Priorities
1. Establish namespace + config boundary in shared AKS
2. Normalize service naming, image naming, and env conventions
3. Define workload identity / secret access pattern
4. Set up internal service discovery and ingress split
5. Add async/event backbone for source refresh + intelligence updates
6. Add observability standard across Rust + FastAPI services

## Config Boundary
Use a strict config split:
- cluster/platform config remains in shared dev01 infra
- ODIC app config lives in ODIC repo overlays or environment config repo

Minimum env groups per service:
- runtime: `APP_ENV`, `LOG_LEVEL`, `SERVICE_NAME`
- auth: Entra / workload identity values
- data: OpenSearch, graph store, cache/queue endpoints
- connectors: HubSpot / Microsoft / Fabric settings
- ai: GIA / Azure AI / orchestration config

## Delivery Recommendation
When the actual dev01 infra repo becomes available, do not redesign this package. Map it by:
1. attaching ODIC namespace manifests to existing AKS platform patterns
2. aligning service/image conventions
3. translating ODIC overlays into the existing deployment mechanism

## Next Engineering Steps
1. confirm actual dev01 repo/path and AKS naming conventions
2. create `odic-dev01` namespace in shared cluster
3. register ODIC workloads in shared CI/CD
4. add deployment manifests or Helm chart wrappers per service
5. add workload identity + secret sourcing
6. connect ingress + internal DNS
7. wire event/search/graph dependencies

## Explicit Non-Goal
ODIC should not fork the entire dev01 platform just to launch backend services. Reuse the platform; isolate the application.