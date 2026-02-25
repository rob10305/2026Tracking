import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { AppState } from "@/lib/models/types";
import { createSeedData } from "@/lib/store/seed";
import { STANDARD_DELIVERABLES } from "@/lib/models/types";

async function autoSeedIfEmpty() {
  const count = await prisma.product.count();
  if (count > 0) return;

  const seed = createSeedData();

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
      data: { product_id: productId, ...motion },
    });
  }

  const settingsEntries = [
    { key: "margins", value: seed.margins },
    { key: "industryAverages", value: seed.industryAverages },
    { key: "itmHistoricalAverages", value: seed.itmHistoricalAverages },
    { key: "pipelineContribution", value: seed.pipelineContribution },
  ];
  for (const s of settingsEntries) {
    await prisma.appSettings.create({
      data: { key: s.key, value: s.value as any },
    });
  }

  const defaultOwners: Record<string, Record<string, string>> = {
    "prod-mcp-server": { "Product Management sign-off": "Phi", "Technical readiness certification": "Phi", "Marketing launch plan": "Paul", "Sales enablement training": "Rob", "Demo environment ready": "Rob", "Customer support runbook": "Rob", "Reference architecture documentation": "Phi", "Pricing/packaging finalized": "Paul", "Partner enablement materials": "Rob", "Internal knowledge base updated": "Phi", "Go-to-market campaign": "Paul", "Success metrics defined": "Phi", "Customer advisory board briefing": "Rob", "Post-launch review scheduled": "Phi" },
    "prod-ai-gateway": { "Product Management sign-off": "Phi", "Technical readiness certification": "Virgil", "Marketing launch plan": "Paul", "Sales enablement training": "Rob", "Demo environment ready": "Virgil", "Customer support runbook": "Rob", "Reference architecture documentation": "Virgil", "Pricing/packaging finalized": "Paul", "Partner enablement materials": "Rob", "Internal knowledge base updated": "Phi", "Go-to-market campaign": "Paul", "Success metrics defined": "Phi", "Customer advisory board briefing": "Rob", "Post-launch review scheduled": "Phi" },
    "prod-mcp-hub": { "Product Management sign-off": "Phi", "Technical readiness certification": "Virgil", "Marketing launch plan": "Paul", "Sales enablement training": "Rob", "Demo environment ready": "Virgil", "Customer support runbook": "Rob", "Reference architecture documentation": "Virgil", "Pricing/packaging finalized": "Paul", "Partner enablement materials": "Rob", "Internal knowledge base updated": "Phi", "Go-to-market campaign": "Paul", "Success metrics defined": "Phi", "Customer advisory board briefing": "Rob", "Post-launch review scheduled": "Phi" },
    "prod-managed-plane": { "Product Management sign-off": "Phi", "Technical readiness certification": "Phi", "Marketing launch plan": "Paul", "Sales enablement training": "Rob", "Demo environment ready": "Phi", "Customer support runbook": "Rob", "Reference architecture documentation": "Phi", "Pricing/packaging finalized": "Paul", "Partner enablement materials": "Rob", "Internal knowledge base updated": "Phi", "Go-to-market campaign": "Paul", "Success metrics defined": "Phi", "Customer advisory board briefing": "Rob", "Post-launch review scheduled": "Phi" },
  };

  for (const product of seed.products) {
    const ownerMap = defaultOwners[product.id] ?? {};
    for (let j = 0; j < STANDARD_DELIVERABLES.length; j++) {
      const d = STANDARD_DELIVERABLES[j];
      await prisma.launchRequirement.create({
        data: {
          product_id: product.id,
          deliverable: d,
          owner: ownerMap[d] ?? "",
          criticalPath: "",
          timeline: "",
          content: "",
          sort_order: j,
        },
      });
    }
  }
}

export async function GET() {
  await autoSeedIfEmpty();

  const products = await prisma.product.findMany({ orderBy: { sort_order: "asc" } });
  const salesMotions = await prisma.salesMotion.findMany();
  const settings = await prisma.appSettings.findMany();
  const forecastEntries = await prisma.forecastEntry.findMany();
  const launchReqs = await prisma.launchRequirement.findMany({ orderBy: { sort_order: "asc" } });

  const settingsMap: Record<string, any> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  const salesMotionByProductId: AppState["salesMotionByProductId"] = {};
  for (const sm of salesMotions) {
    salesMotionByProductId[sm.product_id] = {
      sales_cycle_months: sm.sales_cycle_months,
      opp_to_close_win_rate_pct: sm.opp_to_close_win_rate_pct,
      prospect_to_opp_rate_pct: sm.prospect_to_opp_rate_pct,
      prospecting_lead_time_months: sm.prospecting_lead_time_months,
    };
  }

  const forecastByProductIdMonth: AppState["forecastByProductIdMonth"] = {};
  for (const fe of forecastEntries) {
    forecastByProductIdMonth[`${fe.product_id}::${fe.month}`] = fe.quantity;
  }

  const launchRequirements: AppState["launchRequirements"] = {};
  for (const lr of launchReqs) {
    if (!launchRequirements[lr.product_id]) {
      launchRequirements[lr.product_id] = [];
    }
    launchRequirements[lr.product_id].push({
      deliverable: lr.deliverable,
      owner: lr.owner,
      criticalPath: lr.criticalPath,
      timeline: lr.timeline,
      content: lr.content,
    });
  }

  const state: AppState = {
    products: products.map((p) => ({
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
      selected_variant: (p.selected_variant as any) ?? undefined,
      variants: (p.variants as any) ?? undefined,
      status: p.status as any,
      readiness: (p.readiness as any) ?? undefined,
    })),
    margins: settingsMap.margins ?? {
      professional_services_margin_pct: 45,
      software_resale_margin_pct: 20,
      cloud_consumption_margin_pct: 30,
      pss_margin_pct: 55,
    },
    industryAverages: settingsMap.industryAverages ?? {
      sales_cycle_months: 3,
      opp_to_close_win_rate_pct: 20,
      prospect_to_opp_rate_pct: 15,
      prospecting_lead_time_months: 1,
    },
    itmHistoricalAverages: settingsMap.itmHistoricalAverages ?? {
      sales_cycle_months: 4,
      opp_to_close_win_rate_pct: 25,
      prospect_to_opp_rate_pct: 18,
      prospecting_lead_time_months: 1,
    },
    pipelineContribution: settingsMap.pipelineContribution ?? {
      mode: "pct",
      website_inbound: 25,
      sales_team_generated: 30,
      event_sourced: 15,
      abm_thought_leadership: 15,
      partner_referral: 15,
    },
    salesMotionByProductId,
    forecastByProductIdMonth,
    launchRequirements,
  };

  return NextResponse.json(state);
}
