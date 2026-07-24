// DEPRECATED — this file used to hold hardcoded Smartworld-specific data directly.
// It has been split into:
//   ./schema.ts               -- generic types + theme constants (shared across orgs)
//   ./orgs/smartworld.ts      -- Smartworld's own data, as an ExposureNetworkData object
//   ./registry.ts             -- getExposureNetworkData(orgId) loader
//
// This re-export exists only for backward compatibility with any other call site that
// still imports the old names directly. New code should import from schema.ts/registry.ts
// instead. If nothing breaks when this file is deleted, delete it.

export {
  GRADE_COLOR,
  GRADE_LABEL,
  CONFIDENCE_LEGEND,
  CARD_W,
  CARD_H,
  ROW_Y,
} from './schema';
export type {
  Grade,
  EntityChild,
  EntitySection,
  EntityDef,
  SpvDef,
  FlankDef,
  ExtraDef,
  PromoterLead,
} from './schema';

import { smartworldExposureNetwork } from './orgs/smartworld';

export const ENTITY_REGISTRY = smartworldExposureNetwork.entityRegistry;
export const SPV_DEFS = smartworldExposureNetwork.spvDefs;
export const LEFT_DEFS = smartworldExposureNetwork.leftDefs;
export const RIGHT_DEFS = smartworldExposureNetwork.rightDefs;
export const LEFT_EXTRAS = smartworldExposureNetwork.leftExtras;
export const RIGHT_EXTRAS = smartworldExposureNetwork.rightExtras;
export const INTERLOCKS = smartworldExposureNetwork.interlocks;
export const PROMOTER_NETWORK = smartworldExposureNetwork.promoterNetwork;
export const PLATFORM_MODAL = smartworldExposureNetwork.platformModal;
