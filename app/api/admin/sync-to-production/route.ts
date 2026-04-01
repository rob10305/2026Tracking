import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const PRODUCTION_URL = process.env.PRODUCTION_URL ?? 'https://forecast-2.replit.app';

// Determine the local base URL for internal API calls
function localBase() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:5000';
}

export async function POST() {
  try {
    const base = localBase();

    // ── 1. Fetch full main app state ─────────────────────────────────────────
    const [appStateRes, savedForecastsRes] = await Promise.all([
      fetch(`${base}/api/db/state`),
      fetch(`${base}/api/db/saved-forecasts`),
    ]);

    if (!appStateRes.ok) throw new Error(`Failed to read app state: HTTP ${appStateRes.status}`);
    if (!savedForecastsRes.ok) throw new Error(`Failed to read saved forecasts: HTTP ${savedForecastsRes.status}`);

    const appState = await appStateRes.json();
    const savedForecasts = await savedForecastsRes.json();

    // ── 2. Fetch Sales Motion Tracker state ───────────────────────────────────
    const smRow = await prisma.salesMotionTrackerState.findUnique({ where: { id: 1 } });
    const salesMotionState = smRow?.data ?? null;

    // ── 3. Push everything to production ─────────────────────────────────────
    const payload = { appState, savedForecasts, salesMotionState };
    const res = await fetch(`${PRODUCTION_URL}/api/admin/receive-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Production sync failed: HTTP ${res.status} — ${text.slice(0, 200)}`);
    }

    return NextResponse.json({ ok: true, productionUrl: PRODUCTION_URL });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[sync-to-production]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
