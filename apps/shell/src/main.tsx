import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from '@odic/auth';
import './styles.css';

type ViewId = 'organization' | 'search' | 'reports' | 'graph';
type OrgTabId = 'overview' | 'timeline' | 'relationships' | 'documents' | 'insights' | 'activity';
type ActivityFilter = 'all' | 'email' | 'call' | 'social' | 'filing' | 'crm';
type GraphMode = 'ledger' | 'matrix';

type NavItem = { id: ViewId; label: string; code: string };
type StatCard = { label: string; value: string; sub: string; accent: string; subColor?: string };
type Person = { name: string; title: string; dept: string; lastActivity: string };
type Risk = { severity: string; title: string; detail: string; color: string; dimColor: string };
type Opportunity = { title: string; stage: string; value: string };
type TimelineEvent = { date: string; label: string; detail: string; dotColor: string };
type Relationship = { from: string; type: string; to: string };
type DocumentRecord = { name: string; type: string; tag: string; date: string };
type AiInsight = { title: string; body: string; action: string };
type SearchFacet = { label: string; count: number };
type SearchResult = { code: string; name: string; sub: string; tag: string; badgeBg: string; badgeColor: string };
type ReportSection = { id: string; label: string; body: string };
type SyncStatus = { channel: string; status: string; color: string };
type ActivityItem = { ch: Exclude<ActivityFilter, 'all'>; title: string; snippet: string; time: string };
type GiaCard = { title: string; body: string; action: string };
type GraphStat = { label: string; value: string; color: string };
type GraphNode = { code: string; name: string; meta: string; metric: string; color: string };
type GraphEdge = { label: string; code: string; label2: string; color: string; chartTop: string; chartReports: string[]; bars: number[] };
type SearchViewData = { summary: string; facets: SearchFacet[]; results: SearchResult[] };
type ReportsViewData = { title: string; sections: ReportSection[] };
type GraphViewData = { score: number; vendors: GraphNode[]; counterparties: GraphNode[]; edges: GraphEdge[]; stats: GraphStat[] };
type OrganizationViewData = {
  name: string;
  meta: { industry: string; hq: string; employees: string; riskLevel: string };
  stats: StatCard[];
  people: Person[];
  recentActivity: { time: string; text: string }[];
  risks: Risk[];
  opportunities: Opportunity[];
  timeline: TimelineEvent[];
  relationships: Relationship[];
  documents: DocumentRecord[];
  insights: AiInsight[];
  syncStatuses: SyncStatus[];
  activity: ActivityItem[];
};
type WorkspaceData = {
  organization: OrganizationViewData;
  search: SearchViewData;
  reports: ReportsViewData;
  graph: GraphViewData;
  recentItems: string[];
  giaQuickActions: string[];
  giaCards: GiaCard[];
};

type ApiWorkspaceData = Partial<{
  organization: Partial<Omit<OrganizationViewData, 'recentActivity' | 'timeline' | 'relationships' | 'documents' | 'insights' | 'syncStatuses' | 'activity'>>;
  search: Partial<SearchViewData>;
  reports: Partial<ReportsViewData>;
  graph: Partial<{
    score: number;
    vendors: Array<Partial<GraphNode>>;
    counterparties: Array<Partial<GraphNode>>;
    edges: Array<Partial<GraphEdge>>;
  }>;
}>;

const NAV_ITEMS: NavItem[] = [
  { id: 'organization', label: 'Organization', code: 'ORG' },
  { id: 'search', label: 'Search', code: 'SRCH' },
  { id: 'reports', label: 'Reports', code: 'RPT' },
  { id: 'graph', label: 'Graph', code: 'GRPH' },
];

const ORG_TABS: { id: OrgTabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'documents', label: 'Documents' },
  { id: 'insights', label: 'AI Insights' },
  { id: 'activity', label: 'Activity Feed' },
];

