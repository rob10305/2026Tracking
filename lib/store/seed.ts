import type { AppState, Margins, PipelineContribution } from "@/lib/models/types";

export function createSeedData(): AppState {
  const products = [
    {
      id: "prod-managed-cloud",
      name: "Managed Cloud Platform",
      description: "Fully managed cloud infrastructure with 24/7 support",
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
      id: "prod-devops-accelerator",
      name: "DevOps Accelerator",
      description: "CI/CD pipeline setup and DevOps toolchain implementation",
      gross_unit_price: 8500,
      default_discount_pct: 5,
      component_mix_mode: "pct" as const,
      professional_services_pct: 45,
      software_resale_pct: 25,
      cloud_consumption_pct: 15,
      epss_pct: 15,
      status: "live" as const,
    },
    {
      id: "prod-security-suite",
      name: "Enterprise Security Suite",
      description: "Cloud security posture management and compliance automation",
      gross_unit_price: 22000,
      default_discount_pct: 12,
      component_mix_mode: "pct" as const,
      professional_services_pct: 25,
      software_resale_pct: 35,
      cloud_consumption_pct: 20,
      epss_pct: 20,
      status: "in_development" as const,
      readiness: {
        mvp_date: "2026-04-01",
        release_date: "2026-07-01",
        prospecting: false,
        website_content: false,
        pricing: true,
        sales_collateral: false,
      },
    },
  ];

  const margins: Margins = {
    professional_services_margin_pct: 45,
    software_resale_margin_pct: 20,
    cloud_consumption_margin_pct: 30,
    epss_margin_pct: 55,
  };

  const salesMotionByProductId: AppState["salesMotionByProductId"] = {
    "prod-managed-cloud": {
      sales_cycle_months: 3,
      opp_to_close_win_rate_pct: 25,
      prospect_to_opp_rate_pct: 15,
      prospecting_lead_time_months: 1,
    },
    "prod-devops-accelerator": {
      sales_cycle_months: 2,
      opp_to_close_win_rate_pct: 30,
      prospect_to_opp_rate_pct: 20,
      prospecting_lead_time_months: 1,
    },
    "prod-security-suite": {
      sales_cycle_months: 4,
      opp_to_close_win_rate_pct: 20,
      prospect_to_opp_rate_pct: 12,
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
    website_inbound: 30,
    sales_team_generated: 35,
    event_sourced: 20,
    abm_thought_leadership: 15,
  };

  // Seed some forecast data for Q1/Q2
  const forecastByProductIdMonth: AppState["forecastByProductIdMonth"] = {
    "prod-managed-cloud::2026-01": 2,
    "prod-managed-cloud::2026-02": 3,
    "prod-managed-cloud::2026-03": 3,
    "prod-managed-cloud::2026-04": 4,
    "prod-managed-cloud::2026-05": 4,
    "prod-managed-cloud::2026-06": 5,
    "prod-managed-cloud::2026-07": 5,
    "prod-managed-cloud::2026-08": 6,
    "prod-managed-cloud::2026-09": 6,
    "prod-managed-cloud::2026-10": 7,
    "prod-managed-cloud::2026-11": 7,
    "prod-managed-cloud::2026-12": 8,
    "prod-devops-accelerator::2026-01": 3,
    "prod-devops-accelerator::2026-02": 3,
    "prod-devops-accelerator::2026-03": 4,
    "prod-devops-accelerator::2026-04": 5,
    "prod-devops-accelerator::2026-05": 5,
    "prod-devops-accelerator::2026-06": 6,
    "prod-devops-accelerator::2026-07": 6,
    "prod-devops-accelerator::2026-08": 7,
    "prod-devops-accelerator::2026-09": 7,
    "prod-devops-accelerator::2026-10": 8,
    "prod-devops-accelerator::2026-11": 8,
    "prod-devops-accelerator::2026-12": 10,
    "prod-security-suite::2026-01": 1,
    "prod-security-suite::2026-02": 1,
    "prod-security-suite::2026-03": 2,
    "prod-security-suite::2026-04": 2,
    "prod-security-suite::2026-05": 2,
    "prod-security-suite::2026-06": 3,
    "prod-security-suite::2026-07": 3,
    "prod-security-suite::2026-08": 3,
    "prod-security-suite::2026-09": 4,
    "prod-security-suite::2026-10": 4,
    "prod-security-suite::2026-11": 4,
    "prod-security-suite::2026-12": 5,
  };

  return {
    products,
    margins,
    industryAverages,
    pipelineContribution,
    salesMotionByProductId,
    forecastByProductIdMonth,
  };
}
