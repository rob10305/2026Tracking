import { NextResponse } from 'next/server';
import { listDashboards } from '@/lib/salesforce/dashboards';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
};

/**
 * GET /api/salesforce/dashboards?q=pipeline&limit=25
 *
 * Returns a list of Salesforce dashboards (id, name, folder, lastModified),
 * filtered by `q` when provided.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') ?? '';
    const limitRaw = url.searchParams.get('limit');
    const limit = limitRaw ? Number(limitRaw) : undefined;

    const dashboards = await listDashboards({
      q,
      limit: Number.isFinite(limit) ? (limit as number) : undefined,
    });
    return NextResponse.json(dashboards, { headers: CACHE_HEADERS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[salesforce/dashboards list]', msg);
    return NextResponse.json(
      { error: 'Failed to list dashboards', detail: msg },
      { status: 503 },
    );
  }
}
