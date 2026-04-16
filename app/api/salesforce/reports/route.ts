import { NextResponse } from 'next/server';
import { listReports } from '@/lib/salesforce/reports';

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
};

/**
 * GET /api/salesforce/reports?q=pipeline&limit=25
 *
 * Returns a list of Salesforce reports (id, name, folder, format, lastModified),
 * filtered by `q` when provided. Searches Name / DeveloperName / FolderName.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') ?? '';
    const limitRaw = url.searchParams.get('limit');
    const limit = limitRaw ? Number(limitRaw) : undefined;

    const reports = await listReports({
      q,
      limit: Number.isFinite(limit) ? (limit as number) : undefined,
    });
    return NextResponse.json(reports, { headers: CACHE_HEADERS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[salesforce/reports list]', msg);
    return NextResponse.json(
      { error: 'Failed to list reports', detail: msg },
      { status: 503 },
    );
  }
}
