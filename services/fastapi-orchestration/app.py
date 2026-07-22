from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import get_current_user
from connect import EmailRequest, EmailResponse, WhatsAppRequest, WhatsAppResponse, get_connect_status, send_email, send_whatsapp
from gia import ChatRequest, ChatResponse, ask_gia
from intelligence import get_intelligence_evidence, get_intelligence_events, get_intelligence_status, get_source_registry
from orgs import get_organizations, get_workspace_data

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


@api.get('/api/workspace/search')
def workspace_search(org: str = "meridian"):
    return get_workspace_data(org)["search"]


@api.get('/api/workspace/reports')
def workspace_reports(org: str = "meridian"):
    return get_workspace_data(org)["reports"]


@api.get('/api/workspace/graph')
def workspace_graph(org: str = "meridian"):
    return get_workspace_data(org)["graph"]


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
