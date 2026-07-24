// Generic Exposure Network schema + theme constants.
//
// These are shared across every organization's exposure network — colors, legend labels,
// and canvas layout are visual design tokens (per the original Claude Design handoff,
// design_handoff_odic_intelligence_platform/README.md), not per-org data. Everything
// org-specific (entities, edges, grades of evidence, interlocks) lives in a per-org data
// file under ./orgs/ and is loaded at runtime via ./registry.ts.
//
// This file previously lived inline in data.ts hardcoded to a single organization
// (Smartworld Developers). It has been split out so any organization can populate the
// same renderer (ExposureNetwork.tsx) by providing an ExposureNetworkData object,
// matching the "backing intelligence object API" called for in the original design
// handoff (README.md line ~104: "relationship edges with evidence grade/source/notes,
// and an entity hierarchy for drill-down").

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
  additionalRegistrations?: { rera: string; status: string }[];
  deepDiligence?: EntitySection[];
};

export type FlankDef = {
  id?: string;
  name: string;
  role: string;
  grade: Grade;
  target: string; // SpvDef id, or 'ALL' to fan out to every SPV card
  edgeLabel: string;
  note: string;
  src: string;
};

export type ExtraDef = { name: string; role: string; grade: Grade; note: string };

export type PromoterLead = { name: string; role: string; note: string };

export type PlatformModal = {
  title: string;
  subtitle: string;
  sections: { heading: string; rows: { label: string; value: string }[] }[];
};

// The full per-organization payload the ExposureNetwork renderer needs.
// One of these should exist per org that has the 'exposure-network' pack enabled.
export type ExposureNetworkData = {
  orgId: string;
  orgName: string;
  ticker: string; // short header wordmark, e.g. "SWD IN"
  platformModal: PlatformModal;
  spvDefs: SpvDef[];
  leftDefs: FlankDef[];
  rightDefs: FlankDef[];
  leftExtras: ExtraDef[];
  rightExtras: ExtraDef[];
  interlocks: { name: string; bridges: string }[];
  promoterNetwork: PromoterLead[];
  entityRegistry: Record<string, EntityDef>;
};

// Auto-fills any FlankDef.id referenced in leftDefs/rightDefs that doesn't already have
// an explicit EntityDef, using its own name/role as a minimal stub — same behavior the
// original hardcoded data.ts had for L&T's child entities. Call this once per org after
// building the org's own entityRegistry + child defs, so drill-down never 404s on a
// referenced child id.
export function fillEntityRegistryDefaults(
  entityRegistry: Record<string, EntityDef>,
  children: EntityChild[],
): Record<string, EntityDef> {
  const registry = { ...entityRegistry };
  children.forEach((c) => {
    if (!registry[c.id]) {
      registry[c.id] = {
        title: c.name,
        subtitle: c.role,
        sections: [
          {
            heading: 'STATUS',
            rows: [{ label: 'GRADE', value: '[D] Analytical hypothesis -- no dedicated record yet' }],
          },
        ],
        children: [],
      };
    }
  });
  return registry;
}
