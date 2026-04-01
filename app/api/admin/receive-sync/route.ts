import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { AppState, SavedForecast } from '@/lib/models/types';

interface SyncPayload {
  appState: AppState;
  savedForecasts: SavedForecast[];
  salesMotionState: unknown;
}

export async function POST(req: Request) {
  try {
    const body: SyncPayload = await req.json();
    const { appState, savedForecasts, salesMotionState } = body;

    // ── 1. Wipe existing main app tables ────────────────────────────────────
    await prisma.launchRequirement.deleteMany();
    await prisma.forecastEntry.deleteMany();
    await prisma.salesMotion.deleteMany();
    await prisma.savedForecastEntry.deleteMany();
    await prisma.savedForecast.deleteMany();
    await prisma.product.deleteMany();
    await prisma.appSettings.deleteMany();

    // ── 2. Rebuild products ──────────────────────────────────────────────────
    for (let i = 0; i < appState.products.length; i++) {
      const p = appState.products[i];
      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          description: p.description,
          generally_available: p.generally_available,
          gross_annual_price: p.gross_annual_price,
          platform_support_services_pct: p.platform_support_services_pct,
          professional_services_pct: p.professional_services_pct,
          software_resale_pct: p.software_resale_pct,
          cloud_consumption_pct: p.cloud_consumption_pct,
          pss_pct: p.pss_pct,
          user_count: p.user_count,
          has_variants: p.has_variants,
          selected_variant: p.selected_variant ?? null,
          variants: (p.variants ?? Prisma.JsonNull) as unknown as Prisma.InputJsonValue,
          status: p.status,
          readiness: (p.readiness ?? Prisma.JsonNull) as unknown as Prisma.InputJsonValue,
          sort_order: i,
        },
      });
    }

    // ── 3. Rebuild settings ──────────────────────────────────────────────────
    await prisma.appSettings.createMany({
      data: [
        { key: 'margins', value: appState.margins as unknown as Prisma.InputJsonValue },
        { key: 'industryAverages', value: appState.industryAverages as unknown as Prisma.InputJsonValue },
        { key: 'itmHistoricalAverages', value: appState.itmHistoricalAverages as unknown as Prisma.InputJsonValue },
        { key: 'pipelineContribution', value: appState.pipelineContribution as unknown as Prisma.InputJsonValue },
      ],
    });

    // ── 4. Rebuild sales motions ─────────────────────────────────────────────
    for (const [productId, motion] of Object.entries(appState.salesMotionByProductId)) {
      await prisma.salesMotion.create({
        data: {
          product_id: productId,
          sales_cycle_months: motion.sales_cycle_months,
          opp_to_close_win_rate_pct: motion.opp_to_close_win_rate_pct,
          prospect_to_opp_rate_pct: motion.prospect_to_opp_rate_pct,
          prospecting_lead_time_months: motion.prospecting_lead_time_months,
        },
      });
    }

    // ── 5. Rebuild forecast entries ──────────────────────────────────────────
    const fEntries = Object.entries(appState.forecastByProductIdMonth);
    if (fEntries.length > 0) {
      await prisma.forecastEntry.createMany({
        data: fEntries.map(([key, quantity]) => {
          const [product_id, month] = key.split('::');
          return { product_id, month, quantity };
        }),
      });
    }

    // ── 6. Rebuild launch requirements ───────────────────────────────────────
    for (const [productId, reqs] of Object.entries(appState.launchRequirements)) {
      for (let i = 0; i < reqs.length; i++) {
        const r = reqs[i];
        await prisma.launchRequirement.create({
          data: {
            product_id: productId,
            deliverable: r.deliverable,
            owner: r.owner,
            criticalPath: r.criticalPath,
            timeline: r.timeline,
            content: r.content,
            sort_order: i,
          },
        });
      }
    }

    // ── 7. Rebuild saved forecasts ───────────────────────────────────────────
    for (const fc of savedForecasts) {
      await prisma.savedForecast.create({
        data: { id: fc.id, name: fc.name },
      });
      const qEntries = Object.entries(fc.quantities || {});
      if (qEntries.length > 0) {
        await prisma.savedForecastEntry.createMany({
          data: qEntries.map(([key, qty]) => ({
            forecast_id: fc.id,
            key,
            quantity: qty as number,
          })),
        });
      }
    }

    // ── 8. Rebuild Sales Motion Tracker state ────────────────────────────────
    if (salesMotionState) {
      await prisma.salesMotionTrackerState.upsert({
        where: { id: 1 },
        create: { id: 1, data: salesMotionState as Prisma.InputJsonValue },
        update: { data: salesMotionState as Prisma.InputJsonValue },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[receive-sync]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
