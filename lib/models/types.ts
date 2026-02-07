// ── Core domain types ──

export type ComponentMixMode = "pct" | "dollar";

export interface Product {
  id: string;
  name: string;
  description: string;
  gross_unit_price: number;
  default_discount_pct: number;
  component_mix_mode: ComponentMixMode;
  professional_services_pct: number;
  software_resale_pct: number;
  cloud_consumption_pct: number;
  epss_pct: number;
}

export interface Margins {
  professional_services_margin_pct: number;
  software_resale_margin_pct: number;
  cloud_consumption_margin_pct: number;
  epss_margin_pct: number;
}

export interface SalesMotion {
  sales_cycle_months: number;
  opp_to_close_win_rate_pct: number;
  prospect_to_opp_rate_pct: number;
  prospecting_lead_time_months: number;
}

export type PipelineContributionMode = "pct" | "num";

export interface PipelineContribution {
  mode: PipelineContributionMode;
  website_inbound: number;
  sales_team_generated: number;
  event_sourced: number;
  abm_thought_leadership: number;
}

/** Map of "productId::YYYY-MM" → quantity */
export type ForecastMap = Record<string, number>;

export interface AppState {
  products: Product[];
  margins: Margins;
  industryAverages: SalesMotion;
  pipelineContribution: PipelineContribution;
  salesMotionByProductId: Record<string, SalesMotion>;
  forecastByProductIdMonth: ForecastMap;
}

// ── Calculation result types ──

export type RevenueMode = "net" | "gross";

export interface ComponentBreakdown {
  professional_services: number;
  software_resale: number;
  cloud_consumption: number;
  epss: number;
}

export interface RevenueResult {
  gross_revenue: number;
  net_revenue: number;
  net_unit_price: number;
  gross_components: ComponentBreakdown;
  net_components: ComponentBreakdown;
  gross_gp: ComponentBreakdown;
  net_gp: ComponentBreakdown;
  total_gross_gp: number;
  total_net_gp: number;
  gross_margin_pct: number;
  net_margin_pct: number;
}

export interface WorkbackRow {
  product_id: string;
  product_name: string;
  close_month: string; // "YYYY-MM"
  deals_needed: number;
  opps_needed: number;
  prospects_needed: number;
  pipeline_month: string; // "YYYY-MM"
  prospecting_start_month: string; // "YYYY-MM"
}

// ── Month helpers ──

export const MONTHS_2026 = [
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
] as const;

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type Month2026 = (typeof MONTHS_2026)[number];

export function forecastKey(productId: string, month: string): string {
  return `${productId}::${month}`;
}
