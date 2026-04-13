import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

const KEY = 'marketing-dashboard-state';

export async function GET() {
  try {
    const row = await prisma.appSettings.findUnique({ where: { key: KEY } });
    if (!row) return NextResponse.json(null, { headers: NO_CACHE_HEADERS });
    return NextResponse.json(row.value, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error('[marketing/state GET]', e);
    return NextResponse.json(null, { headers: NO_CACHE_HEADERS });
  }
}

async function saveState(req: Request) {
  const data = await req.json();
  await prisma.appSettings.upsert({
    where: { key: KEY },
    create: { key: KEY, value: data },
    update: { value: data },
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  try {
    return await saveState(req);
  } catch (e) {
    console.error('[marketing/state PUT]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    return await saveState(req);
  } catch (e) {
    console.error('[marketing/state POST]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
