import type {
  AppState,
} from "@/lib/models/types";
import { forecastKey, MONTH_LABELS } from "@/lib/models/types";
import { calcFullRevenue } from "./revenue";
import { calcWorkbackRow } from "./workback";
import { formatMonth } from "./workback";

const MONTHS: readonly string[] = [
  "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
  "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12",
];

function escapeCSV(val: string | number): string {
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(cells: (string | number)[]): string {
  return cells.map(escapeCSV).join(",");
}

export function exportForecastCSV(state: AppState): string {
  const header = ["Product", ...MONTH_LABELS, "Total"];
  const lines = [row(header)];

  for (const p of state.products) {
    let total = 0;
    const cells: (string | number)[] = [p.name];
    for (const m of MONTHS) {
      const qty = state.forecastByProductIdMonth[forecastKey(p.id, m)] ?? 0;
      total += qty;
      cells.push(qty);
    }
    cells.push(total);
    lines.push(row(cells));
  }

  return lines.join("\n");
}

export function exportSummaryCSV(state: AppState): string {
  const header = [
    "Month",
    "Total Gross Revenue",
    "Total Net Revenue",
    "Total Gross GP$",
    "Total Net GP$",
    "Gross Margin %",
    "Net Margin %",
  ];
  const lines = [row(header)];

  for (let i = 0; i < MONTHS.length; i++) {
    const m = MONTHS[i];
    let totalGross = 0;
    let totalNet = 0;
    let totalGrossGP = 0;
    let totalNetGP = 0;

    for (const p of state.products) {
      const qty = state.forecastByProductIdMonth[forecastKey(p.id, m)] ?? 0;
      if (qty === 0) continue;
      const r = calcFullRevenue(p, state.margins, qty);
      totalGross += r.gross_revenue;
      totalNet += r.net_revenue;
      totalGrossGP += r.total_gross_gp;
      totalNetGP += r.total_net_gp;
    }

    const grossMargin = totalGross > 0 ? (totalGrossGP / totalGross) * 100 : 0;
    const netMargin = totalNet > 0 ? (totalNetGP / totalNet) * 100 : 0;

    lines.push(
      row([
        MONTH_LABELS[i],
        totalGross.toFixed(2),
        totalNet.toFixed(2),
        totalGrossGP.toFixed(2),
        totalNetGP.toFixed(2),
        grossMargin.toFixed(1),
        netMargin.toFixed(1),
      ]),
    );
  }

  return lines.join("\n");
}

export function exportWorkbackCSV(state: AppState): string {
  const header = [
    "Product",
    "Close Month",
    "Deals Needed",
    "Opps Needed",
    "Prospects Needed",
    "Pipeline Month",
    "Prospecting Start",
  ];
  const lines = [row(header)];

  for (const p of state.products) {
    const motion = state.salesMotionByProductId[p.id];
    if (!motion) continue;
    for (const m of MONTHS) {
      const qty = state.forecastByProductIdMonth[forecastKey(p.id, m)] ?? 0;
      if (qty === 0) continue;
      const wb = calcWorkbackRow(p.id, p.name, m, qty, motion);
      lines.push(
        row([
          p.name,
          formatMonth(wb.close_month),
          wb.deals_needed,
          wb.opps_needed,
          wb.prospects_needed,
          formatMonth(wb.pipeline_month),
          formatMonth(wb.prospecting_start_month),
        ]),
      );
    }
  }

  return lines.join("\n");
}
