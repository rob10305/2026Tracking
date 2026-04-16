import { NextResponse } from 'next/server';
import { withSalesforce } from '@/lib/salesforce/client';
import type { SfdcHealth } from '@/lib/salesforce/types';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

/**
 * GET /api/salesforce/health
 *
 * Lightweight check that JWT auth succeeds and we can reach Salesforce.
 * Returns connection metadata (instance URL, org ID, user ID) but no business data.
 */
export async function GET() {
  try {
    const info = await withSalesforce(async (conn) => {
      // `identity()` hits /services/oauth2/userinfo — cheapest way to confirm auth
      const identity = await conn.identity();
      return {
        connected: true as const,
        instanceUrl: conn.instanceUrl ?? null,
        userId: identity.user_id ?? null,
        organizationId: identity.organization_id ?? null,
        apiVersion: conn.version,
      };
    });

    const health: SfdcHealth = { ...info };
    return NextResponse.json(health, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[salesforce/health]', msg);
    const health: SfdcHealth = {
      connected: false,
      instanceUrl: null,
      userId: null,
      organizationId: null,
      apiVersion: process.env.SFDC_API_VERSION || '62.0',
      error: msg,
    };
    return NextResponse.json(health, { status: 503, headers: NO_CACHE_HEADERS });
  }
}
