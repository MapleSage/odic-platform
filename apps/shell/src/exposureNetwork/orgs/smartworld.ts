// Smartworld Developers -- Exposure Network data.
//
// This is the FIRST of what should be N per-org data files (one per customer with the
// 'exposure-network' pack enabled), proving the generic ExposureNetwork renderer still
// produces an identical result to the old hardcoded version once fed through the
// ExposureNetworkData schema. Every literal value below is unchanged from the original
// data.ts -- only the packaging changed (org-specific object instead of module-level
// exports the component imported directly).
//
// TODO(Luna, backend): this should ultimately be served from a real intelligence-object
// API (see docs/atlas-backend-brief-for-luna-2026-07-24.md, P0) rather than shipped as a
// static frontend file. Keeping it as a typed static object for now so the renderer can
// be proven generic immediately; swapping the registry lookup (../registry.ts) for a
// fetch() is a contained, mechanical follow-up once that endpoint exists.

import type { EntityChild, ExposureNetworkData } from '../schema';
import { fillEntityRegistryDefaults } from '../schema';

const LT_CHILD_DEFS: EntityChild[] = [
  { id: 'ltimindtree', name: 'LTIMindtree', role: 'IT services & digital transformation -- listed entity' },
  { id: 'lt-construction', name: 'L&T Construction', role: 'EPC & infrastructure construction -- core legacy business' },
  { id: 'lt-finance', name: 'L&T Finance', role: 'NBFC -- retail & wholesale finance' },
  { id: 'lt-technology', name: 'L&T Technology Services', role: 'Engineering R&D services -- listed entity' },
  { id: 'lt-realty', name: 'L&T Realty', role: 'Real estate development' },
  { id: 'lt-power', name: 'L&T Power', role: 'Power plant EPC & equipment' },
  { id: 'lt-defence', name: 'L&T Defence', role: 'Defence & aerospace manufacturing' },
  { id: 'lt-shipbuilding', name: 'L&T Shipbuilding', role: 'Shipyards -- defence & commercial vessels' },
  { id: 'lt-metro', name: 'L&T Metro Rail (Hyderabad)', role: 'Metro rail concession & operations' },
  { id: 'lt-hydrocarbon', name: 'L&T Energy-Hydrocarbon', role: 'Oil & gas EPC engineering' },
  { id: 'lt-electrical', name: 'L&T Electrical & Automation', role: 'Switchgear, automation -- divested to Schneider Electric' },
  { id: 'lt-smartworld-comm', name: 'L&T Smart World & Communication', role: 'Smart city, safety & surveillance systems integrator' },
];

const baseEntityRegistry = {
  ltimindtree: {
    title: 'LTIMindtree',
    subtitle: 'Listed IT services & digital transformation company',
    sections: [
      {
        heading: 'OVERVIEW',
        rows: [
          { label: 'FORMED', value: 'Merger of Larsen & Toubro Infotech (LTI) and Mindtree, effective Nov 2022' },
          { label: 'HEADCOUNT', value: '~20,000+ employees under the legacy LTI entity alone; 80,000+ combined group-wide' },
          { label: 'LISTING', value: 'NSE/BSE listed; L&T Group is the promoter/majority shareholder' },
        ],
      },
      {
        heading: 'RELATIONSHIP TO SMARTWORLD DILIGENCE',
        rows: [
          { label: 'GRADE', value: '[D] Analytical hypothesis -- no direct vendor relationship to Smartworld evidenced' },
          {
            label: 'NOTE',
            value:
              'Tracked only as part of the L&T group ecosystem being tested as an EPC/smart-infra vendor hypothesis; LTIMindtree itself is an IT services business, not a construction vendor.',
          },
        ],
      },
    ],
    children: [],
  },
  lt: {
    title: 'Larsen & Toubro (L&T) Group',
    subtitle: 'Diversified Indian multinational conglomerate -- EPC contractor hypothesis for Smartworld',
    sections: [
      {
        heading: 'RELATIONSHIP TO SMARTWORLD',
        rows: [
          { label: 'HYPOTHESIS', value: 'Possible EPC / smart-infrastructure vendor across Smartworld brand and SPVs' },
          { label: 'GRADE', value: '[D] Analytical hypothesis -- not yet evidenced by any filing' },
          {
            label: 'NOTE',
            value:
              'L&T operates ~18 independently-run group companies across construction, finance, technology, defence and more. Diligence must test the vendor hypothesis at the specific operating-company level, not against the L&T brand as a whole.',
          },
        ],
      },
    ],
    children: LT_CHILD_DEFS,
  },
};

