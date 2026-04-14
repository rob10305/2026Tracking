import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

const KEY = 'marketing-settings';

interface MarketingSettings {
  onedriveUrl?: string;
}

export async function GET() {
  try {
    const row = await prisma.appSettings.findUnique({ where: { key: KEY } });
    if (!row) return NextResponse.json({} as MarketingSettings, { headers: NO_CACHE_HEADERS });
    return NextResponse.json(row.value, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error('[settings/marketing GET]', e);
    return NextResponse.json({}, { headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(req: Request) {
  try {
    const data = (await req.json()) as MarketingSettings;
    await prisma.appSettings.upsert({
      where: { key: KEY },
      create: { key: KEY, value: data },
      update: { value: data },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[settings/marketing PUT]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