const DEFAULT_WORKSPACE: WorkspaceData = {
  organization: {
    name: 'Meridian Health Systems',
    meta: {
      industry: 'Healthcare Delivery',
      hq: 'Columbus, OH',
      employees: '8,200',
      riskLevel: 'ELEVATED RISK',
    },
    stats: [
      { label: 'OPEN RISKS', value: '3', sub: '1 critical', subColor: '#b64c42', accent: '#F7761F' },
      { label: 'OPPORTUNITIES', value: '2', sub: '$4.2M pipeline', subColor: '#2f7f53', accent: '#60b072' },
      { label: 'ACTIVE PROJECTS', value: '5', sub: '2 at risk', subColor: '#506074', accent: '#264968' },
      { label: 'LAST FILING', value: '6d ago', sub: 'compliance', subColor: '#506074', accent: '#3D9CA2' },
    ],
    people: [
      { name: 'Dana Ferris', title: 'CFO', dept: 'Finance', lastActivity: '2d ago' },
      { name: 'Owen Mackey', title: 'CIO', dept: 'Technology', lastActivity: '5d ago' },
      { name: 'Priya Shah', title: 'VP Facilities', dept: 'Operations', lastActivity: '1w ago' },
      { name: 'Leon Ward', title: 'Compliance Director', dept: 'Legal', lastActivity: '3d ago' },
    ],
    recentActivity: [
      { time: '09:14', text: 'Atlas AI flagged vendor contract renewal overdue' },
      { time: 'Mon', text: 'New compliance filing detected' },
      { time: 'Fri', text: 'Meeting logged with Dana Ferris (CFO)' },
      { time: 'Wed', text: 'Relationship change: new board member added' },
    ],
    risks: [
      { severity: 'CRITICAL', title: 'Vendor contract renewal overdue', detail: 'Master services agreement lapsed 12 days ago', color: '#ad4339', dimColor: '#f7e1db' },
      { severity: 'HIGH', title: 'Compliance audit flagged', detail: 'State audit cited two documentation gaps', color: '#9a6b10', dimColor: '#fbf2d5' },
      { severity: 'MEDIUM', title: 'Staffing vacancy in Facilities', detail: 'VP Facilities role open 45+ days', color: '#35774d', dimColor: '#e0f3e7' },
    ],
    opportunities: [
      { title: 'EHR Modernization RFP', stage: 'Qualification', value: '$2.8M' },
      { title: 'Facilities Expansion - East Campus', stage: 'Proposal', value: '$1.4M' },
    ],
    timeline: [
      { date: 'Jul 16', label: 'Compliance filing submitted', detail: 'State health authority - routine filing', dotColor: '#3D9CA2' },
      { date: 'Jul 12', label: 'Vendor contract lapsed', detail: 'MSA with Northgate Supply not renewed', dotColor: '#c44b40' },
      { date: 'Jul 8', label: 'New board member added', detail: 'Relationship graph updated automatically', dotColor: '#60b072' },
      { date: 'Jun 30', label: 'RFP published', detail: 'EHR modernization opportunity opened', dotColor: '#60b072' },
      { date: 'Jun 22', label: 'Facilities VP departure', detail: 'Staffing vacancy risk opened', dotColor: '#d4a017' },
    ],
    relationships: [
      { from: 'Meridian Health Systems', type: 'contracts with', to: 'Northgate Supply Co.' },
      { from: 'Dana Ferris', type: 'reports to', to: 'CEO - Meridian Health Systems' },
      { from: 'Meridian Health Systems', type: 'shares board member with', to: 'Vantage Behavioral Health' },
      { from: 'Meridian Health Systems', type: 'filed with', to: 'Ohio Dept. of Health' },
      { from: 'Owen Mackey', type: 'sponsors', to: 'EHR Modernization RFP' },
    ],
    documents: [
      { name: '2026 Compliance Filing.pdf', type: 'Filing', tag: 'Compliance', date: 'Jul 16' },
      { name: 'Vendor Master Agreement - Northgate.docx', type: 'Contract', tag: 'Risk', date: 'Jul 12' },
      { name: 'Board Minutes - Q2.pdf', type: 'Minutes', tag: 'Governance', date: 'Jun 28' },
      { name: 'EHR Modernization RFP.pdf', type: 'RFP', tag: 'Opportunity', date: 'Jun 30' },
      { name: 'Facilities Expansion Brief.pptx', type: 'Brief', tag: 'Opportunity', date: 'Jun 18' },
    ],
    insights: [
      { title: 'Renewal risk rising', body: 'Vendor contract lapse plus a compliance flag increases churn risk on the Northgate relationship this quarter.', action: 'Draft outreach' },
      { title: 'RFP alignment', body: 'EHR Modernization RFP scope matches two prior wins in this vertical - high propensity to convert.', action: 'View similar deals' },
      { title: 'Staffing signal', body: 'The Facilities VP vacancy correlates with delayed expansion timelines in comparable organizations.', action: 'Flag for review' },
      { title: 'Filing pattern', body: 'Filing cadence is 20% slower than peer organizations, worth monitoring through quarter close.', action: 'Add to watchlist' },
    ],
    syncStatuses: [
      { channel: 'Email', status: 'Live', color: '#5FA86B' },
      { channel: 'Calls', status: 'Live', color: '#5FA86B' },
      { channel: 'Social', status: 'Delayed 12m', color: '#F7C948' },
      { channel: 'Filings', status: 'Live', color: '#5FA86B' },
      { channel: 'CRM', status: 'Live', color: '#5FA86B' },
    ],
    activity: [
      { ch: 'email', title: 'Dana Ferris replied on Northgate renewal', snippet: '“We can get legal on a call Thursday to review the lapsed MSA terms.”', time: '12m ago' },
      { ch: 'call', title: '24-min call logged with Owen Mackey (CIO)', snippet: 'Discussed EHR Modernization RFP timeline and vendor shortlist.', time: '1h ago' },
      { ch: 'social', title: 'LinkedIn: VP Facilities role reposted', snippet: 'Meridian Health Systems facilities leadership opening gaining engagement.', time: '2h ago' },
      { ch: 'filing', title: 'New compliance filing detected', snippet: 'State health authority filing indexed and linked to Documents tab.', time: '6h ago' },
      { ch: 'crm', title: 'Opportunity stage changed', snippet: 'EHR Modernization RFP moved from Qualification → Proposal.', time: 'Yesterday' },
      { ch: 'email', title: 'Compliance team requested escrow statement', snippet: 'Leon Ward asked for an updated 70% escrow account statement.', time: 'Yesterday' },
      { ch: 'call', title: 'Missed call from Leon Ward (Compliance Director)', snippet: 'No voicemail left - flagged for callback.', time: '2d ago' },
      { ch: 'social', title: 'Regional business journal mention', snippet: 'Press coverage of facilities expansion plans picked up by Atlas AI monitoring.', time: '3d ago' },
    ],
  },
  search: {
    summary: '1,781 results across all intelligence objects',
    facets: [
      { label: 'Organizations', count: 128 },
      { label: 'People', count: 412 },
      { label: 'Documents', count: 1204 },
      { label: 'Risks', count: 37 },
    ],
    results: [
      { code: 'ORG', name: 'Meridian Health Systems', sub: 'Healthcare Delivery - Columbus, OH', tag: 'Elevated Risk', badgeBg: '#e1eef7', badgeColor: '#1d5d92' },
      { code: 'PPL', name: 'Dana Ferris', sub: 'CFO - Meridian Health Systems', tag: 'Person', badgeBg: '#e6f4e8', badgeColor: '#2f7f53' },
      { code: 'DOC', name: '2026 Compliance Filing.pdf', sub: 'Filing - Meridian Health Systems', tag: 'Jul 16', badgeBg: '#fbf2d5', badgeColor: '#9a6b10' },
      { code: 'ORG', name: 'Northstar Regional Medical', sub: 'Healthcare Delivery - Toledo, OH', tag: 'Watchlist', badgeBg: '#e1eef7', badgeColor: '#1d5d92' },
      { code: 'RSK', name: 'Vendor contract renewal overdue', sub: 'Risk - Meridian Health Systems', tag: 'Critical', badgeBg: '#f7e1db', badgeColor: '#ad4339' },
      { code: 'PPL', name: 'Owen Mackey', sub: 'CIO - Meridian Health Systems', tag: 'Person', badgeBg: '#e6f4e8', badgeColor: '#2f7f53' },
    ],
  },
  reports: {
    title: 'Meridian Health Systems Intelligence Report',
    sections: [
      { id: 'exec', label: 'Executive Summary', body: 'Meridian Health Systems is in a watch-but-engage posture: risk concentration has increased, but two commercial pathways remain active with credible internal sponsors.' },
      { id: 'evidence', label: 'Evidence', body: 'Evidence sources include compliance filings, CRM activities, email/call summaries, relationship graph changes, and Atlas AI-generated synthesis.' },
      { id: 'relationships', label: 'Relationships', body: 'The strongest influence nodes remain Finance, Technology, and Compliance. Northgate Supply and Vantage Behavioral Health are the highest-value linked organizations in the current workspace.' },
      { id: 'viz', label: 'Visualizations', body: 'Counterparty concentration remains highest around vendor renewals, funding exposure, and healthcare regulator oversight.' },
      { id: 'timeline', label: 'Timeline', body: 'Recent movement includes a compliance filing, a vendor lapse, and an active RFP pathway now moving toward proposal.' },
      { id: 'sources', label: 'Sources', body: 'Primary sources: filings, CRM, call notes, vendor agreement docs, and AI-assisted indexing of internal and public intelligence artifacts.' },
      { id: 'ai', label: 'AI Analysis', body: 'Atlas AI indicates the Northgate lapse is not just a legal hygiene issue but a churn-risk signal that affects parallel opportunity timing.' },
      { id: 'recs', label: 'Recommendations', body: '1) Resolve Northgate renewal risk. 2) Intensify EHR RFP pursuit. 3) Add staffing vacancy and filing cadence to the watchlist.' },
    ],
  },
  graph: {
    score: 71,
    stats: [
      { label: 'EXPOSURE SCORE', value: '71', color: '#F7761F' },
      { label: 'SUPPLIERS/VENDORS', value: '4', color: '#3D9CA2' },
      { label: 'COUNTERPARTIES', value: '5', color: '#5FA86B' },
      { label: 'CRITICAL DEPENDENCIES', value: '1', color: '#D3492E' },
    ],
    vendors: [
      { code: 'VEN', name: 'Northgate Supply Co.', meta: 'Master Services Agreement - lapsed', metric: '$4.1M/yr', color: '#D3492E' },
      { code: 'SUP', name: 'Apex EHR Systems', meta: 'Core clinical software supplier', metric: '$2.8M/yr', color: '#3D9CA2' },
      { code: 'SUP', name: 'MedTech Equipment Partners', meta: 'Imaging & device supplier', metric: '$1.6M/yr', color: '#3D9CA2' },
      { code: 'VEN', name: 'CleanLine Facilities Services', meta: 'Facilities & maintenance vendor', metric: '$0.9M/yr', color: '#3D9CA2' },
    ],
    counterparties: [
      { code: 'INV', name: 'Heartland Health Capital Partners', meta: 'Institutional investor - 18% stake', metric: '18%', color: '#5FA86B' },
      { code: 'INV', name: 'Ohio Public Employees Retirement Sys.', meta: 'Institutional investor - 9% stake', metric: '9%', color: '#5FA86B' },
      { code: 'HNI', name: 'R. Whitfield Family Office', meta: 'High-net-worth individual - 6% stake', metric: '6%', color: '#8A8FAE' },
      { code: 'BUY', name: 'Vantage Behavioral Health', meta: 'Shared-services buyer, shared board', metric: '$1.2M/yr', color: '#F7761F' },
      { code: 'GOV', name: 'Ohio Dept. of Health', meta: 'Regulator - compliance filings', metric: 'n/a', color: '#8A8FAE' },
    ],
    edges: [
      { label: 'employs', code: 'PPL', label2: 'Dana Ferris - CFO', color: '#5FA86B', chartTop: 'Dana Ferris - CFO', chartReports: ['Treasury Lead', 'FP&A Manager', 'Controller'], bars: [40, 65, 50, 80, 55, 70] },
      { label: 'employs', code: 'PPL', label2: 'Owen Mackey - CIO', color: '#5FA86B', chartTop: 'Owen Mackey - CIO', chartReports: ['IT Director', 'Security Lead', 'Data Architect'], bars: [30, 45, 60, 40, 75, 60] },
      { label: 'employs', code: 'PPL', label2: 'Priya Shah - VP Facilities', color: '#5FA86B', chartTop: 'Priya Shah - VP Facilities', chartReports: ['Ops Manager', 'Site Lead'], bars: [50, 40, 35, 45, 30, 25] },
      { label: 'contracts with', code: 'ORG', label2: 'Northgate Supply Co.', color: '#3D9CA2', chartTop: 'Northgate Supply Co.', chartReports: ['Account Team', 'Contracts Desk', 'Logistics'], bars: [60, 55, 70, 90, 85, 95] },
      { label: 'shares board', code: 'ORG', label2: 'Vantage Behavioral Health', color: '#3D9CA2', chartTop: 'Vantage Behavioral Health', chartReports: ['Board Chair', 'CEO'], bars: [20, 30, 25, 35, 40, 30] },
      { label: 'filed with', code: 'GOV', label2: 'Ohio Dept. of Health', color: '#8A8FAE', chartTop: 'Ohio Dept. of Health', chartReports: ['Licensing Board', 'Compliance Office'], bars: [45, 50, 40, 55, 48, 52] },
      { label: 'sponsors', code: 'OPP', label2: 'EHR Modernization RFP', color: '#F7761F', chartTop: 'EHR Modernization RFP', chartReports: ['Vendor Panel', 'Steering Committee'], bars: [25, 40, 55, 70, 85, 100] },
      { label: 'flagged by Atlas AI', code: 'RSK', label2: 'Vendor Contract Renewal Risk', color: '#D3492E', chartTop: 'Vendor Contract Renewal Risk', chartReports: ['Northgate MSA', 'Legal Review'], bars: [80, 85, 90, 95, 92, 98] },
    ],
  },
  recentItems: ['Northstar Regional Medical', 'Vantage Behavioral Health', 'Q3 Risk Report'],
  giaQuickActions: ['Generate Report', 'Summarize Changes', 'Flag Risk'],
  giaCards: [
    { title: 'Renewal risk on Northgate contract', body: 'Contract lapsed 12 days ago with no renewal activity logged. Recommend outreach to CFO this week.', action: 'Draft outreach email' },
    { title: 'Weekly workspace summary', body: '3 risks, 2 opportunities, and 5 document changes since last Monday across your watched organizations.', action: 'View full summary' },
    { title: 'Peer comparison available', body: 'Meridian’s filing cadence is slower than 3 comparable regional systems - worth a closer look.', action: 'Open comparison' },
  ],
};

