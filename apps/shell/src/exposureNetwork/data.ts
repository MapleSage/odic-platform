export type Grade = 'A' | 'B' | 'C' | 'D';

export const GRADE_COLOR: Record<Grade, string> = {
  A: '#4CAF6D',
  B: '#3D9CA2',
  C: '#D4A017',
  D: '#9B6FD1',
};

export const GRADE_LABEL: Record<Grade, string> = {
  A: 'Primary source (MCA/HRERA/DTCP/court)',
  B: 'Independent verification',
  C: 'First-party disclosure',
  D: 'Analytical hypothesis',
};

export const CONFIDENCE_LEGEND: { grade: Grade; label: string; color: string }[] = [
  { grade: 'A', label: 'Primary source', color: GRADE_COLOR.A },
  { grade: 'B', label: 'Independent verification', color: GRADE_COLOR.B },
  { grade: 'C', label: 'First-party disclosure', color: GRADE_COLOR.C },
  { grade: 'D', label: 'Analytical hypothesis', color: GRADE_COLOR.D },
];

export const CARD_W = 445;
export const CARD_H = 88;
export const ROW_Y = [150, 268, 386, 504, 622, 740, 858];

export type EntityChild = { id: string; name: string; role: string };
export type EntitySection = { heading: string; rows: { label: string; value: string }[] };
export type EntityDef = {
  title: string;
  subtitle: string;
  sections: EntitySection[];
  children: EntityChild[];
};

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

