import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createSeedData } from "@/lib/store/seed";
import { STANDARD_DELIVERABLES } from "@/lib/models/types";

export async function POST() {
  const seed = createSeedData();

  await prisma.launchRequirement.deleteMany();
  await prisma.forecastEntry.deleteMany();
  await prisma.salesMotion.deleteMany();
  await prisma.savedForecastEntry.deleteMany();
  await prisma.savedForecast.deleteMany();
  await prisma.product.deleteMany();
  await prisma.appSettings.deleteMany();

  for (let i = 0; i < seed.products.length; i++) {
    const p = seed.products[i];
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
        variants: (p.variants ?? Prisma.JsonNull) as any,
        status: p.status,
        readiness: (p.readiness ?? Prisma.JsonNull) as any,
        sort_order: i,
      },
    });
  }

  for (const [productId, motion] of Object.entries(seed.salesMotionByProductId)) {
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

  await prisma.appSettings.createMany({
    data: [
      { key: "margins", value: seed.margins as any },
      { key: "industryAverages", value: seed.industryAverages as any },
      { key: "itmHistoricalAverages", value: seed.itmHistoricalAverages as any },
      { key: "pipelineContribution", value: seed.pipelineContribution as any },
    ],
  });

  for (const [productId, reqs] of Object.entries(seed.launchRequirements)) {
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

  return NextResponse.json({ ok: true });
}
