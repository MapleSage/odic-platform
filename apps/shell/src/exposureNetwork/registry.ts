// Exposure Network data loader.
//
// TODO(Luna, backend): this is currently a static in-memory map of per-org data files.
// Per docs/atlas-backend-brief-for-luna-2026-07-24.md (P0), this should become a fetch
// against a real intelligence-object API, e.g. `GET /api/orgs/:id/exposure-network`,
// returning the same ExposureNetworkData shape. Swapping the body of
// getExposureNetworkData for a fetch call (with loading/error states in the component)
// is the only change needed on the frontend side once that endpoint exists -- the
// renderer and schema do not change.

import type { ExposureNetworkData } from './schema';
import { smartworldExposureNetwork } from './orgs/smartworld';

const EXPOSURE_NETWORK_REGISTRY: Record<string, ExposureNetworkData> = {
  smartworld: smartworldExposureNetwork,
};

export function getExposureNetworkData(orgId: string): ExposureNetworkData | undefined {
  return EXPOSURE_NETWORK_REGISTRY[orgId];
}

export function listExposureNetworkOrgIds(): string[] {
  return Object.keys(EXPOSURE_NETWORK_REGISTRY);
}
