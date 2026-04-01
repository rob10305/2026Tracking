import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Ensure this route is never statically cached
export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  try {
    const row = await prisma.salesMotionTrackerState.findUnique({ where: { id: 1 } });
    if (!row) return NextResponse.json(null, { headers: NO_CACHE_HEADERS });
    return NextResponse.json(row.data, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error('[sales-motion/state GET]', e);
    return NextResponse.json(null, { headers: NO_CACHE_HEADERS });
  }
}

async function saveState(req: Request) {
  const data = await req.json();
  await prisma.salesMotionTrackerState.upsert({
    where: { id: 1 },
    create: { id: 1, data },
    update: { data },
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  try {
    return await saveState(req);
  } catch (e) {
    console.error('[sales-motion/state PUT]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// POST handler for navigator.sendBeacon (fires on tab close)
export async function POST(req: Request) {
  try {
    return await saveState(req);
  } catch (e) {
    console.error('[sales-motion/state POST]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
