import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { STANDARD_DELIVERABLES } from "@/lib/models/types";

export async function PUT(req: Request) {
  const body = await req.json();
  const { product, salesMotion, isNew } = body;

  if (isNew) {
    const maxOrder = await prisma.product.aggregate({ _max: { sort_order: true } });
    const sortOrder = (maxOrder._max.sort_order ?? -1) + 1;

    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description ?? "",
        generally_available: product.generally_available ?? "",
        gross_annual_price: product.gross_annual_price ?? 0,
        platform_support_services_pct: product.platform_support_services_pct ?? 0,
        professional_services_pct: product.professional_services_pct ?? 0,
        software_resale_pct: product.software_resale_pct ?? 0,
        cloud_consumption_pct: product.cloud_consumption_pct ?? 0,
        pss_pct: product.pss_pct ?? 0,
        user_count: product.user_count ?? "",
        has_variants: product.has_variants ?? false,
        selected_variant: product.selected_variant ?? null,
        variants: product.variants ? (product.variants as Prisma.InputJsonValue) : Prisma.JsonNull,
        status: product.status ?? "live",
        readiness: product.readiness ? (product.readiness as Prisma.InputJsonValue) : Prisma.JsonNull,
        sort_order: sortOrder,
      },
    });

    if (salesMotion) {
      await prisma.salesMotion.create({
        data: {
          product_id: product.id,
          sales_cycle_months: salesMotion.sales_cycle_months,
          opp_to_close_win_rate_pct: salesMotion.opp_to_close_win_rate_pct,
          prospect_to_opp_rate_pct: salesMotion.prospect_to_opp_rate_pct,
          prospecting_lead_time_months: salesMotion.prospecting_lead_time_months,
        },
      });
    }

    const reqs = STANDARD_DELIVERABLES.map((d, i) => ({
      product_id: product.id,
      deliverable: d,
      owner: "",
      criticalPath: "",
      timeline: "",
      content: "",
      sort_order: i,
    }));
    await prisma.launchRequirement.createMany({ data: reqs });
  } else {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        description: product.description ?? "",
        generally_available: product.generally_available ?? "",
        gross_annual_price: product.gross_annual_price ?? 0,
        platform_support_services_pct: product.platform_support_services_pct ?? 0,
        professional_services_pct: product.professional_services_pct ?? 0,
        software_resale_pct: product.software_resale_pct ?? 0,
        cloud_consumption_pct: product.cloud_consumption_pct ?? 0,
        pss_pct: product.pss_pct ?? 0,
        user_count: product.user_count ?? "",
        has_variants: product.has_variants ?? false,
        selected_variant: product.selected_variant ?? null,
        variants: product.variants ? (product.variants as Prisma.InputJsonValue) : Prisma.JsonNull,
        status: product.status ?? "live",
        readiness: product.readiness ? (product.readiness as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
