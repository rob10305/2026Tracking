import { NextResponse } from 'next/server';
import { runReport, getReportMetadata } from '@/lib/salesforce/reports';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

/**
 * GET /api/salesforce/reports/{reportId}?describe=1
 *
 * Runs a Salesforce report and returns the executed result.
 * Pass `?describe=1` to get just the metadata (columns, filters) without running it.
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

    const data = describe ? await getReportMetadata(id) : await runReport(id);
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[salesforce/reports]', msg);
    return NextResponse.json(
      { error: 'Failed to run report', detail: msg },
      { status: 503 },
    );
  }
}
