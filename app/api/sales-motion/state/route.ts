import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const row = await prisma.salesMotionTrackerState.findUnique({ where: { id: 1 } });
    if (!row) return NextResponse.json(null);
    return NextResponse.json(row.data);
  } catch (e) {
    console.error('[sales-motion/state GET]', e);
    return NextResponse.json(null);
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    await prisma.salesMotionTrackerState.upsert({
      where: { id: 1 },
      create: { id: 1, data },
      update: { data },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[sales-motion/state PUT]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
