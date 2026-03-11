import { HealthResponse, PlatformAdminOverviewResponse, PaymentsStatsResponse } from './contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getAuthHeaders() {
  const token = process.env.NEXT_PUBLIC_API_TOKEN ?? process.env.API_TOKEN;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function getHealth() {
  return fetchJson<HealthResponse>('/api/health');
}

export async function getPlatformAdminOverview() {
  return fetchJson<PlatformAdminOverviewResponse>('/api/platform-admin/overview');
}

export async function getPaymentsStats() {
  return fetchJson<PaymentsStatsResponse>('/api/payments/stats');
}
