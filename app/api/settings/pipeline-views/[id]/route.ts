import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const REPORT_ID_RE = /^[a-zA-Z0-9]{15,18}$/;

function normalizeReportId(raw: string): string {
  const trimmed = raw.trim();
  const urlMatch = trimmed.match(/\/([a-zA-Z0-9]{15,18})(?:\/|$|\?)/);
  return urlMatch ? urlMatch[1] : trimmed;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: {
      label?: string;
      description?: string;
      reportId?: string;
      kind?: string;
      sortOrder?: number;
    } = {};

    if (typeof body?.label === 'string') {
      const label = body.label.trim();
      if (!label) {
        return NextResponse.json({ error: 'label cannot be empty' }, { status: 400 });
      }
      data.label = label;
    }
    if (typeof body?.description === 'string') {
      data.description = body.description.trim();
    }
    if (typeof body?.reportId === 'string') {
      const reportId = normalizeReportId(body.reportId);
      if (!REPORT_ID_RE.test(reportId)) {
        return NextResponse.json(
          { error: 'reportId must be a 15- or 18-char Salesforce ID' },
          { status: 400 },
        );
      }
      data.reportId = reportId;
    }
    if (typeof body?.kind === 'string' && (body.kind === 'report' || body.kind === 'dashboard')) {
      data.kind = body.kind;
    }
    if (typeof body?.sortOrder === 'number' && Number.isFinite(body.sortOrder)) {
      data.sortOrder = Math.trunc(body.sortOrder);
    }

    const updated = await prisma.pipelineView.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error('[settings/pipeline-views PATCH]', e);
    return NextResponse.json({ error: 'Failed to update view' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.pipelineView.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[settings/pipeline-views DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete view' }, { status: 500 });
  }
}