const entityRegistry = fillEntityRegistryDefaults(baseEntityRegistry, LT_CHILD_DEFS);

export const smartworldExposureNetwork: ExposureNetworkData = {
  orgId: 'smartworld',
  orgName: 'Smartworld Developers',
  ticker: 'SWD IN',
  platformModal: {
    title: 'Smartworld Developers',
    subtitle: 'Corporate Platform Node',
    sections: [
      {
        heading: 'PLATFORM',
        rows: [
          { label: 'ADDRESS', value: 'M3M IFC, Sector-66, Gurugram, Haryana' },
          { label: 'AUM CLAIM', value: '₹40,000 CR' },
          { label: 'DELIVERED', value: '~6.5M SQ FT across 6 project SPVs' },
        ],
      },
      {
        heading: 'NOTE',
        rows: [
          { label: 'GRADE', value: '[C] First-party disclosure of platform address' },
          {
            label: 'EVIDENCE',
            value: 'Brand overlays distinct SPVs bound by shared registered offices and recurring executive directors, not a single balance sheet.',
          },
        ],
      },
    ],
  },
  spvDefs: [
    {
      id: 'skyarc',
      project: 'Smartworld Sky Arc',
      spv: 'Riverday Infrastructure Pvt Ltd',
      row: 0,
      cin: 'U70100HR2021PTC098078',
      rera: 'RERA-GRG-1723-2024 / GGM/878/610/2024/105 dated 11.10.2024',
      address: '12A Floor, Tower 2, M3M IFC, Sector-66, Gurugram, Haryana',
      directors: 'Gaurav Bansal; Davinder Singh Malik',
      commonDirectors: 'Davinder Singh Malik; Bharat Vigmal',
      status: 'Partial diligence -- deep diligence in progress',
      notes:
        'Not a clean greenfield project: migrated licence history, SARFAESI-linked land transfer, change of developer, and regulator-recorded compliance conditions. Received/submitted 30.08.2024; APPROVED AND CERTIFICATE UPLOADED, certificate uploaded 21.01.2025. Hearings visible on 30.09.2024 and 07.10.2024.',
      deepDiligence: [
        {
          heading: 'LAND OWNERSHIP CHAIN',
          rows: [
            {
              label: 'HISTORY',
              value:
                'Earlier land traces to licence 29 of 2009 (24.06.2009). Modgen Developers Pvt Ltd purchased the earlier licensed land from Indiabulls Housing Finance Ltd under SARFAESI -- conveyance deed and sale certificate both dated 08.12.2022.',
            },
            {
              label: 'AREA BREAKDOWN',
              value:
                'Existing building on 3.1875 acres had OC on 08.11.2019, conveyed to Neil Maxinfra Pvt Ltd. 0.3125 acres delicensed. Balance 11.5 acres migrated into licence 90 of 2024, plus 0.16875 acres fresh applied area -- total licensed area 11.66875 acres.',
            },
            {
              label: 'STATUS',
              value: 'Layered and non-trivial. Underlying conveyance deed, sale certificate, and title chain documents not yet obtained -- not treated as fully verified.',
            },
          ],
        },
        {
          heading: 'DTCP / CLU / SANCTIONED PLAN',
          rows: [
            { label: 'CURRENT LICENCE', value: 'DTCP licence 90 of 2024, dated 18.07.2024, over 11.66875 acres.' },
            { label: 'CHANGE OF DEVELOPER', value: 'Approved in favour of Riverday Infrastructure Pvt Ltd on 09.09.2024.' },
            { label: 'BUILDING PLANS', value: 'Approved around 19-20.09.2024. Project developed in five distinct phases; HRERA application covers phase 1.' },
            { label: 'MISSING', value: 'Underlying DTCP licence/order PDFs, change-of-developer approval document, sanctioned layout/phasing documents.' },
          ],
        },
        {
          heading: 'REGULATORY -- SUO MOTU PROCEEDING',
          rows: [
            {
              label: 'FINDING',
              value:
                'On the promoter\'s own submission that there had been no sale/advertisement/marketing on the migrated 11.5-acre area, HRERA directed a public notice inviting objections and ordered separate suo motu proceedings against the erstwhile promoter for non-registration of the earlier licensed area under Section 3.',
            },
            { label: 'INTERPRETATION', value: 'Does not automatically mean Sky Arc itself is impaired, but the project sits on a regulatory history that should not be described as clean or routine.' },
          ],
        },
        {
          heading: 'ENVIRONMENTAL CLEARANCE',
          rows: [
            {
              label: 'STATUS',
              value:
                'Not obviously closed at the 07.10.2024 hearing. Promoter submitted security-backed undertakings tied to later submission of approved service plans, fire scheme, and environment clearance -- a live diligence flag, not a closed item.',
            },
          ],
        },
        {
          heading: 'FUNDING / ESCROW',
          rows: [
            { label: 'STRUCTURE', value: 'HRERA proceedings say Riverday entered via a development agreement on a revenue-sharing model (clause 3.1-3.4, Schedule-II).' },
            { label: 'BUYER-DEPOSIT BANK', value: 'Kotak Mahindra Bank, Corporate Sewa Park, Gurugram -- surfaced publicly on the refreshed HRERA preview (2026-07-21).' },
            { label: 'MISSING', value: 'Current project lender and charge/security trustee filings still not identified.' },
          ],
        },
        {
          heading: 'PROJECT ECONOMICS & TIMELINE (refreshed 2026-07-21)',
          rows: [
            { label: 'ESTIMATED PROJECT COST', value: '₹340,765.96 lakhs (~₹3,408 crore)' },
            { label: 'PROJECT LAND AREA', value: '6.97635 acres (within 11.66875 acres total licensed area)' },
            { label: 'CONSTRUCTION START (LIKELY)', value: '01.10.2024' },
            { label: 'COMPLETION (LIKELY)', value: '31.05.2032' },
          ],
        },
        {
          heading: 'STATUTORY APPROVALS STATUS (refreshed 2026-07-21)',
          rows: [
            { label: 'LICENSE APPROVAL', value: '18.07.2024' },
            { label: 'LOI', value: '13.03.2024' },
            { label: 'AAI NOC', value: '14.03.2023' },
            { label: 'ELECTRICITY ASSURANCE', value: '23.07.2024' },
            { label: 'FOREST NOC', value: '01.05.2024' },
            { label: 'SEWERAGE ASSURANCE', value: '05.07.2024' },
            { label: 'STORM WATER CONNECTION', value: '05.07.2024' },
            { label: 'WATER SUPPLY CONNECTION', value: '05.07.2024' },
          ],
        },
        {
          heading: 'RISK CLASSIFICATION',
          rows: [
            { label: 'OPERATIONAL', value: 'Migrated licence history, change of developer shortly before registration, multi-party structure requiring separate diligence on licensee, developer, and land history.' },
            { label: 'REGULATORY', value: 'Suo motu proceeding against erstwhile promoter; environment clearance not obviously closed; public-notice and compliance conditions recorded.' },
            { label: 'LEGAL', value: 'SARFAESI-linked land transfer chain means title and transfer assumptions must be document-backed before any clean-title conclusion.' },
            { label: 'COMMERCIAL', value: 'Five-phase structure means commercial incentives may differ by phase and inventory timing.' },
          ],
        },
        {
          heading: 'STATUS -- 2026-07-21 REFRESH',
          rows: [
            { label: 'PUBLIC-SOURCE DOSSIER', value: 'Completed public-source dossier snapshot -- primary public-source fact pattern is sufficiently assembled.' },
            { label: 'DEEP-DILIGENCE GAPS', value: 'Deed/sale-certificate/licence PDF chain, environment-clearance closure, contractor/consultant/lender stack, and buyer-complaint history remain open.' },
          ],
        },
      ],
    },
    {
      id: 'onedxp',
      project: 'Smartworld One DXP',
      spv: 'Nourish Developers Pvt Ltd',
      row: 1,
      cin: 'U70109HR2020PTC091616',
      rera: 'RERA-GRG-1217-2022 / GGM/645/377/2022/120 dated 13.12.2022',
      address: '12A Floor, Tower 2, M3M IFC, Sector-66, Gurugram, Haryana',
      directors: 'Krishan Kumar Singhal; Davinder Singh Malik; Hari Easwaran',
      commonDirectors: 'Davinder Singh Malik; Hari Easwaran; Manik Sharma',
      status: 'Partial diligence',
      notes: 'Licence 106 of 2022 dated 05.08.2022, valid to 04.08.2027. Developer/collaborator structure with Aspis Buildcon Pvt Ltd and Starcity Realtech Pvt Ltd as licensees.',
      additionalRegistrations: [
        { rera: 'One DXP Street -- RERA-GRG-1228-2022 (GGM/652/384/2022/127)', status: 'Registered -- 0.58 acre within 16.1125 acre total licensed area' },
        { rera: 'One DXP Phase-2 -- RERA-GRG-1642-2024 (GGM/842/574/2024/69)', status: 'Registered -- director set expanded vs. 2022 filings (adds Pritam Parkash Agarwal, Anil Mittal)' },
      ],
    },
    {
      id: 'orchard',
      project: 'Smartworld Orchard',
      spv: 'Suposhaa Realcon Pvt Ltd',
      row: 2,
      cin: 'U70105HR2016PTC092957',
      rera: 'RERA-GRG-948-2021 / GGM/505/237/2021/73 dated 27.10.2021',
      address: 'Unit SB/C/2L/Office/017A, M3M Urbana, Sector-67, Gurugram',
      directors: 'Gaurav Bansal; Naman Gupta',
      commonDirectors: 'Gaurav Bansal; Naman Gupta; Hari Easwaran (later filings)',
      status: 'Multiple registrations, ongoing',
      notes: 'Multi-licensee stack of 12+ entities (incl. IREO Pvt Ltd, Ornamental Realtors, Regal Green Lands, Fiverivers Buildcon) -- structurally the most complex SPV in the portfolio. 7 known HRERA registrations across 2021-2025.',
      additionalRegistrations: [
        { rera: 'RERA-GRG-957-2021 (GGM/506/238/2021/74)', status: 'Registered' },
        { rera: 'RERA-GRG-1039-2022 (GGM/616/348/2022/91)', status: 'Registered' },
        { rera: 'RERA-GRG-1121-2022 (GGM/617/349/2022/92)', status: 'Ongoing -- expanded licence set (62 of 2022 + 68 of 2021)' },
        { rera: 'RERA-GRG-1483-2023', status: 'In process' },
        { rera: 'RERA-GRG-1835-2024', status: 'In process' },
        { rera: 'RERA-GRG-2045-2025', status: 'In process' },
        { rera: 'Orchard Street -- RERA-GRG-1488-2023 (GGM/773/505/2023/117)', status: 'Registered' },
      ],
    },
    {
      id: 'edition',
      project: 'Smartworld The Edition',
      spv: 'Etsy Realcon Pvt Ltd',
      row: 3,
      cin: 'U70109HR2021PTC098644',
      rera: 'RERA-GRG-1395-2023 / GGM/756/488/2023/100 dated 06.11.2023',
      address: '12A Floor, Tower 2, M3M IFC, Sector-66, Gurugram, Haryana',
      directors: 'Anil Mittal; Hari Easwaran; Davinder Singh Malik',
      commonDirectors: 'Hari Easwaran; Davinder Singh Malik; Bharat Vigmal',
      status: 'Partial diligence',
      notes: 'Owner-licensee filing; licence 83 of 2022 dated 18.04.2023, valid to 17.04.2028.',
    },
    {
      id: 'gems',
      project: 'Smartworld Gems',
      spv: 'Adhikaansh Realtors Pvt Ltd',
      row: 4,
      cin: 'U70109HR2020PTC090928',
      rera: 'RERA-GRG-939-2021 / GGM/502/234/2021/70 dated 25.10.2021',
      address: 'Unit SB/C/2L/Office/017A, M3M Urbana, Sector-67, Gurugram',
      directors: 'Gaurav Bansal; Naman Gupta',
      commonDirectors: 'Gaurav Bansal; Naman Gupta',
      status: 'Partial diligence, multiple phases',
      notes: 'Owner-licensee in 2021 (licence 32 of 2021, dated 03.07.2021); Gems 2 filing shifts to collaborator model over Aawam Residency Pvt Ltd, registered address moves to M3M IFC / Smartworld email cluster.',
      additionalRegistrations: [
        { rera: 'Gems 2 -- RERA-GRG-1308-2023 (GGM/858/590/2024/85)', status: 'Registered -- directors Anil Mittal, Davinder Singh Malik, Hari Easwaran' },
        { rera: 'Gems 2 -- RERA-GRG-1742-2024', status: 'In process' },
        { rera: 'Gems -- RERA-GRG-2023-2025', status: 'In process' },
        { rera: 'Gems 3 -- RERA-GRG-1906-2025 (GGM/951/683/2025/54)', status: 'Registered' },
      ],
    },
    {
      id: 'naturescourt',
      project: "Smartworld Nature's Court I",
      spv: 'Svabhumi Realtors Pvt Ltd',
      row: 5,
      cin: 'U68100HR2023PTC111218',
      rera: 'RERA-GRG-2126-2025 / GGM/1029/761/2026/01 dated 02.01.2026',
      address: '12A Floor, Tower-2, M3M IFC, Sector-66, Gurugram, Haryana',
      directors: 'Rajeev Kumar Agrawal; Sujeet Ranjan Tiwari',
      commonDirectors: 'Bharat Vigmal',
      status: 'Completed public-source dossier (refreshed 2026-07-21) -- deep-diligence gaps remain',
      notes:
        'Strongest confirmed Smartworld <-> M3M bridge: official Smartworld page and the refreshed HRERA preview both name M3M India Infrastructures Pvt Ltd as licensee alongside Svabhumi Realtors as applicant/promoter, under licence 168 of 2025 over a 139.79375-acre licensed context. Address overlap alone is not treated as proof of control.',
    },
  ],
  leftDefs: [
    { name: 'Modgen Developers Pvt Ltd', role: 'Licensee -- SARFAESI title migration', grade: 'A', target: 'skyarc', edgeLabel: 'licensee_structure_with', note: 'Registered dev. rights agreement; DTCP Licence 90 of 2024, migrated from Licence 29 of 2009.', src: 'HRERA-007' },
    { name: 'Aspis Buildcon & Starcity', role: 'Disclosed land licensees', grade: 'A', target: 'onedxp', edgeLabel: 'land_licensee_of', note: 'Pre-licence collaboration agreement; DTCP Licence 106 of 2022.', src: 'HRERA-001' },
    { name: 'IREO Pvt Ltd & 11+ Co-Lic.', role: 'Multi-licensee landholding cluster', grade: 'A', target: 'orchard', edgeLabel: 'land_licensee_of', note: 'Collab agreement 3346 & addendum 4978; DTCP Licence 68 of 2021.', src: 'HRERA-003' },
    { name: 'Owner-Licensee Standard', role: 'No external land licensee disclosed', grade: 'A', target: 'edition', edgeLabel: 'owner_licensee', note: 'Owner-licensee filing; licence 83 of 2022 valid to 17.04.2028.', src: 'HRERA-002' },
    { name: 'Owner-Licensee / Aawam Residency', role: 'Owner-licensee, later collaborator model', grade: 'A', target: 'gems', edgeLabel: 'land_licensee_of', note: 'Later Gems 2 filing shifts to collaborator model over Aawam Residency Pvt Ltd.', src: 'HRERA-004;HRERA-011' },
    { name: 'M3M India Infrastructures Pvt Ltd', role: 'Land licensee -- explicit M3M node', grade: 'A', target: 'naturescourt', edgeLabel: 'land_licensee_of', note: 'Primary-source bridge from Smartworld-branded project to explicit M3M legal entity.', src: 'HRERA-005' },
    { id: 'lt', name: 'Larsen & Toubro (L&T)', role: 'EPC contractor -- diligence hypothesis', grade: 'D', target: 'ALL', edgeLabel: 'possible_epc_vendor', note: 'Hypothesis to test across brand and SPVs -- not yet evidenced by any filing.', src: 'open' },
  ],
  rightDefs: [
    { name: 'Indiabulls Housing Finance Ltd', role: 'Prior lender -- SARFAESI deed node', grade: 'A', target: 'skyarc', edgeLabel: 'prior_lender_sarfaesi', note: 'Conveyance deed & sale certificate dated 08.12.2022 to Modgen.', src: 'SWD-Sky-Arc-01' },
    { name: 'Neil Maxinfra Pvt Ltd', role: 'Bulk buyer -- conveyed OC asset', grade: 'A', target: 'skyarc', edgeLabel: 'commercial_off_taker', note: 'Conveyed 3.1875-acre existing building with 08.11.2019 OC.', src: 'SWD-Sky-Arc-02' },
    { name: '9k Expressway Catchment', role: 'Retail & institutional comm. pool', grade: 'A', target: 'onedxp', edgeLabel: 'buyer_catchment', note: 'Sales & catchment claim tied to One DXP corridor positioning.', src: 'HRERA-001' },
    { name: 'Sector 61 Retail Buyers', role: 'Orchard retail allottee base', grade: 'A', target: 'orchard', edgeLabel: 'buyer_catchment', note: 'HRERA hearing allottees tied to Orchard registrations.', src: 'HRERA-003' },
    { name: 'Sector 66 HNI/UHNI Pool', role: 'High-net-worth target allocations', grade: 'A', target: 'edition', edgeLabel: 'buyer_catchment', note: 'Targeted HNI/UHNI catchment within 5km of The Edition.', src: 'HRERA-002' },
    { name: 'Global City Catchment Links', role: "Nature's Court institutional & retail links", grade: 'A', target: 'naturescourt', edgeLabel: 'buyer_catchment', note: 'Institutional & retail buyer links disclosed alongside M3M bridge.', src: 'HRERA-005' },
    { name: 'Escrow Banks & Trustees', role: 'RERA 70% escrow custodians -- all SPVs', grade: 'B', target: 'ALL', edgeLabel: 'escrow_account_holder', note: 'Statutory RERA banking charge and institutional debt security across all project SPVs.', src: 'RERA-statute' },
  ],
  leftExtras: [
    { name: 'ELIE SAAB / ELIE SAAB Maison', role: 'Branded design & luxury interior licensor', grade: 'C', note: 'Official brand positioning for Smartworld Residences by ELIE SAAB (Sector 98, Noida).' },
    { name: 'UHA London', role: 'Architectural & façade design partner (One DXP)', grade: 'C', note: 'Official project façade designer disclosure for One DXP.' },
    { name: 'DTCP Haryana & Haryana RERA', role: 'Regulatory licensing & project oversight -- all SPVs', grade: 'A', note: 'Statutory authority granting licenses, RERA certs, and hearing orders across all project SPVs.' },
  ],
  rightExtras: [
    { name: 'HNI & UHNI Catchment Buyers', role: 'Targeted high-net-worth residential investors', grade: 'C', note: 'Targeted 50,000+ HNI/UHNI families within 5km of luxury corridors (marketing claim).' },
    { name: 'MNC / IT Corporate Catchment', role: 'Commercial off-take -- IT hub corridors', grade: 'C', note: 'Catchments of 2-5 lakh+ individuals across IT/MNC hubs (marketing claim).' },
    { name: '~35,000 Retail Homebuyers', role: 'End-user customer base & allottees', grade: 'C', note: 'Official scale claim; CRM lounge servicing; HRERA hearing allottees.' },
  ],
  interlocks: [
    { name: 'Hari Easwaran & Davinder Singh Malik', bridges: 'Bridge Nourish Developers (One DXP) and Etsy Realcon (The Edition); Malik also sits on Riverday Infrastructure (Sky Arc)' },
    { name: 'Gaurav Bansal & Naman Gupta', bridges: 'Co-manage Suposhaa Realcon (Orchard) and Adhikaansh Realtors (Gems); Bansal also directs Riverday Infrastructure' },
    { name: 'Bharat Vigmal', bridges: 'Authorised representative across Riverday, Etsy Realcon and Svabhumi Realtors -- standardizes filings across entities' },
    { name: 'M3M IFC / M3M Urbana address clusters', bridges: 'Shared registered-office infrastructure links Riverday, Nourish, Etsy, Svabhumi (IFC) and Suposhaa, Adhikaansh (Urbana)' },
  ],
  // Promoter / family-office network. Deliberately kept separate from the A-D sourced
  // SPV/relationship network above: every entry here is at "lead" confidence, pending
  // retrieval of underlying governance/annual-report filing language, per the dossier's
  // own source-confidence rubric -- never inferred from surname overlap alone, never
  // presented as fact.
  promoterNetwork: [
    { name: 'Basant Bansal', role: 'Principal (M3M) -- context', note: 'Working promoter-hierarchy context; no filing-level detail retrieved yet.' },
    { name: 'Roop Bansal', role: 'Principal (M3M) -- context', note: 'Working promoter-hierarchy context; no filing-level detail retrieved yet.' },
    { name: 'Pankaj Bansal', role: 'Promoter / Smartworld founder context', note: 'Pending retrieval of governance-filing language establishing promoter/founder role.' },
    {
      name: 'Aishwarya Bansal',
      role: 'Co-founder context, Smartworld',
      note: 'Media page lists as co-founder. Governance disclosures reportedly identify her as Pankaj Bansal\'s wife -- pending documentary verification, not confirmed.',
    },
    {
      name: 'Dr. Payal Kanodia',
      role: 'Chairperson & Trustee, M3M Foundation',
      note: 'Public ESG/CSR leadership role (sustainability, rural livelihoods, women entrepreneurship, skilling). Governance disclosures reportedly identify her as Pankaj Bansal\'s sister -- pending documentary verification, not confirmed. Do not infer any Datamatics/Kanodia-family link from surname alone.',
    },
  ],
  entityRegistry,
};
