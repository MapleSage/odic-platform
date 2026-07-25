// Exposure Network data loader.
//
// Backed by GET /api/orgs/:id/exposure-network (services/fastapi-orchestration/exposure_network.py),
// which returns the same ExposureNetworkData shape defined in schema.ts. 404 means the org has no
// data file yet -- callers should treat `undefined` as "no relationships evidenced yet", not an error.

import type { ExposureNetworkData } from './schema';

const API_BASE = (((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL) ?? '').replace(/\/$/, '');

const cache = new Map<string, Promise<ExposureNetworkData | undefined>>();

export function getExposureNetworkData(
  orgId: string,
  getAccessToken: () => Promise<string | null>,
): Promise<ExposureNetworkData | undefined> {
  const cached = cache.get(orgId);
  if (cached) return cached;

  const promise = fetchExposureNetworkData(orgId, getAccessToken).catch((error) => {
    cache.delete(orgId);
    throw error;
  });
  cache.set(orgId, promise);
  return promise;
}

async function fetchExposureNetworkData(
  orgId: string,
  getAccessToken: () => Promise<string | null>,
): Promise<ExposureNetworkData | undefined> {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE}/api/orgs/${encodeURIComponent(orgId)}/exposure-network`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Exposure Network fetch failed: HTTP ${response.status}`);
  return response.json();
}
