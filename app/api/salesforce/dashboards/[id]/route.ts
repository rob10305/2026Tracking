import { NextResponse } from 'next/server';
import { runDashboard, getDashboardMetadata } from '@/lib/salesforce/dashboards';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

/**
 * GET /api/salesforce/dashboards/{dashboardId}?describe=1
 *
 * Runs a Salesforce dashboard and returns component results.
 * Pass `?describe=1` to get just the metadata (no run).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const describe = ['1', 'true', 'yes'].includes(
      (url.searchParams.get('describe') ?? '').toLowerCase(),
    );

    const data = describe ? await getDashboardMetadata(id) : await runDashboard(id);
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[salesforce/dashboards]', msg);
    return NextResponse.json(
      { error: 'Failed to run dashboard', detail: msg },
      { status: 503 },
    );
  }
}