export const ENTITY_REGISTRY: Record<string, EntityDef> = {
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

LT_CHILD_DEFS.forEach((c) => {
  if (!ENTITY_REGISTRY[c.id]) {
    ENTITY_REGISTRY[c.id] = {
      title: c.name,
      subtitle: c.role,
      sections: [
        {
          heading: 'STATUS',
          rows: [
            { label: 'RELATIONSHIP TO SMARTWORLD', value: 'Not separately evidenced -- tracked only via parent L&T Group hypothesis' },
            { label: 'GRADE', value: '[D] Analytical hypothesis' },
          ],
        },
      ],
      children: [],
    };
  }
});

export type SpvDef = {
  id: string;
  project: string;
  spv: string;
  row: number;
  cin: string;
  rera: string;
  address: string;
  directors: string;
  commonDirectors: string;
  status: string;
  notes: string;
};

export const SPV_DEFS: SpvDef[] = [
  {
    id: 'skyarc',
    project: 'Smartworld Sky Arc',
    spv: 'Riverday Infrastructure Pvt Ltd',
    row: 0,
    cin: 'U70100HR2021PTC098078',
    rera: 'RERA-GRG-1723-2024',
    address: '12A Floor, Tower 2, M3M IFC, Sector-66, Gurugram, Haryana',
    directors: 'Gaurav Bansal; Davinder Singh Malik',
    commonDirectors: 'Davinder Singh Malik; Bharat Vigmal',
    status: 'Partial diligence',
    notes: 'Change of developer to Riverday on 09.09.2024; licence migrated from 29 of 2009 to 90 of 2024.',
  },
  {
    id: 'onedxp',
    project: 'Smartworld One DXP',
    spv: 'Nourish Developers Pvt Ltd',
    row: 1,
    cin: 'U70109HR2020PTC091616',
    rera: 'RERA-GRG-1217-2022',
    address: '12A Floor, Tower 2, M3M IFC, Sector-66, Gurugram, Haryana',
    directors: 'Krishan Kumar Singhal; Davinder Singh Malik; Hari Easwaran',
    commonDirectors: 'Davinder Singh Malik; Hari Easwaran; Manik Sharma',
    status: 'Partial diligence',
    notes: 'Licence 106 of 2022, valid to 04.08.2027; also covers One DXP Street and Phase-2 filings.',
  },
  {
    id: 'orchard',
    project: 'Smartworld Orchard',
    spv: 'Suposhaa Realcon Pvt Ltd',
    row: 2,
    cin: 'U70105HR2016PTC092957',
    rera: 'RERA-GRG-948-2021',
    address: 'Unit SB/C/2L/Office/017A, M3M Urbana, Sector-67, Gurugram',
    directors: 'Gaurav Bansal; Naman Gupta',
    commonDirectors: 'Gaurav Bansal; Naman Gupta; Hari Easwaran (later filings)',
    status: 'Multiple registrations, ongoing',
    notes: 'Multi-licensee stack of 12+ entities; structurally the most complex SPV in the portfolio.',
  },
  {
    id: 'edition',
    project: 'Smartworld The Edition',
    spv: 'Etsy Realcon Pvt Ltd',
    row: 3,
    cin: 'U70109HR2021PTC098644',
    rera: 'RERA-GRG-1395-2023',
    address: '12A Floor, Tower 2, M3M IFC, Sector-66, Gurugram, Haryana',
    directors: 'Anil Mittal; Hari Easwaran; Davinder Singh Malik',
    commonDirectors: 'Hari Easwaran; Davinder Singh Malik; Bharat Vigmal',
    status: 'Partial diligence',
    notes: 'Owner-licensee filing; licence 83 of 2022 valid to 17.04.2028.',
  },
  {
    id: 'gems',
    project: 'Smartworld Gems',
    spv: 'Adhikaansh Realtors Pvt Ltd',
    row: 4,
    cin: 'U70109HR2020PTC090928',
    rera: 'RERA-GRG-939-2021',
    address: 'Unit SB/C/2L/Office/017A, M3M Urbana, Sector-67, Gurugram',
    directors: 'Gaurav Bansal; Naman Gupta',
    commonDirectors: 'Gaurav Bansal; Naman Gupta',
    status: 'Partial diligence, multiple phases',
    notes: 'Owner-licensee in 2021; later Gems 2 filing shifts to collaborator model over Aawam Residency Pvt Ltd.',
  },
  {
    id: 'naturescourt',
    project: "Smartworld Nature's Court I",
    spv: 'Svabhumi Realtors Pvt Ltd',
    row: 5,
    cin: 'U68100HR2023PTC111218',
    rera: 'RERA-GRG-2126-2025',
    address: '12A Floor, Tower-2, M3M IFC, Sector-66, Gurugram, Haryana',
    directors: 'Rajeev Kumar Agrawal; Sujeet Ranjan Tiwari',
    commonDirectors: 'Bharat Vigmal',
    status: 'Partial diligence',
    notes: 'Primary-source bridge from a Smartworld-branded project to an explicit M3M legal entity as licensee.',
  },
];

export type FlankDef = {
  id?: string;
  name: string;
  role: string;
  grade: Grade;
  target: string;
  edgeLabel: string;
  note: string;
  src: string;
};

export const LEFT_DEFS: FlankDef[] = [
  { name: 'Modgen Developers Pvt Ltd', role: 'Licensee -- SARFAESI title migration', grade: 'A', target: 'skyarc', edgeLabel: 'licensee_structure_with', note: 'Registered dev. rights agreement; DTCP Licence 90 of 2024, migrated from Licence 29 of 2009.', src: 'HRERA-007' },
  { name: 'Aspis Buildcon & Starcity', role: 'Disclosed land licensees', grade: 'A', target: 'onedxp', edgeLabel: 'land_licensee_of', note: 'Pre-licence collaboration agreement; DTCP Licence 106 of 2022.', src: 'HRERA-001' },
  { name: 'IREO Pvt Ltd & 11+ Co-Lic.', role: 'Multi-licensee landholding cluster', grade: 'A', target: 'orchard', edgeLabel: 'land_licensee_of', note: 'Collab agreement 3346 & addendum 4978; DTCP Licence 68 of 2021.', src: 'HRERA-003' },
  { name: 'Owner-Licensee Standard', role: 'No external land licensee disclosed', grade: 'A', target: 'edition', edgeLabel: 'owner_licensee', note: 'Owner-licensee filing; licence 83 of 2022 valid to 17.04.2028.', src: 'HRERA-002' },
  { name: 'Owner-Licensee / Aawam Residency', role: 'Owner-licensee, later collaborator model', grade: 'A', target: 'gems', edgeLabel: 'land_licensee_of', note: 'Later Gems 2 filing shifts to collaborator model over Aawam Residency Pvt Ltd.', src: 'HRERA-004;HRERA-011' },
  { name: 'M3M India Infrastructures Pvt Ltd', role: 'Land licensee -- explicit M3M node', grade: 'A', target: 'naturescourt', edgeLabel: 'land_licensee_of', note: 'Primary-source bridge from Smartworld-branded project to explicit M3M legal entity.', src: 'HRERA-005' },
  { id: 'lt', name: 'Larsen & Toubro (L&T)', role: 'EPC contractor -- diligence hypothesis', grade: 'D', target: 'ALL', edgeLabel: 'possible_epc_vendor', note: 'Hypothesis to test across brand and SPVs -- not yet evidenced by any filing.', src: 'open' },
];

export const RIGHT_DEFS: FlankDef[] = [
  { name: 'Indiabulls Housing Finance Ltd', role: 'Prior lender -- SARFAESI deed node', grade: 'A', target: 'skyarc', edgeLabel: 'prior_lender_sarfaesi', note: 'Conveyance deed & sale certificate dated 08.12.2022 to Modgen.', src: 'SWD-Sky-Arc-01' },
  { name: 'Neil Maxinfra Pvt Ltd', role: 'Bulk buyer -- conveyed OC asset', grade: 'A', target: 'skyarc', edgeLabel: 'commercial_off_taker', note: 'Conveyed 3.1875-acre existing building with 08.11.2019 OC.', src: 'SWD-Sky-Arc-02' },
  { name: '9k Expressway Catchment', role: 'Retail & institutional comm. pool', grade: 'A', target: 'onedxp', edgeLabel: 'buyer_catchment', note: 'Sales & catchment claim tied to One DXP corridor positioning.', src: 'HRERA-001' },
  { name: 'Sector 61 Retail Buyers', role: 'Orchard retail allottee base', grade: 'A', target: 'orchard', edgeLabel: 'buyer_catchment', note: 'HRERA hearing allottees tied to Orchard registrations.', src: 'HRERA-003' },
  { name: 'Sector 66 HNI/UHNI Pool', role: 'High-net-worth target allocations', grade: 'A', target: 'edition', edgeLabel: 'buyer_catchment', note: 'Targeted HNI/UHNI catchment within 5km of The Edition.', src: 'HRERA-002' },
  { name: 'Global City Catchment Links', role: "Nature's Court institutional & retail links", grade: 'A', target: 'naturescourt', edgeLabel: 'buyer_catchment', note: 'Institutional & retail buyer links disclosed alongside M3M bridge.', src: 'HRERA-005' },
  { name: 'Escrow Banks & Trustees', role: 'RERA 70% escrow custodians -- all SPVs', grade: 'B', target: 'ALL', edgeLabel: 'escrow_account_holder', note: 'Statutory RERA banking charge and institutional debt security across all project SPVs.', src: 'RERA-statute' },
];

export type ExtraDef = { name: string; role: string; grade: Grade; note: string };

export const LEFT_EXTRAS: ExtraDef[] = [
  { name: 'ELIE SAAB / ELIE SAAB Maison', role: 'Branded design & luxury interior licensor', grade: 'C', note: 'Official brand positioning for Smartworld Residences by ELIE SAAB (Sector 98, Noida).' },
  { name: 'UHA London', role: 'Architectural & façade design partner (One DXP)', grade: 'C', note: 'Official project façade designer disclosure for One DXP.' },
  { name: 'DTCP Haryana & Haryana RERA', role: 'Regulatory licensing & project oversight -- all SPVs', grade: 'A', note: 'Statutory authority granting licenses, RERA certs, and hearing orders across all project SPVs.' },
];

export const RIGHT_EXTRAS: ExtraDef[] = [
  { name: 'HNI & UHNI Catchment Buyers', role: 'Targeted high-net-worth residential investors', grade: 'C', note: 'Targeted 50,000+ HNI/UHNI families within 5km of luxury corridors (marketing claim).' },
  { name: 'MNC / IT Corporate Catchment', role: 'Commercial off-take -- IT hub corridors', grade: 'C', note: 'Catchments of 2-5 lakh+ individuals across IT/MNC hubs (marketing claim).' },
  { name: '~35,000 Retail Homebuyers', role: 'End-user customer base & allottees', grade: 'C', note: 'Official scale claim; CRM lounge servicing; HRERA hearing allottees.' },
];

export const INTERLOCKS: { name: string; bridges: string }[] = [
  { name: 'Hari Easwaran & Davinder Singh Malik', bridges: 'Bridge Nourish Developers (One DXP) and Etsy Realcon (The Edition); Malik also sits on Riverday Infrastructure (Sky Arc)' },
  { name: 'Gaurav Bansal & Naman Gupta', bridges: 'Co-manage Suposhaa Realcon (Orchard) and Adhikaansh Realtors (Gems); Bansal also directs Riverday Infrastructure' },
  { name: 'Bharat Vigmal', bridges: 'Authorised representative across Riverday, Etsy Realcon and Svabhumi Realtors -- standardizes filings across entities' },
  { name: 'M3M IFC / M3M Urbana address clusters', bridges: 'Shared registered-office infrastructure links Riverday, Nourish, Etsy, Svabhumi (IFC) and Suposhaa, Adhikaansh (Urbana)' },
];

export const PLATFORM_MODAL = {
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
};
