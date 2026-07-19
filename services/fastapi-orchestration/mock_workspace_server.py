#!/usr/bin/env python3
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

WORKSPACE_DATA = {
    "organization": {
        "name": "Meridian Health Systems",
        "meta": {
            "industry": "Healthcare Delivery",
            "hq": "Columbus, OH",
            "employees": "8,200",
            "riskLevel": "ELEVATED RISK"
        },
        "stats": [
            {"label": "OPEN RISKS", "value": "3", "sub": "1 critical"},
            {"label": "OPPORTUNITIES", "value": "2", "sub": "$4.2M pipeline"},
            {"label": "ACTIVE PROJECTS", "value": "5", "sub": "2 at risk"},
            {"label": "LAST FILING", "value": "6d ago", "sub": "compliance"}
        ],
        "people": [
            {"name": "Dana Ferris", "title": "CFO", "dept": "Finance", "lastActivity": "2d ago"},
            {"name": "Owen Mackey", "title": "CIO", "dept": "Technology", "lastActivity": "5d ago"},
            {"name": "Priya Shah", "title": "VP Facilities", "dept": "Operations", "lastActivity": "1w ago"},
            {"name": "Leon Ward", "title": "Compliance Director", "dept": "Legal", "lastActivity": "3d ago"}
        ],
        "risks": [
            {"severity": "CRITICAL", "title": "Vendor contract renewal overdue", "detail": "Master services agreement lapsed 12 days ago"},
            {"severity": "HIGH", "title": "Compliance audit flagged", "detail": "State audit cited two documentation gaps"},
            {"severity": "MEDIUM", "title": "Staffing vacancy in Facilities", "detail": "VP Facilities role open 45+ days"}
        ],
        "opportunities": [
            {"title": "EHR Modernization RFP", "stage": "Qualification", "value": "$2.8M"},
            {"title": "Facilities Expansion - East Campus", "stage": "Proposal", "value": "$1.4M"}
        ]
    },
    "search": {
        "summary": "1,781 results across all intelligence objects",
        "facets": [
            {"label": "Organizations", "count": 128},
            {"label": "People", "count": 412},
            {"label": "Documents", "count": 1204},
            {"label": "Risks", "count": 37}
        ],
        "results": [
            {"code": "ORG", "name": "Meridian Health Systems", "sub": "Healthcare Delivery - Columbus, OH", "tag": "Elevated Risk"},
            {"code": "PPL", "name": "Dana Ferris", "sub": "CFO - Meridian Health Systems", "tag": "Person"},
            {"code": "DOC", "name": "2026 Compliance Filing.pdf", "sub": "Filing - Meridian Health Systems", "tag": "Jul 16"}
        ]
    },
    "reports": {
        "title": "Meridian Health Systems Intelligence Report",
        "sections": [
            {"id": "exec", "label": "Executive Summary", "body": "Meridian Health Systems is in a watch-but-engage posture: risk concentration has increased, but two commercial pathways remain active with credible internal sponsors."},
            {"id": "evidence", "label": "Evidence", "body": "Evidence sources include compliance filings, CRM activities, email/call summaries, relationship graph changes, and GIA-generated synthesis."},
            {"id": "recommendations", "label": "Recommendations", "body": "Resolve Northgate renewal risk, intensify EHR RFP pursuit, and add filing cadence to the watchlist."}
        ]
    },
    "graph": {
        "score": 71,
        "vendors": [
            {"name": "Northgate Supply Co.", "type": "vendor", "metric": "$4.1M/yr"},
            {"name": "Apex EHR Systems", "type": "supplier", "metric": "$2.8M/yr"}
        ],
        "counterparties": [
            {"name": "Heartland Health Capital Partners", "type": "investor", "metric": "18%"},
            {"name": "Ohio Dept. of Health", "type": "regulator", "metric": "n/a"}
        ],
        "edges": [
            {"label": "contracts with", "target": "Northgate Supply Co.", "class": "ORG"},
            {"label": "shares board", "target": "Vantage Behavioral Health", "class": "ORG"},
            {"label": "filed with", "target": "Ohio Dept. of Health", "class": "GOV"}
        ]
    }
}

class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, payload: dict):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            return self._send(200, {"status": "ok", "service": "mock-workspace-server"})
        if self.path == '/api/workspace':
            return self._send(200, WORKSPACE_DATA)
        if self.path == '/api/workspace/organization':
            return self._send(200, WORKSPACE_DATA['organization'])
        if self.path == '/api/workspace/search':
            return self._send(200, WORKSPACE_DATA['search'])
        if self.path == '/api/workspace/reports':
            return self._send(200, WORKSPACE_DATA['reports'])
        if self.path == '/api/workspace/graph':
            return self._send(200, WORKSPACE_DATA['graph'])
        return self._send(404, {"error": "not found", "path": self.path})

    def log_message(self, format, *args):
        return

if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', 8000), Handler)
    print('mock workspace server listening on http://127.0.0.1:8000', flush=True)
    server.serve_forever()
