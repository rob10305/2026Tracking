import type { AppState, Margins, PipelineContribution, VariantPricing } from "@/lib/models/types";

function makeVariants(
  s: VariantPricing,
  m: VariantPricing,
  l: VariantPricing,
): Record<"small" | "medium" | "large", VariantPricing> {
  return { small: s, medium: m, large: l };
}

function zeroVariant(): VariantPricing {
  return { gross_annual_price: 0, platform_support_services_pct: 0, professional_services_pct: 0, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 0, user_count: "" };
}

export function createSeedData(): AppState {
  const products = [
    {
      id: "prod-mcp-server",
      name: "MCP Server",
      description: "Supports single MCP server",
      generally_available: "April",
      gross_annual_price: 40900,
      platform_support_services_pct: 0,
      professional_services_pct: 43,
      software_resale_pct: 0,
      cloud_consumption_pct: 20,
      pss_pct: 37,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: makeVariants(
        { gross_annual_price: 40900, platform_support_services_pct: 0, professional_services_pct: 43, software_resale_pct: 0, cloud_consumption_pct: 20, pss_pct: 37, user_count: "Supports single MCP server" },
        { gross_annual_price: 62700, platform_support_services_pct: 35, professional_services_pct: 28, software_resale_pct: 0, cloud_consumption_pct: 13, pss_pct: 24, user_count: "Supports 2-5 MCP Servers" },
        { gross_annual_price: 80900, platform_support_services_pct: 49, professional_services_pct: 22, software_resale_pct: 0, cloud_consumption_pct: 10, pss_pct: 19, user_count: "Supports 6-10 MCP Servers" },
      ),
      status: "live" as const,
    },
    {
      id: "prod-ai-gateway",
      name: "AI Gateway",
      description: "Foundation Features",
      generally_available: "May",
      gross_annual_price: 28000,
      platform_support_services_pct: 0,
      professional_services_pct: 36,
      software_resale_pct: 0,
      cloud_consumption_pct: 0,
      pss_pct: 64,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: makeVariants(
        { gross_annual_price: 28000, platform_support_services_pct: 0, professional_services_pct: 36, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 64, user_count: "Foundation Features" },
        { gross_annual_price: 40000, platform_support_services_pct: 0, professional_services_pct: 25, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 75, user_count: "Professional Features" },
        { gross_annual_price: 70000, platform_support_services_pct: 0, professional_services_pct: 14, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 86, user_count: "Enterprise Features" },
      ),
      status: "live" as const,
    },
    {
      id: "prod-mcp-hub",
      name: "MCP Hub",
      description: "",
      generally_available: "July",
      gross_annual_price: 0,
      platform_support_services_pct: 0,
      professional_services_pct: 0,
      software_resale_pct: 0,
      cloud_consumption_pct: 0,
      pss_pct: 0,
      user_count: "",
      has_variants: true,
      selected_variant: "medium" as const,
      variants: makeVariants(
        { ...zeroVariant(), user_count: "N/A - there is no small" },
        { gross_annual_price: 40000, platform_support_services_pct: 0, professional_services_pct: 25, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 75, user_count: "6-10 MCP Servers + Pro features (Requires MCP Server (M))" },
        { gross_annual_price: 70000, platform_support_services_pct: 0, professional_services_pct: 14, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 86, user_count: "10+ MCP Servers + Enterprise Features (Requires MCP Server (L))" },
      ),
      status: "live" as const,
    },
    {
      id: "prod-ai-insights",
      name: "AI Insights",
      description: "This is part of the AI Gateway",
      generally_available: "May",
      gross_annual_price: 0,
      platform_support_services_pct: 0,
      professional_services_pct: 0,
      software_resale_pct: 0,
      cloud_consumption_pct: 0,
      pss_pct: 0,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: makeVariants(
        { ...zeroVariant(), user_count: "This is part of the AI Gateway" },
        { ...zeroVariant(), user_count: "This is part of the AI Gateway" },
        { ...zeroVariant(), user_count: "This is part of the AI Gateway" },
      ),
      status: "live" as const,
    },
    {
      id: "prod-managed-plane",
      name: "Managed Plane",
      description: "<100 users",
      generally_available: "March",
      gross_annual_price: 63000,
      platform_support_services_pct: 0,
      professional_services_pct: 24,
      software_resale_pct: 0,
      cloud_consumption_pct: 28,
      pss_pct: 48,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: makeVariants(
        { gross_annual_price: 63000, platform_support_services_pct: 0, professional_services_pct: 24, software_resale_pct: 0, cloud_consumption_pct: 28, pss_pct: 48, user_count: "<100 users" },
        { gross_annual_price: 87000, platform_support_services_pct: 0, professional_services_pct: 17, software_resale_pct: 0, cloud_consumption_pct: 35, pss_pct: 48, user_count: "100-500 users" },
        { gross_annual_price: 111000, platform_support_services_pct: 0, professional_services_pct: 14, software_resale_pct: 0, cloud_consumption_pct: 38, pss_pct: 48, user_count: "500-1000 users" },
      ),
      status: "live" as const,
    },
    {
      id: "prod-ai-services-ps",
      name: "AI Services (PS)",
      description: "PS Packages",
      generally_available: "January",
      gross_annual_price: 10000,
      platform_support_services_pct: 0,
      professional_services_pct: 100,
      software_resale_pct: 0,
      cloud_consumption_pct: 0,
      pss_pct: 0,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: makeVariants(
        { gross_annual_price: 10000, platform_support_services_pct: 0, professional_services_pct: 100, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 0, user_count: "PS Packages" },
        { gross_annual_price: 25000, platform_support_services_pct: 0, professional_services_pct: 100, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 0, user_count: "PS Packages" },
        { gross_annual_price: 50000, platform_support_services_pct: 0, professional_services_pct: 100, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 0, user_count: "PS Packages" },
      ),
      status: "live" as const,
    },
    {
      id: "prod-developer-portal",
      name: "Developer Portal",
      description: "",
      generally_available: "May",
      gross_annual_price: 0,
      platform_support_services_pct: 0,
      professional_services_pct: 0,
      software_resale_pct: 0,
      cloud_consumption_pct: 0,
      pss_pct: 0,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: makeVariants(
        zeroVariant(),
        zeroVariant(),
        zeroVariant(),
      ),
      status: "live" as const,
    },
    {
      id: "prod-fastshift-migration",
      name: "Fast Shift Migration",
      description: "Up to X1 Workspaces and X2 Users",
      generally_available: "May",
      gross_annual_price: 25000,
      platform_support_services_pct: 0,
      professional_services_pct: 100,
      software_resale_pct: 0,
      cloud_consumption_pct: 0,
      pss_pct: 0,
      user_count: "",
      has_variants: true,
      selected_variant: "small" as const,
      variants: makeVariants(
        { gross_annual_price: 25000, platform_support_services_pct: 0, professional_services_pct: 100, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 0, user_count: "Up to X1 Workspaces and X2 Users" },
        { gross_annual_price: 50000, platform_support_services_pct: 0, professional_services_pct: 100, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 0, user_count: "Up to Y1 Workspaces and Y1 Users" },
        { gross_annual_price: 100000, platform_support_services_pct: 0, professional_services_pct: 100, software_resale_pct: 0, cloud_consumption_pct: 0, pss_pct: 0, user_count: "Up to Z1 Workspaces and Z1 Users" },
      ),
      status: "live" as const,
    },
  ];

  const margins: Margins = {
    professional_services_margin_pct: 45,
    software_resale_margin_pct: 20,
    cloud_consumption_margin_pct: 30,
    pss_margin_pct: 55,
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
