import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  const { productId, salesMotion } = await req.json();

  await prisma.salesMotion.upsert({
    where: { product_id: productId },
    update: {
      sales_cycle_months: salesMotion.sales_cycle_months,
      opp_to_close_win_rate_pct: salesMotion.opp_to_close_win_rate_pct,
      prospect_to_opp_rate_pct: salesMotion.prospect_to_opp_rate_pct,
      prospecting_lead_time_months: salesMotion.prospecting_lead_time_months,
    },
    create: {
      product_id: productId,
      sales_cycle_months: salesMotion.sales_cycle_months,
      opp_to_close_win_rate_pct: salesMotion.opp_to_close_win_rate_pct,
      prospect_to_opp_rate_pct: salesMotion.prospect_to_opp_rate_pct,
      prospecting_lead_time_months: salesMotion.prospecting_lead_time_months,
    },
  });

  return NextResponse.json({ ok: true });
}
