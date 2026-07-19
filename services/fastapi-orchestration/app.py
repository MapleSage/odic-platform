from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ODIC Orchestration")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        ],
    },
    "reports": {
        "title": "Meridian Health Systems Intelligence Report",
        "sections": [
            {"id": "exec", "label": "Executive Summary", "body": "Meridian Health Systems is in a watch-but-engage posture: risk concentration has increased, but two commercial pathways remain active with credible internal sponsors."},
            {"id": "evidence", "label": "Evidence", "body": "Evidence sources include compliance filings, CRM activities, email/call summaries, relationship graph changes, and GIA-generated synthesis."},
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


@app.get('/api/workspace')
def workspace():
    return WORKSPACE_DATA


@app.get('/api/workspace/organization')
def workspace_organization():
    return WORKSPACE_DATA["organization"]


@app.get('/api/workspace/search')
def workspace_search():
    return WORKSPACE_DATA["search"]


@app.get('/api/workspace/reports')
def workspace_reports():
    return WORKSPACE_DATA["reports"]


@app.get('/api/workspace/graph')
def workspace_graph():
    return WORKSPACE_DATA["graph"]
