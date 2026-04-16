import { NextResponse } from 'next/server';
import { fetchOpportunities, fetchPipelineRollup } from '@/lib/salesforce/opportunities';
import type { SfdcOpportunityQuery } from '@/lib/salesforce/types';

export const dynamic = 'force-dynamic';

// Short CDN cache so dashboards refreshing the same minute share a single SFDC call
// and we stay well under the org API limit. Still served with no-store to the user
// on first request after cache expiry.
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

/**
 * GET /api/salesforce/opportunities?status=open&ownerId=...&rollup=1&limit=50
 *
 * Query params (all optional):
 * - status:      "open" | "closed" | "won" | "all" (default: open)
 * - ownerId:     Salesforce User Id to filter by opportunity owner
 * - accountId:   Salesforce Account Id
 * - modifiedSince: ISO datetime — only opps changed since
 * - limit:       max records, 1..2000 (default 200)
 * - rollup:      if "1" or "true", returns aggregated metrics instead of raw records
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q: SfdcOpportunityQuery = {
      status: (url.searchParams.get('status') as SfdcOpportunityQuery['status']) ?? 'open',
      ownerId: url.searchParams.get('ownerId') ?? undefined,
      accountId: url.searchParams.get('accountId') ?? undefined,
      modifiedSince: url.searchParams.get('modifiedSince') ?? undefined,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : undefined,
    };

    const wantsRollup = ['1', 'true', 'yes'].includes(
      (url.searchParams.get('rollup') ?? '').toLowerCase(),
    );

    if (wantsRollup) {
      const rollup = await fetchPipelineRollup(q);
      return NextResponse.json(rollup, { headers: CACHE_HEADERS });
    }

    const opps = await fetchOpportunities(q);
    return NextResponse.json({ count: opps.length, records: opps }, { headers: CACHE_HEADERS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[salesforce/opportunities]', msg);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities', detail: msg },
      { status: 503 },
    );
  }
}
