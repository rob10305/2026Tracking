import type { SalesMotion, WorkbackRow } from "@/lib/models/types";

/**
 * Offset a "YYYY-MM" string by N months (can be negative).
 * Returns "YYYY-MM" — works across year boundaries.
 */
export function offsetMonth(yearMonth: string, offsetMonths: number): string {
  const [y, m] = yearMonth.split("-").map(Number);
  // Convert to 0-indexed month for arithmetic
  const totalMonths = y * 12 + (m - 1) + offsetMonths;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = (totalMonths % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, "0")}`;
}

/**
 * Format "YYYY-MM" to "Mon YYYY" (e.g., "2026-01" → "Jan 2026")
 */
export function formatMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const labels = [
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
  ];
  return `${labels[m - 1]} ${y}`;
}

export function calcOppsNeeded(
  dealsNeeded: number,
  winRatePct: number,
): number {
  if (winRatePct <= 0) return 0;
  return Math.ceil(dealsNeeded / (winRatePct / 100));
}

export function calcProspectsNeeded(
  oppsNeeded: number,
  prospectToOppPct: number,
): number {
  if (prospectToOppPct <= 0) return 0;
  return Math.ceil(oppsNeeded / (prospectToOppPct / 100));
}

export function calcPipelineMonth(
  closeMonth: string,
  salesCycleMonths: number,
  bufferMonths: number,
): string {
  return offsetMonth(closeMonth, -(salesCycleMonths + bufferMonths));
}

export function calcProspectingStartMonth(
  pipelineMonth: string,
  prospectingLeadTimeMonths: number,
): string {
  return offsetMonth(pipelineMonth, -prospectingLeadTimeMonths);
}

export function calcWorkbackRow(
  productId: string,
  productName: string,
  closeMonth: string,
  dealsNeeded: number,
  motion: SalesMotion,
): WorkbackRow {
  const opps_needed = calcOppsNeeded(
    dealsNeeded,
    motion.opp_to_close_win_rate_pct,
  );
  const prospects_needed = calcProspectsNeeded(
    opps_needed,
    motion.prospect_to_opp_rate_pct,
  );
  const pipeline_month = calcPipelineMonth(
    closeMonth,
    motion.sales_cycle_months,
    motion.buffer_months,
  );
  const prospecting_start_month = calcProspectingStartMonth(
    pipeline_month,
    motion.prospecting_lead_time_months,
  );

  return {
    product_id: productId,
    product_name: productName,
    close_month: closeMonth,
    deals_needed: dealsNeeded,
    opps_needed,
    prospects_needed,
    pipeline_month,
    prospecting_start_month,
  };
}
