import os

from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from auth import get_current_user
from azure_search import configured as azure_search_configured, search as azure_search_query
from connect import EmailRequest, EmailResponse, WhatsAppRequest, WhatsAppResponse, get_connect_status, send_email, send_whatsapp
from connectors import ConnectorResponse, now_iso, unavailable, unmapped
from exposure_network import get_exposure_network_data
from gia import ChatRequest, ChatResponse, ask_gia
from intelligence import get_intelligence_evidence, get_intelligence_events, get_intelligence_status, get_source_registry
from orgs import get_organizations, get_source_mapping, get_workspace_data
from search import local_search

app = FastAPI(title="ODIC Orchestration")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://atlas.sagesure.io", "http://localhost:3000", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(dependencies=[Depends(get_current_user)])


@app.get('/health')
def health():
    return {"status": "ok", "service": "fastapi-orchestration"}


@api.get('/api/organizations')
def organizations():
    return {"organizations": get_organizations()}


@api.get('/api/workspace')
def workspace(org: str = "meridian"):
    return get_workspace_data(org)


@api.get('/api/workspace/organization')
def workspace_organization(org: str = "meridian"):
    return get_workspace_data(org)["organization"]


@api.get('/api/search')
def search(q: str = "", org: str | None = None, facet: str | None = None):
    """Search across every registered org. Azure AI Search is used when
    configured (ATLAS_AZURE_SEARCH_ENDPOINT/INDEX + AZURE_SEARCH_API_KEY);
    otherwise -- and if a configured live request fails -- falls back to a
    deterministic local search over the file-backed org registry."""
    if azure_search_configured():
        try:
            return azure_search_query(query=q, org=org, facet=facet)
        except RuntimeError as exc:
            result = local_search(query=q, org_id=org, facet=facet)
            result['degraded'] = True
            result['warning'] = str(exc)
            return result
    return local_search(query=q, org_id=org, facet=facet)


@api.get('/api/workspace/search')
def workspace_search(org: str = "meridian", q: str = "", facet: str | None = None):
    if q or facet:
        return search(q=q, org=org, facet=facet)
    return get_workspace_data(org)["search"]


@api.get('/api/workspace/reports')
def workspace_reports(org: str = "meridian"):
    return get_workspace_data(org)["reports"]


@api.get('/api/workspace/graph')
def workspace_graph(org: str = "meridian"):
    return get_workspace_data(org)["graph"]


@api.get('/api/orgs/{org_id}/exposure-network')
def org_exposure_network(org_id: str):
    data = get_exposure_network_data(org_id)
    if data is None:
        raise HTTPException(status_code=404, detail=f"No Exposure Network data file for organization '{org_id}'")
    return data


def _hubspot_source_status(org_id: str) -> ConnectorResponse:
    company_id = get_source_mapping(org_id, "hubspot").get("companyId")
    if not company_id:
        return unmapped("hubspot-crm", "hubspot")
    if not os.getenv("HUBSPOT_ACCESS_TOKEN"):
        return unavailable("hubspot-crm", "hubspot", company_id, "HUBSPOT_ACCESS_TOKEN not configured in this environment")
    return unavailable("hubspot-crm", "hubspot", company_id, "HubSpot connector not yet implemented (Phase 3)")


def _neo4j_source_status(org_id: str) -> ConnectorResponse:
    node_id = get_source_mapping(org_id, "neo4j").get("nodeId")
    if not node_id:
        return unmapped("neo4j-graph", "neo4j")
    return unavailable("neo4j-graph", "neo4j", node_id, "Neo4j connector not yet provisioned (Phase 2)")


def _azure_search_source_status(org_id: str) -> ConnectorResponse:
    entity_id = get_source_mapping(org_id, "azureSearch").get("entityId")
    if not entity_id:
        return unmapped("azure-ai-search", "azure-search")
    if not azure_search_configured():
        return unavailable("azure-ai-search", "azure-search", entity_id, "Azure AI Search credentials not configured in this environment")
    return ConnectorResponse(sourceId="azure-ai-search", authority="azure-search", status="live", externalId=entity_id, fetchedAt=now_iso())


@api.get('/api/organizations/{org_id}/sources', response_model=dict[str, ConnectorResponse])
def organization_sources(org_id: str):
    """Per-connector status for one org -- resolved by explicit ID mapping only,
    never by matching org name. 404s (unknown org) propagate from get_source_mapping."""
    return {
        "hubspot": _hubspot_source_status(org_id),
        "neo4j": _neo4j_source_status(org_id),
        "azureSearch": _azure_search_source_status(org_id),
    }


@api.get('/api/intelligence/sources')
def intelligence_sources():
    return get_source_registry()


@api.get('/api/intelligence/status')
def intelligence_status():
    return get_intelligence_status()


@api.get('/api/intelligence/events')
def intelligence_events(entityId: str | None = None):
    return get_intelligence_events(entityId)


@api.get('/api/intelligence/evidence/{event_id}')
def intelligence_evidence(event_id: str):
    return get_intelligence_evidence(event_id)


@api.post('/api/gia/chat', response_model=ChatResponse)
def gia_chat(request: ChatRequest):
    return ask_gia(request)


@api.get('/api/connect/status')
def connect_status():
    return get_connect_status()


@api.post('/api/connect/email/send', response_model=EmailResponse)
def connect_send_email(request: EmailRequest):
    return send_email(request)


@api.post('/api/connect/whatsapp/send', response_model=WhatsAppResponse)
def connect_send_whatsapp(request: WhatsAppRequest):
    return send_whatsapp(request)


app.include_router(api)
