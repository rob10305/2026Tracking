import type { AppState, Margins, PipelineContribution, VariantPricing } from "@/lib/models/types";

function makeVariants(
  s: VariantPricing,
  m: VariantPricing,
  l: VariantPricing,
): Record<"small" | "medium" | "large", VariantPricing> {
  return { small: s, medium: m, large: l };
}

function sameVariant(v: VariantPricing): Record<"small" | "medium" | "large", VariantPricing> {
  return { small: { ...v }, medium: { ...v }, large: { ...v } };
}

export function createSeedData(): AppState {
  const products = [
    {
      id: "prod-mcp-server",
      name: "MCP Server",
      description: "",
      generally_available: "April",
      gross_annual_price: 40900,
      platform_support_services_pct: 37,
      professional_services_pct: 43,
      software_resale_pct: 0,
      cloud_consumption_pct: 21,
      eps_pct: 0,
      user_count: "N/A",
      has_variants: true,
      selected_variant: "small" as const,
      variants: makeVariants(
        { gross_annual_price: 40900, platform_support_services_pct: 37, professional_services_pct: 43, software_resale_pct: 0, cloud_consumption_pct: 21, eps_pct: 0, user_count: "N/A" },
        { gross_annual_price: 15000, platform_support_services_pct: 0, professional_services_pct: 20, software_resale_pct: 15, cloud_consumption_pct: 50, eps_pct: 0, user_count: "N/A" },
        { gross_annual_price: 15000, platform_support_services_pct: 0, professional_services_pct: 20, software_resale_pct: 15, cloud_consumption_pct: 50, eps_pct: 0, user_count: "N/A" },
      ),
      status: "live" as const,
    },
    {
      id: "prod-ai-gateway",
      name: "AI Gateway",
      description: "",
      generally_available: "May",
      gross_annual_price: 12000,
      platform_support_services_pct: 0,
      professional_services_pct: 15,
      software_resale_pct: 25,
      cloud_consumption_pct: 40,
      eps_pct: 20,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: sameVariant({ gross_annual_price: 12000, platform_support_services_pct: 0, professional_services_pct: 15, software_resale_pct: 25, cloud_consumption_pct: 40, eps_pct: 20, user_count: "" }),
      status: "live" as const,
    },
    {
      id: "prod-mcp-hub",
      name: "MCP Hub",
      description: "",
      generally_available: "May",
      gross_annual_price: 18000,
      platform_support_services_pct: 0,
      professional_services_pct: 20,
      software_resale_pct: 20,
      cloud_consumption_pct: 40,
      eps_pct: 20,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: sameVariant({ gross_annual_price: 18000, platform_support_services_pct: 0, professional_services_pct: 20, software_resale_pct: 20, cloud_consumption_pct: 40, eps_pct: 20, user_count: "" }),
      status: "live" as const,
    },
    {
      id: "prod-ai-insights",
      name: "AI Insights",
      description: "",
      generally_available: "May",
      gross_annual_price: 20000,
      platform_support_services_pct: 0,
      professional_services_pct: 15,
      software_resale_pct: 20,
      cloud_consumption_pct: 45,
      eps_pct: 20,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: sameVariant({ gross_annual_price: 20000, platform_support_services_pct: 0, professional_services_pct: 15, software_resale_pct: 20, cloud_consumption_pct: 45, eps_pct: 20, user_count: "" }),
      status: "live" as const,
    },
    {
      id: "prod-managed-plane",
      name: "Managed Plane",
      description: "",
      generally_available: "March",
      gross_annual_price: 25000,
      platform_support_services_pct: 0,
      professional_services_pct: 20,
      software_resale_pct: 15,
      cloud_consumption_pct: 50,
      eps_pct: 15,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: sameVariant({ gross_annual_price: 25000, platform_support_services_pct: 0, professional_services_pct: 20, software_resale_pct: 15, cloud_consumption_pct: 50, eps_pct: 15, user_count: "" }),
      status: "live" as const,
    },
    {
      id: "prod-ai-services-ps",
      name: "AI Services (PS)",
      description: "",
      generally_available: "January",
      gross_annual_price: 8000,
      platform_support_services_pct: 0,
      professional_services_pct: 60,
      software_resale_pct: 10,
      cloud_consumption_pct: 15,
      eps_pct: 15,
      user_count: "",
      has_variants: false,
      status: "live" as const,
    },
    {
      id: "prod-developer-portal",
      name: "Developer Portal",
      description: "",
      generally_available: "May",
      gross_annual_price: 8000,
      platform_support_services_pct: 0,
      professional_services_pct: 60,
      software_resale_pct: 10,
      cloud_consumption_pct: 15,
      eps_pct: 15,
      user_count: "",
      has_variants: false,
      status: "live" as const,
    },
    {
      id: "prod-fastshift-migration",
      name: "Fast Shift Migration",
      description: "",
      generally_available: "May",
      gross_annual_price: 8000,
      platform_support_services_pct: 0,
      professional_services_pct: 100,
      software_resale_pct: 0,
      cloud_consumption_pct: 0,
      eps_pct: 0,
      user_count: "",
      has_variants: false,
      status: "live" as const,
    },
  ];

  const margins: Margins = {
    professional_services_margin_pct: 45,
    software_resale_margin_pct: 20,
    cloud_consumption_margin_pct: 30,
    epss_margin_pct: 55,
  };

  const salesMotionByProductId: AppState["salesMotionByProductId"] = {
    "prod-mcp-server": {
      sales_cycle_months: 3,
      opp_to_close_win_rate_pct: 25,
      prospect_to_opp_rate_pct: 15,
      prospecting_lead_time_months: 1,
    },
    "prod-ai-gateway": {
      sales_cycle_months: 3,
      opp_to_close_win_rate_pct: 25,
      prospect_to_opp_rate_pct: 15,
      prospecting_lead_time_months: 1,
    },
    "prod-mcp-hub": {
      sales_cycle_months: 3,
      opp_to_close_win_rate_pct: 25,
      prospect_to_opp_rate_pct: 15,
      prospecting_lead_time_months: 1,
    },
    "prod-ai-insights": {
      sales_cycle_months: 3,
      opp_to_close_win_rate_pct: 25,
      prospect_to_opp_rate_pct: 15,
      prospecting_lead_time_months: 1,
    },
    "prod-managed-plane": {
      sales_cycle_months: 4,
      opp_to_close_win_rate_pct: 20,
      prospect_to_opp_rate_pct: 12,
      prospecting_lead_time_months: 1,
    },
    "prod-ai-services-ps": {
      sales_cycle_months: 2,
      opp_to_close_win_rate_pct: 30,
      prospect_to_opp_rate_pct: 20,
      prospecting_lead_time_months: 1,
    },
    "prod-developer-portal": {
      sales_cycle_months: 2,
      opp_to_close_win_rate_pct: 30,
      prospect_to_opp_rate_pct: 20,
      prospecting_lead_time_months: 1,
    },
    "prod-fastshift-migration": {
      sales_cycle_months: 3,
      opp_to_close_win_rate_pct: 25,
      prospect_to_opp_rate_pct: 15,
      prospecting_lead_time_months: 1,
    },
  };

  const industryAverages: AppState["industryAverages"] = {
    sales_cycle_months: 3,
    opp_to_close_win_rate_pct: 20,
    prospect_to_opp_rate_pct: 15,
    prospecting_lead_time_months: 1,
  };

  const pipelineContribution: PipelineContribution = {
    mode: "pct",
    website_inbound: 25,
    sales_team_generated: 30,
    event_sourced: 15,
    abm_thought_leadership: 15,
    partner_referral: 15,
  };

  const forecastByProductIdMonth: AppState["forecastByProductIdMonth"] = {};

  return {
    products,
    margins,
    industryAverages,
    pipelineContribution,
    salesMotionByProductId,
    forecastByProductIdMonth,
  };
}
