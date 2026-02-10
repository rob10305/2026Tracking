import type { AppState, Margins, PipelineContribution } from "@/lib/models/types";

export function createSeedData(): AppState {
  const products = [
    {
      id: "prod-mcp-server",
      name: "MCP Server",
      description: "",
      gross_unit_price: 15000,
      default_discount_pct: 10,
      component_mix_mode: "pct" as const,
      professional_services_pct: 20,
      software_resale_pct: 15,
      cloud_consumption_pct: 50,
      epss_pct: 15,
      status: "live" as const,
    },
    {
      id: "prod-ai-gateway",
      name: "AI Gateway",
      description: "",
      gross_unit_price: 12000,
      default_discount_pct: 10,
      component_mix_mode: "pct" as const,
      professional_services_pct: 15,
      software_resale_pct: 25,
      cloud_consumption_pct: 40,
      epss_pct: 20,
      status: "live" as const,
    },
    {
      id: "prod-mcp-hub",
      name: "MCP Hub",
      description: "",
      gross_unit_price: 18000,
      default_discount_pct: 10,
      component_mix_mode: "pct" as const,
      professional_services_pct: 20,
      software_resale_pct: 20,
      cloud_consumption_pct: 40,
      epss_pct: 20,
      status: "live" as const,
    },
    {
      id: "prod-developer-portal",
      name: "Developer Portal",
      description: "",
      gross_unit_price: 10000,
      default_discount_pct: 5,
      component_mix_mode: "pct" as const,
      professional_services_pct: 30,
      software_resale_pct: 30,
      cloud_consumption_pct: 20,
      epss_pct: 20,
      status: "live" as const,
    },
    {
      id: "prod-ai-insights",
      name: "AI Insights",
      description: "",
      gross_unit_price: 20000,
      default_discount_pct: 10,
      component_mix_mode: "pct" as const,
      professional_services_pct: 15,
      software_resale_pct: 20,
      cloud_consumption_pct: 45,
      epss_pct: 20,
      status: "live" as const,
    },
    {
      id: "prod-managed-plane",
      name: "Managed Plane",
      description: "",
      gross_unit_price: 25000,
      default_discount_pct: 12,
      component_mix_mode: "pct" as const,
      professional_services_pct: 20,
      software_resale_pct: 15,
      cloud_consumption_pct: 50,
      epss_pct: 15,
      status: "live" as const,
    },
    {
      id: "prod-fastshift-migration",
      name: "FastShift Migration",
      description: "",
      gross_unit_price: 30000,
      default_discount_pct: 10,
      component_mix_mode: "pct" as const,
      professional_services_pct: 45,
      software_resale_pct: 15,
      cloud_consumption_pct: 25,
      epss_pct: 15,
      status: "live" as const,
    },
    {
      id: "prod-ai-services-ps",
      name: "AI Services (PS)",
      description: "",
      gross_unit_price: 8000,
      default_discount_pct: 5,
      component_mix_mode: "pct" as const,
      professional_services_pct: 60,
      software_resale_pct: 10,
      cloud_consumption_pct: 15,
      epss_pct: 15,
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
    "prod-developer-portal": {
      sales_cycle_months: 2,
      opp_to_close_win_rate_pct: 30,
      prospect_to_opp_rate_pct: 20,
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
    "prod-fastshift-migration": {
      sales_cycle_months: 3,
      opp_to_close_win_rate_pct: 25,
      prospect_to_opp_rate_pct: 15,
      prospecting_lead_time_months: 1,
    },
    "prod-ai-services-ps": {
      sales_cycle_months: 2,
      opp_to_close_win_rate_pct: 30,
      prospect_to_opp_rate_pct: 20,
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
