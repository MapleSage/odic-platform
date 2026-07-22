from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import get_current_user
from connect import EmailRequest, EmailResponse, WhatsAppRequest, WhatsAppResponse, get_connect_status, send_email, send_whatsapp
from gia import ChatRequest, ChatResponse, ask_gia
from intelligence import get_intelligence_evidence, get_intelligence_events, get_intelligence_status, get_source_registry

app = FastAPI(title="ODIC Orchestration")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://atlas.sagesure.io", "http://localhost:3000", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(dependencies=[Depends(get_current_user)])

WORKSPACE_DATA = {
    "organization": {
        "name": "Meridian Health Systems",
        "meta": {
            "industry": "Healthcare Delivery",
            "hq": "Columbus, OH",
            "employees": "8,200",
            "riskLevel": "ELEVATED RISK",
        },
        "stats": [
            {"label": "OPEN RISKS", "value": "3", "sub": "1 critical"},
            {"label": "OPPORTUNITIES", "value": "2", "sub": "$4.2M pipeline"},
            {"label": "ACTIVE PROJECTS", "value": "5", "sub": "2 at risk"},
            {"label": "LAST FILING", "value": "6d ago", "sub": "compliance"},
        ],
        "people": [
            {"name": "Dana Ferris", "title": "CFO", "dept": "Finance", "lastActivity": "2d ago"},
            {"name": "Owen Mackey", "title": "CIO", "dept": "Technology", "lastActivity": "5d ago"},
            {"name": "Priya Shah", "title": "VP Facilities", "dept": "Operations", "lastActivity": "1w ago"},
            {"name": "Leon Ward", "title": "Compliance Director", "dept": "Legal", "lastActivity": "3d ago"},
        ],
        "risks": [
            {"severity": "CRITICAL", "title": "Vendor contract renewal overdue", "detail": "Master services agreement lapsed 12 days ago"},
            {"severity": "HIGH", "title": "Compliance audit flagged", "detail": "State audit cited two documentation gaps"},
            {"severity": "MEDIUM", "title": "Staffing vacancy in Facilities", "detail": "VP Facilities role open 45+ days"},
        ],
        "opportunities": [
            {"title": "EHR Modernization RFP", "stage": "Qualification", "value": "$2.8M"},
            {"title": "Facilities Expansion - East Campus", "stage": "Proposal", "value": "$1.4M"},
        ],
    },
    "search": {
        "summary": "1,781 results across all intelligence objects",
        "facets": [
            {"label": "Organizations", "count": 128},
            {"label": "People", "count": 412},
            {"label": "Documents", "count": 1204},
            {"label": "Risks", "count": 37},
        ],
        "results": [
            {"code": "ORG", "name": "Meridian Health Systems", "sub": "Healthcare Delivery - Columbus, OH", "tag": "Elevated Risk"},
            {"code": "PPL", "name": "Dana Ferris", "sub": "CFO - Meridian Health Systems", "tag": "Person"},
            {"code": "DOC", "name": "2026 Compliance Filing.pdf", "sub": "Filing - Meridian Health Systems", "tag": "Jul 16"},
            {"code": "ORG", "name": "Northstar Regional Medical", "sub": "Healthcare Delivery - Toledo, OH", "tag": "Watchlist"},
            {"code": "RSK", "name": "Vendor contract renewal overdue", "sub": "Risk - Meridian Health Systems", "tag": "Critical"},
            {"code": "PPL", "name": "Owen Mackey", "sub": "CIO - Meridian Health Systems", "tag": "Person"},
        ],
    },
    "reports": {
        "title": "Q3 Regional Health Systems Risk Report",
        "sections": [
            {"id": "exec", "label": "Executive Summary", "body": "Meridian Health Systems is in a watch-but-engage posture: risk concentration has increased, but two commercial pathways remain active with credible internal sponsors."},
            {"id": "evidence", "label": "Evidence", "body": "Evidence sources include compliance filings, CRM activities, email/call summaries, relationship graph changes, and GIA-generated synthesis."},
            {"id": "relationships", "label": "Relationships", "body": "Five relationship edges are tracked for Meridian Health Systems, including the Northgate Supply Co. vendor contract and a shared board seat with Vantage Behavioral Health. See the Relationships tab for the full graph."},
            {"id": "visualizations", "label": "Visualizations", "body": "A standing risk-trend chart for this report is not yet built. Live risk and relationship visualizations are available today in the Graph tab."},
            {"id": "timeline", "label": "Timeline", "body": "Five timeline events are sequenced for Meridian Health Systems, from the Jul 16 compliance filing back through the Jun 22 Facilities VP departure. See the Timeline tab for the full sequence."},
            {"id": "sources", "label": "Sources", "body": "Findings draw from the configured source registry (official company sites, newsroom RSS, regulatory filings, public announcements) plus staged dossier evidence surfaced in the Activity Feed's Evidence-backed Intelligence panel."},
            {"id": "ai-analysis", "label": "AI Analysis", "body": "Ask Atlas in the chat panel for organization-specific synthesis on demand. This report does not yet auto-generate a standing AI analysis section."},
            {"id": "recommendations", "label": "Recommendations", "body": "Resolve Northgate renewal risk, intensify EHR RFP pursuit, and add filing cadence to the watchlist."},
        ],
    },
    "graph": {
        "score": 71,
        "vendors": [
            {"name": "Northgate Supply Co.", "type": "vendor", "metric": "$4.1M/yr"},
            {"name": "Apex EHR Systems", "type": "supplier", "metric": "$2.8M/yr"},
        ],
        "counterparties": [
            {"name": "Heartland Health Capital Partners", "type": "investor", "metric": "18%"},
            {"name": "Ohio Dept. of Health", "type": "regulator", "metric": "n/a"},
        ],
        "edges": [
            {"label": "contracts with", "target": "Northgate Supply Co.", "class": "ORG"},
            {"label": "shares board", "target": "Vantage Behavioral Health", "class": "ORG"},
            {"label": "filed with", "target": "Ohio Dept. of Health", "class": "GOV"},
        ],
    },
}


@app.get('/health')
def health():
    return {"status": "ok", "service": "fastapi-orchestration"}


@api.get('/api/workspace')
def workspace():
    return WORKSPACE_DATA


@api.get('/api/workspace/organization')
def workspace_organization():
    return WORKSPACE_DATA["organization"]


@api.get('/api/workspace/search')
def workspace_search():
    return WORKSPACE_DATA["search"]


@api.get('/api/workspace/reports')
def workspace_reports():
    return WORKSPACE_DATA["reports"]


@api.get('/api/workspace/graph')
def workspace_graph():
    return WORKSPACE_DATA["graph"]


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
