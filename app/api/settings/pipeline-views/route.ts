import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const REPORT_ID_RE = /^[a-zA-Z0-9]{15,18}$/;

function normalizeReportId(raw: string): string {
  const trimmed = raw.trim();
  // Accept a pasted Salesforce URL and extract the 15/18-char ID.
  const urlMatch = trimmed.match(/\/([a-zA-Z0-9]{15,18})(?:\/|$|\?)/);
  return urlMatch ? urlMatch[1] : trimmed;
}

export async function GET() {
  try {
    const views = await prisma.pipelineView.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json(views, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error('[settings/pipeline-views GET]', e);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const label = typeof body?.label === 'string' ? body.label.trim() : '';
    const description =
      typeof body?.description === 'string' ? body.description.trim() : '';
    const reportIdRaw = typeof body?.reportId === 'string' ? body.reportId : '';
    const reportId = normalizeReportId(reportIdRaw);

    if (!label) {
      return NextResponse.json({ error: 'label is required' }, { status: 400 });
    }
    if (!REPORT_ID_RE.test(reportId)) {
      return NextResponse.json(
        { error: 'reportId must be a 15- or 18-char Salesforce ID' },
        { status: 400 },
      );
    }

    const max = await prisma.pipelineView.aggregate({
      _max: { sortOrder: true },
    });
    const nextOrder = (max._max.sortOrder ?? -1) + 1;

    const created = await prisma.pipelineView.create({
      data: { label, description, reportId, sortOrder: nextOrder },
    });
    return NextResponse.json(created);
  } catch (e) {
    console.error('[settings/pipeline-views POST]', e);
    return NextResponse.json({ error: 'Failed to create view' }, { status: 500 });
  }
}
