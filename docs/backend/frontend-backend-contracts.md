# ODIC Frontend-to-Backend Contract Draft

## Purpose
Translate the current Claude Design handoff in `design_handoff_odic_intelligence_platform/` into a concrete backend contract package for ODIC services.

## Design Inputs Mapped
The current frontend/design bundle defines three priority surfaces:
1. `workspace-shell.html`
2. `exposure-network.html`
3. `hubspot-cards.html`

These drive the first backend contract scope.

---

## 1. Workspace Shell Contract

### Shell-level state the backend must support
- active organization/workspace context
- global search suggestions/results
- GIA recommendations and quick actions
- utility counts (notifications, sync warnings, context alerts)
- recent workspace history

### Organization Workspace
The Organization workspace needs a single aggregated context response optimized for initial load.

#### Suggested endpoint
`GET /organizations/{organizationId}/workspace`

#### Response shape
```json
{
  "organization": {
    "id": "org_123",
    "name": "Smartworld Developers",
    "industry": "Real Estate",
    "hq": "Gurugram, India",
    "employeeCount": 2400,
    "riskLevel": "elevated"
  },
  "stats": [
    { "key": "open_risks", "label": "Open Risks", "value": 7, "trend": "+2 this week" },
    { "key": "active_projects", "label": "Active Projects", "value": 12, "trend": "4 in launch phase" }
  ],
  "people": [],
  "recentActivity": [],
  "risks": [],
  "opportunities": [],
  "timeline": [],
  "relationships": [],
  "documents": [],
  "aiInsights": [],
  "activityFeed": {
    "syncStatus": [],
    "items": []
  }
}
```

### Activity Feed
The design explicitly needs channel-level sync metadata.

#### Suggested endpoint
`GET /organizations/{organizationId}/activity-feed?channel=all|email|call|social|filing|crm`

#### Required fields
- `channel`
- `title`
- `timestamp`
- `snippet`
- `status`
- `sourceId`
- `entityRefs[]`
- `syncState` at feed level (`live`, `delayed`, `error`)
- `lastSyncedAt`

### Search Workspace
The design uses a 3-column search layout: facets, results, preview.

#### Suggested endpoints
- `GET /search?q=...`
- `GET /search/facets?q=...`
- `GET /search/results/{resultId}/preview`

#### Search result object
```json
{
  "id": "entity_987",
  "type": "organization",
  "code": "ORG",
  "title": "Smartworld Developers Pvt. Ltd.",
  "subtitle": "Real Estate Developer · Gurugram",
  "tags": ["elevated risk", "active projects"],
  "preview": {
    "summary": "...",
    "keyFacts": []
  }
}
```

### Reports Workspace
Reports are rendered as living intelligence objects, not PDFs.

#### Suggested endpoints
- `GET /reports/{reportId}`
- `POST /reports`
- `GET /reports/{reportId}/versions`
- `POST /reports/{reportId}/refresh`

#### Required report sections
- executive summary
- evidence
- relationships
- visualizations
- timeline
- sources
- ai analysis
- recommendations
- export metadata
- version history

---

## 2. Exposure Network Contract

## Purpose
Support the graph/exposure network view with real sourced edges, evidence grades, modal drilldowns, and full-chart promotion.

### Core requirements from design
- every visible line is a real relationship edge
- every box is an entity record
- entity detail opens in modal
- modal supports drill-down into child entities
- any child can open as a full chart
- evidence inspector shows the last clicked object/edge

### Suggested endpoints
- `GET /organizations/{organizationId}/exposure-network`
- `GET /entities/{entityId}`
- `GET /entities/{entityId}/children`
- `GET /relationships/{relationshipId}`

### Network response shape
```json
{
  "root": {
    "id": "org_123",
    "name": "Smartworld Developers Pvt. Ltd."
  },
  "platformNode": {},
  "leftEntities": [],
  "rightEntities": [],
  "centerEntities": [],
  "edges": [
    {
      "id": "rel_001",
      "from": "vendor_01",
      "to": "spv_03",
      "kind": "epc_contract",
      "confidenceGrade": "A",
      "style": "solid",
      "evidenceSummary": "...",
      "sources": []
    }
  ],
  "supplementaryLeft": [],
  "supplementaryRight": [],
  "interlocks": []
}
```

### Entity detail modal shape
```json
{
  "id": "entity_123",
  "title": "Smartworld Sky Arc SPV",
  "subtitle": "Project SPV · Residential tower development",
  "sections": [
    {
      "heading": "PROFILE",
      "rows": [
        { "label": "Entity Type", "value": "SPV" },
        { "label": "Jurisdiction", "value": "India" }
      ]
    }
  ],
  "children": [
    {
      "id": "entity_124",
      "name": "Tower A Contracting Unit",
      "role": "Subsidiary / delivery node"
    }
  ],
  "chartEligible": true
}
```

### Interlocking directorate object
```json
{
  "personId": "person_77",
  "name": "Director Name",
  "bridges": ["Smartworld Developers", "SPV Alpha", "Vendor Beta"]
}
```

---

## 3. HubSpot CRM Cards Contract

## Purpose
Power native HubSpot CRM cards for Company, Contact, and Deal records.

### Build model
The design explicitly expects real HubSpot UI Extension / CRM Card implementations, not generic HTML embeds.

### Suggested ODIC endpoints
- `GET /hubspot/cards/company/{hubspotCompanyId}`
- `GET /hubspot/cards/contact/{hubspotContactId}`
- `GET /hubspot/cards/deal/{hubspotDealId}`

### Company card response
```json
{
  "recordType": "company",
  "recordId": "hubspot_company_1",
  "syncedAt": "2026-07-19T03:40:00Z",
  "riskLevel": "elevated",
  "exposureScore": 71,
  "stats": [
    { "label": "Open Risks", "value": 3 },
    { "label": "Opportunities", "value": 2 },
    { "label": "Active Projects", "value": 5 },
    { "label": "Last Filing", "value": "6d ago" }
  ],
  "giaRecommendation": "Vendor contract lapse plus a compliance flag increases churn risk.",
  "actions": [
    { "type": "link", "label": "Open in ODIC", "target": "..." },
    { "type": "action", "label": "Generate Report", "actionKey": "generate_report" }
  ]
}
```

### Contact card response
Must support:
- knowledge graph role text
- linked risks/opportunities list
- last activity
- actions

### Deal card response
Must support:
- stage
- deal value
- win propensity
- GIA recommendation
- actions

---

## Service Ownership Mapping

### api-gateway
Owns frontend-facing composition and stable client contracts.

### fastapi-orchestration
Owns:
- GIA recommendation assembly
- report creation/refresh orchestration
- card payload composition where multiple backends are involved

### rust-graph-service
Owns:
- entity detail
- relationships
- interlock traversal
- exposure network graph data

### rust-search-service
Owns:
- search results
- facet counts
- preview ranking/search relevance

### rust-events-service
Owns:
- activity feed events
- timeline event normalization
- sync-state event fanout

### rust-ingestion-service
Owns:
- connector ingestion jobs
- source refresh pipelines
- status of channel freshness

### connectors-hubspot / microsoft / fabric
Own integrations and source-specific normalization.

---

## Recommended Next Backend Implementation Sequence
1. Define `organization workspace aggregate` contract
2. Define `exposure network` contract
3. Define `activity feed + sync status` contract
4. Define `HubSpot cards` contract
5. Bind service ownership and event flows
6. Add actual OpenAPI/protobuf/schema files once repo implementation conventions are confirmed
