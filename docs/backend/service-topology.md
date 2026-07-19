# ODIC Backend Service Topology

## Principle
Frontend workspaces are only the surface. The backend must behave like an intelligence operating system: event-driven, graph-aware, connector-based, and report-capable.

## Layered Model
### 1. Edge / experience layer
- `api-gateway`
  - client-safe aggregation
  - auth-aware routing
  - request shaping for shell/workspace/report surfaces

### 2. Orchestration / intelligence layer
- `fastapi-orchestration`
  - GIA execution layer
  - report assembly
  - workflow composition
  - scheduled intelligence / agent jobs
  - recommendation and summary pipelines

### 3. Core domain services
- `rust-graph-service`
  - entities
  - relationships
  - traversals
  - graph projections
- `rust-search-service`
  - unified search
  - relevance/ranking adapters
  - indexing coordination
- `rust-events-service`
  - activity timeline events
  - change notifications
  - source refresh eventing
- `rust-ingestion-service`
  - source normalization
  - ingestion jobs
  - connector fan-in

### 4. Connector services
- `connectors-hubspot`
- `connectors-microsoft`
- `connectors-fabric`

## Initial Responsibility Split
### Rust services own
- high-throughput data APIs
- graph/search/event primitives
- normalized domain operations
- efficient background processing

### FastAPI owns
- orchestration
- cross-service workflows
- GIA integration patterns
- report generation coordination
- admin/intelligence automation endpoints

## Suggested API Boundaries
### Graph service
- `/entities`
- `/relationships`
- `/workspaces/:id/graph`
- `/organizations/:id/context`

### Search service
- `/search`
- `/suggest`
- `/indexes/status`

### Events service
- `/events`
- `/timelines/:objectType/:id`
- `/subscriptions`

### Ingestion service
- `/ingest/:source`
- `/jobs`
- `/sources/status`

### Orchestration service
- `/gia/*`
- `/reports/*`
- `/actions/*`
- `/automation/*`

## Recommended Build Sequence
1. api-gateway skeleton
2. fastapi-orchestration service contract
3. graph + search service hardening
4. events + ingestion crates
5. connector integration flows
6. report and automation pipelines

## Dev01 / AKS Mapping
Each service should deploy independently into `odic-dev01`, with shared cluster services reused from dev01 platform rather than duplicated.