const ACTIVITY_META: Record<Exclude<ActivityFilter, 'all'>, { code: string; badgeBg: string; badgeColor: string }> = {
  email: { code: 'EML', badgeBg: '#e8f0fb', badgeColor: '#1E4EA8' },
  call: { code: 'CALL', badgeBg: '#eaf6ec', badgeColor: '#2E7D46' },
  social: { code: 'SOC', badgeBg: '#fdf1e0', badgeColor: '#B36A0C' },
  filing: { code: 'FILE', badgeBg: '#f3ecfb', badgeColor: '#6B3FA0' },
  crm: { code: 'CRM', badgeBg: '#fdeaea', badgeColor: '#B0392F' },
};

const API_BASE = (((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL) ?? '').replace(/\/$/, '');

function mergeWorkspaceData(base: WorkspaceData, api: ApiWorkspaceData): WorkspaceData {
  const organization = api.organization ?? {};
  const search = api.search ?? {};
  const reports = api.reports ?? {};
  const graph = api.graph ?? {};

  const mergedGraphEdges = Array.isArray(graph.edges) && graph.edges.length > 0
    ? graph.edges.map((edge, index) => ({ ...base.graph.edges[index % base.graph.edges.length], ...edge }))
    : base.graph.edges;

  const mergedGraphStats: GraphStat[] = [
    { ...base.graph.stats[0], value: String(graph.score ?? base.graph.score) },
    { ...base.graph.stats[1], value: String(Array.isArray(graph.vendors) ? graph.vendors.length : base.graph.vendors.length) },
    { ...base.graph.stats[2], value: String(Array.isArray(graph.counterparties) ? graph.counterparties.length : base.graph.counterparties.length) },
    base.graph.stats[3],
  ];

  return {
    ...base,
    organization: {
      ...base.organization,
      ...organization,
      meta: { ...base.organization.meta, ...(organization.meta ?? {}) },
      stats: Array.isArray(organization.stats) && organization.stats.length > 0
        ? organization.stats.map((card, index) => ({ ...base.organization.stats[index % base.organization.stats.length], ...card }))
        : base.organization.stats,
      people: Array.isArray(organization.people) && organization.people.length > 0
        ? organization.people.map((person, index) => ({ ...base.organization.people[index % base.organization.people.length], ...person }))
        : base.organization.people,
      risks: Array.isArray(organization.risks) && organization.risks.length > 0
        ? organization.risks.map((risk, index) => ({ ...base.organization.risks[index % base.organization.risks.length], ...risk }))
        : base.organization.risks,
      opportunities: Array.isArray(organization.opportunities) && organization.opportunities.length > 0
        ? organization.opportunities.map((opp, index) => ({ ...base.organization.opportunities[index % base.organization.opportunities.length], ...opp }))
        : base.organization.opportunities,
    },
    search: {
      ...base.search,
      ...search,
      facets: Array.isArray(search.facets) && search.facets.length > 0
        ? search.facets.map((facet, index) => ({ ...base.search.facets[index % base.search.facets.length], ...facet }))
        : base.search.facets,
      results: Array.isArray(search.results) && search.results.length > 0
        ? search.results.map((result, index) => ({ ...base.search.results[index % base.search.results.length], ...result }))
        : base.search.results,
    },
    reports: {
      ...base.reports,
      ...reports,
      sections: Array.isArray(reports.sections) && reports.sections.length > 0
        ? reports.sections.map((section, index) => ({ ...base.reports.sections[index % base.reports.sections.length], ...section }))
        : base.reports.sections,
    },
    graph: {
      ...base.graph,
      score: graph.score ?? base.graph.score,
      stats: mergedGraphStats,
      vendors: Array.isArray(graph.vendors) && graph.vendors.length > 0
        ? graph.vendors.map((node, index) => ({ ...base.graph.vendors[index % base.graph.vendors.length], ...node }))
        : base.graph.vendors,
      counterparties: Array.isArray(graph.counterparties) && graph.counterparties.length > 0
        ? graph.counterparties.map((node, index) => ({ ...base.graph.counterparties[index % base.graph.counterparties.length], ...node }))
        : base.graph.counterparties,
      edges: mergedGraphEdges,
    },
  };
}

function SignInScreen() {
  const { login } = useAuth();
  return (
    <div className="signin-screen">
      <div className="signin-card">
        <div className="brand-mark"><img src="/favicon.svg" alt="SageSure" /></div>
        <div className="brand-title">Atlas</div>
        <div className="brand-subtitle">Enterprise Intelligence OS</div>
        <button className="gia-toggle" onClick={() => login()}>Sign in with Microsoft</button>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading, user, logout, getAccessToken } = useAuth();
  const [activeView, setActiveView] = useState<ViewId>('organization');
  const [activeOrgTab, setActiveOrgTab] = useState<OrgTabId>('overview');
  const [giaOpen, setGiaOpen] = useState(true);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [graphMode, setGraphMode] = useState<GraphMode>('ledger');
  const [workspace, setWorkspace] = useState<WorkspaceData>(DEFAULT_WORKSPACE);
  const [selectedGraphEdge, setSelectedGraphEdge] = useState<GraphEdge>(DEFAULT_WORKSPACE.graph.edges[0]);
  const [dataState, setDataState] = useState<'seed' | 'live'>('seed');
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();

    async function loadWorkspace() {
      try {
        const token = await getAccessToken();
        const response = await fetch(`${API_BASE}/api/workspace`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = (await response.json()) as ApiWorkspaceData;
        const merged = mergeWorkspaceData(DEFAULT_WORKSPACE, json);
        setWorkspace(merged);
        setSelectedGraphEdge(merged.graph.edges[0]);
        setDataState('live');
        setApiError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setWorkspace(DEFAULT_WORKSPACE);
        setSelectedGraphEdge(DEFAULT_WORKSPACE.graph.edges[0]);
        setDataState('seed');
        setApiError(error instanceof Error ? error.message : 'Unknown API error');
      }
    }

    loadWorkspace();
    return () => controller.abort();
  }, [isAuthenticated, getAccessToken]);

  if (isLoading) {
    return <div className="signin-screen"><div className="signin-card">Loading Atlas...</div></div>;
  }

  if (!isAuthenticated) {
    return <SignInScreen />;
  }

  const userInitials = (user?.name ?? user?.username ?? '??')
    .split(/\s+/)
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const filteredActivity = useMemo(() => {
    return workspace.organization.activity.filter((item) => activityFilter === 'all' || item.ch === activityFilter);
  }, [activityFilter, workspace.organization.activity]);

  const pageMeta = workspace.organization.meta;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><img src="/favicon.svg" alt="SageSure" /></div>
          <div>
            <div className="brand-title">Atlas</div>
            <div className="brand-subtitle">Enterprise Intelligence OS</div>
          </div>
        </div>

        <SectionLabel>WORKSPACES</SectionLabel>
        <div className="sidebar-group">
          {NAV_ITEMS.map((item) => {
            const active = item.id === activeView;
            return (
              <button key={item.id} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setActiveView(item.id)}>
                <span className="nav-chip">{item.code}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <SectionLabel>RECENT</SectionLabel>
        <div className="sidebar-group recent-list">
          {workspace.recentItems.map((item) => (
            <button key={item} className="recent-item">{item}</button>
          ))}
        </div>
      </aside>

      <header className="topbar">
        <div className="workspace-pill">Workspace: {workspace.organization.name}</div>
        <div className="global-search">Search organizations, people, documents, risks, or ask Atlas...</div>
        <button className="gia-toggle" onClick={() => setGiaOpen((v) => !v)}>Ask Atlas</button>
        <button className="avatar" title={`Sign out (${user?.username ?? ''})`} onClick={() => logout()}>{userInitials}</button>
      </header>

      <main className="main-content">
        <div className="page-head">
          <div>
            <div className="page-title">{workspace.organization.name}</div>
            <div className="page-meta">{pageMeta.industry} · {pageMeta.hq} · {pageMeta.employees} employees</div>
          </div>
          <div className="page-actions">
            <span className={`data-pill ${dataState}`}>{dataState === 'live' ? 'LIVE API' : 'SEED DATA'}</span>
            {apiError ? <span className="api-error-pill">API fallback: {apiError}</span> : null}
            <span className="risk-pill">{pageMeta.riskLevel}</span>
            <button className="ghost-button">Generate Report</button>
            <button className="primary-button">Open Workspace</button>
          </div>
        </div>

        <section className="stats-grid">
          {workspace.organization.stats.map((card) => (
            <div key={card.label} className="stat-card" style={{ borderTopColor: card.accent }}>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-sub" style={{ color: card.subColor }}>{card.sub}</div>
            </div>
          ))}
        </section>

        {activeView === 'organization' && (
          <OrganizationWorkspace
            organization={workspace.organization}
            activeOrgTab={activeOrgTab}
            setActiveOrgTab={setActiveOrgTab}
            activityFilter={activityFilter}
            setActivityFilter={setActivityFilter}
            filteredActivity={filteredActivity}
          />
        )}
        {activeView === 'search' && <SearchWorkspace search={workspace.search} />}
        {activeView === 'reports' && <ReportsWorkspace reports={workspace.reports} />}
        {activeView === 'graph' && (
          <GraphWorkspace
            graph={workspace.graph}
            graphMode={graphMode}
            setGraphMode={setGraphMode}
            selectedGraphEdge={selectedGraphEdge}
            setSelectedGraphEdge={setSelectedGraphEdge}
          />
        )}
      </main>

      <aside className="utility-rail">
        <button className={`utility-button ${giaOpen ? 'active' : ''}`} onClick={() => setGiaOpen((v) => !v)}>✦</button>
        <button className="utility-button">12</button>
        <button className="utility-button">⌘</button>
      </aside>

      <aside className={`gia-panel ${giaOpen ? 'open' : ''}`}>
        <div className="gia-search">Ask Atlas anything about this workspace...</div>
        <div className="gia-actions">
          {workspace.giaQuickActions.map((action) => (
            <button key={action} className="gia-action-pill">{action}</button>
          ))}
        </div>
        <div className="gia-card-list">
          {workspace.giaCards.map((card) => (
            <div key={card.title} className="gia-card">
              <div className="gia-card-title">{card.title}</div>
              <div className="gia-card-body">{card.body}</div>
              <button className="gia-card-action">{card.action}</button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function OrganizationWorkspace({
  organization,
  activeOrgTab,
  setActiveOrgTab,
  activityFilter,
  setActivityFilter,
  filteredActivity,
}: {
  organization: OrganizationViewData;
  activeOrgTab: OrgTabId;
  setActiveOrgTab: (tab: OrgTabId) => void;
  activityFilter: ActivityFilter;
  setActivityFilter: (filter: ActivityFilter) => void;
  filteredActivity: ActivityItem[];
}) {
  return (
    <section className="workspace-stack">
      <div className="tab-row">
        {ORG_TABS.map((tab) => (
          <button key={tab.id} className={`tab-button ${tab.id === activeOrgTab ? 'active' : ''}`} onClick={() => setActiveOrgTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeOrgTab === 'overview' && <OverviewTab organization={organization} />}
      {activeOrgTab === 'timeline' && <TimelineTab timeline={organization.timeline} />}
      {activeOrgTab === 'relationships' && <RelationshipsTab relationships={organization.relationships} />}
      {activeOrgTab === 'documents' && <DocumentsTab documents={organization.documents} />}
      {activeOrgTab === 'insights' && <InsightsTab insights={organization.insights} />}
      {activeOrgTab === 'activity' && (
        <ActivityTab
          syncStatuses={organization.syncStatuses}
          activityFilter={activityFilter}
          setActivityFilter={setActivityFilter}
          filteredActivity={filteredActivity}
        />
      )}
    </section>
  );
}

function OverviewTab({ organization }: { organization: OrganizationViewData }) {
  return (
    <div className="two-col-grid overview-grid">
      <div className="stack-col">
        <Card title="Key People">
          <div className="list-stack">
            {organization.people.map((person) => (
              <div key={person.name} className="info-row">
                <div>
                  <div className="row-title">{person.name}</div>
                  <div className="row-sub">{person.title} · {person.dept}</div>
                </div>
                <div className="row-meta">{person.lastActivity}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="list-stack">
            {organization.recentActivity.map((item) => (
              <div key={`${item.time}-${item.text}`} className="timeline-mini-row">
                <div className="time-chip">{item.time}</div>
                <div className="row-title">{item.text}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="stack-col">
        <Card title="Risks">
          <div className="list-stack">
            {organization.risks.map((risk) => (
              <div key={risk.title} className="risk-item">
                <span className="severity-chip" style={{ color: risk.color, background: risk.dimColor }}>{risk.severity}</span>
                <div className="row-title">{risk.title}</div>
                <div className="row-sub">{risk.detail}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Opportunities">
          <div className="list-stack">
            {organization.opportunities.map((opp) => (
              <div key={opp.title} className="info-row">
                <div>
                  <div className="row-title">{opp.title}</div>
                  <div className="row-sub">{opp.stage}</div>
                </div>
                <div className="row-metric">{opp.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TimelineTab({ timeline }: { timeline: TimelineEvent[] }) {
  return (
    <Card title="Timeline">
      <div className="timeline-list">
        {timeline.map((event) => (
          <div key={`${event.date}-${event.label}`} className="timeline-row">
            <div className="timeline-date">{event.date}</div>
            <div className="timeline-dot" style={{ background: event.dotColor }} />
            <div>
              <div className="row-title">{event.label}</div>
              <div className="row-sub">{event.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RelationshipsTab({ relationships }: { relationships: Relationship[] }) {
  return (
    <div className="two-col-grid">
      <Card title="Graph Canvas">
        <div className="relationship-canvas">
          <div className="canvas-node core">Meridian Health Systems</div>
          <div className="canvas-branch left">Northgate Supply</div>
          <div className="canvas-branch right">Vantage Behavioral</div>
          <div className="canvas-branch lower">Ohio Dept. of Health</div>
          <svg className="canvas-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="50" y1="24" x2="20" y2="48" />
            <line x1="50" y1="24" x2="80" y2="48" />
            <line x1="50" y1="24" x2="50" y2="77" />
          </svg>
        </div>
      </Card>
      <Card title="Connections">
        <div className="list-stack">
          {relationships.map((edge) => (
            <div key={`${edge.from}-${edge.type}-${edge.to}`} className="relationship-row">
              <span>{edge.from}</span>
              <span className="edge-arrow">→</span>
              <span className="relationship-type">{edge.type}</span>
              <span className="edge-arrow">→</span>
              <span>{edge.to}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DocumentsTab({ documents }: { documents: DocumentRecord[] }) {
  return (
    <Card title="Documents">
      <div className="table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Tag</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.name}>
                <td>{doc.name}</td>
                <td>{doc.type}</td>
                <td><span className="table-tag">{doc.tag}</span></td>
                <td>{doc.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InsightsTab({ insights }: { insights: AiInsight[] }) {
  return (
    <div className="insight-grid">
      {insights.map((insight) => (
        <Card key={insight.title} title={insight.title} compact>
          <div className="insight-body">{insight.body}</div>
          <button className="outline-pill">{insight.action}</button>
        </Card>
      ))}
    </div>
  );
}

function ActivityTab({
  syncStatuses,
  activityFilter,
  setActivityFilter,
  filteredActivity,
}: {
  syncStatuses: SyncStatus[];
  activityFilter: ActivityFilter;
  setActivityFilter: (filter: ActivityFilter) => void;
  filteredActivity: ActivityItem[];
}) {
  return (
    <div className="stack-col">
      <Card title="Channel Sync Status">
        <div className="sync-chip-row">
          {syncStatuses.map((status) => (
            <div key={status.channel} className="sync-chip">
              <span className="status-dot" style={{ background: status.color }} />
              <span>{status.channel}</span>
              <span className="sync-label">{status.status}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="filter-row">
        {(['all', 'email', 'call', 'social', 'filing', 'crm'] as ActivityFilter[]).map((filter) => (
          <button key={filter} className={`filter-pill ${activityFilter === filter ? 'active' : ''}`} onClick={() => setActivityFilter(filter)}>
            {filter === 'all' ? 'All' : filter === 'call' ? 'Calls' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <Card title="Activity Feed">
        <div className="list-stack">
          {filteredActivity.map((item) => {
            const meta = ACTIVITY_META[item.ch];
            return (
              <div key={`${item.ch}-${item.title}-${item.time}`} className="activity-row">
                <span className="activity-chip" style={{ background: meta.badgeBg, color: meta.badgeColor }}>{meta.code}</span>
                <div className="activity-copy">
                  <div className="row-title">{item.title}</div>
                  <div className="row-sub">{item.snippet}</div>
                </div>
                <div className="row-meta">{item.time}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function SearchWorkspace({ search }: { search: SearchViewData }) {
  return (
    <div className="search-layout">
      <Card title="Filters">
        <div className="list-stack">
          {search.facets.map((facet) => (
            <div key={facet.label} className="info-row">
              <div className="row-title">{facet.label}</div>
              <div className="row-metric">{facet.count}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Search Results" subtitle={search.summary}>
        <div className="list-stack">
          {search.results.map((result) => (
            <div key={`${result.code}-${result.name}`} className="search-result">
              <span className="search-code">{result.code}</span>
              <div className="activity-copy">
                <div className="row-title">{result.name}</div>
                <div className="row-sub">{result.sub}</div>
              </div>
              <span className="result-tag" style={{ background: result.badgeBg, color: result.badgeColor }}>{result.tag}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Preview">
        <div className="preview-copy">
          {search.results[0]?.name ?? 'No result selected'} surfaces as the highest-signal entity in the current result set based on linked risk activity, filings, and executive engagement.
        </div>
      </Card>
    </div>
  );
}

function ReportsWorkspace({ reports }: { reports: ReportsViewData }) {
  return (
    <div className="reports-layout">
      <Card title="Table of Contents" compact>
        <div className="toc-list">
          {reports.sections.map((section) => (
            <a key={section.id} className="toc-link" href={`#${section.id}`}>{section.label}</a>
          ))}
        </div>
      </Card>

      <Card title={reports.title} subtitle="Generated from workspace-linked intelligence objects">
        <div className="report-body">
          {reports.sections.map((section) => (
            <section key={section.id} id={section.id} className="report-section">
              <h3>{section.label}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
}

function GraphWorkspace({
  graph,
  graphMode,
  setGraphMode,
  selectedGraphEdge,
  setSelectedGraphEdge,
}: {
  graph: GraphViewData;
  graphMode: GraphMode;
  setGraphMode: (mode: GraphMode) => void;
  selectedGraphEdge: GraphEdge;
  setSelectedGraphEdge: (edge: GraphEdge) => void;
}) {
  return (
    <section className="graph-workspace">
      <div className="graph-toolbar">
        <div>
          <div className="graph-title">Exposure Network</div>
          <div className="graph-subtitle">Workspace-linked counterparties, relationship signals, and operating dependencies</div>
        </div>
        <div className="graph-mode-toggle">
          <button className={graphMode === 'ledger' ? 'active' : ''} onClick={() => setGraphMode('ledger')}>Ledger</button>
          <button className={graphMode === 'matrix' ? 'active' : ''} onClick={() => setGraphMode('matrix')}>Matrix</button>
        </div>
      </div>

      <div className="graph-stats">
        {graph.stats.map((item) => (
          <div key={item.label} className="graph-stat-card">
            <div className="stat-label">{item.label}</div>
            <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="network-board">
        <div className="network-column">
          <div className="network-heading">Supply / Vendor Side</div>
          {graph.vendors.map((node) => (
            <button key={node.name} className="network-node" onClick={() => setSelectedGraphEdge(graph.edges[3] ?? graph.edges[0])}>
              <span className="network-code" style={{ background: `${node.color}22`, color: node.color }}>{node.code}</span>
              <div>
                <div className="network-name">{node.name}</div>
                <div className="network-meta">{node.meta}</div>
              </div>
              <span className="network-metric">{node.metric}</span>
            </button>
          ))}
        </div>

        <div className="network-center">
          <div className="platform-core">MERIDIAN SPV CORE</div>
          <div className="platform-stack">
            {['EHR Modernization', 'Compliance / Filings', 'Vendor Renewals', 'Shared Board Exposure'].map((item) => (
              <div key={item} className="platform-card">{item}</div>
            ))}
          </div>
        </div>

        <div className="network-column">
          <div className="network-heading">Capital / Counterparty Side</div>
          {graph.counterparties.map((node) => (
            <button key={node.name} className="network-node" onClick={() => setSelectedGraphEdge(graph.edges[4] ?? graph.edges[0])}>
              <span className="network-code" style={{ background: `${node.color}22`, color: node.color }}>{node.code}</span>
              <div>
                <div className="network-name">{node.name}</div>
                <div className="network-meta">{node.meta}</div>
              </div>
              <span className="network-metric">{node.metric}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="graph-detail-grid">
        <Card title="Evidence Inspector" dark>
          <div className="inspector-title">{selectedGraphEdge.chartTop}</div>
          <div className="inspector-subtitle">Relationship type: {selectedGraphEdge.label}</div>
          <div className="mini-chart">
            {selectedGraphEdge.bars.map((bar, idx) => (
              <div key={`${selectedGraphEdge.chartTop}-${idx}`} className="mini-bar-wrap">
                <div className="mini-bar" style={{ height: `${bar}%`, background: selectedGraphEdge.color }} />
              </div>
            ))}
          </div>
          <div className="inspector-list">
            {selectedGraphEdge.chartReports.map((item) => (
              <div key={item} className="inspector-pill">{item}</div>
            ))}
          </div>
        </Card>

        <Card title={graphMode === 'ledger' ? 'Relationship Ledger' : 'Relationship Matrix'} dark>
          <div className="edge-list">
            {graph.edges.map((edge) => (
              <button key={`${edge.label}-${edge.label2}`} className="edge-row" onClick={() => setSelectedGraphEdge(edge)}>
                <span className="edge-code" style={{ color: edge.color, borderColor: edge.color }}>{edge.code}</span>
                <div>
                  <div className="row-title dark">{edge.label2}</div>
                  <div className="row-sub dark">{edge.label}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function Card({ title, subtitle, children, compact = false, dark = false }: { title: string; subtitle?: string; children: React.ReactNode; compact?: boolean; dark?: boolean }) {
  return (
    <section className={`content-card ${compact ? 'compact' : ''} ${dark ? 'dark-card' : ''}`}>
      <div className="card-head">
        <div>
          <div className={`card-title ${dark ? 'dark' : ''}`}>{title}</div>
          {subtitle ? <div className={`card-subtitle ${dark ? 'dark' : ''}`}>{subtitle}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="section-label">{children}</div>;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
