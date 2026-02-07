"use client";

import React, { useMemo, useState } from "react";
import { useStore } from "@/lib/store/context";
import { MONTHS_2026, MONTH_LABELS, forecastKey } from "@/lib/models/types";
import type { WorkbackRow } from "@/lib/models/types";
import { calcWorkbackRow, formatMonth } from "@/lib/calc/workback";

export default function WorkbackPage() {
  const { state } = useStore();
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");

  const rows = useMemo(() => {
    const result: WorkbackRow[] = [];
    for (const p of state.products) {
      const motion = state.salesMotionByProductId[p.id];
      if (!motion) continue;
      for (const m of MONTHS_2026) {
        const qty =
          state.forecastByProductIdMonth[forecastKey(p.id, m)] ?? 0;
        if (qty === 0) continue;
        result.push(calcWorkbackRow(p.id, p.name, m, qty, motion));
      }
    }
    return result;
  }, [state]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterProduct !== "all" && r.product_id !== filterProduct)
        return false;
      if (filterMonth !== "all" && r.close_month !== filterMonth) return false;
      return true;
    });
  }, [rows, filterProduct, filterMonth]);

  // Show assumptions for selected product
  const selectedMotion =
    filterProduct !== "all"
      ? state.salesMotionByProductId[filterProduct]
      : null;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Workback Plan</h1>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <label className="text-sm">
          <span className="text-gray-600 mr-1">Product:</span>
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">All Products</option>
            {state.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 mr-1">Close Month:</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">All Months</option>
            {MONTHS_2026.map((m, i) => (
              <option key={m} value={m}>
                {MONTH_LABELS[i]} 2026
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Assumptions panel */}
      {selectedMotion && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <span className="font-semibold">Assumptions:</span>{" "}
          Sales cycle {selectedMotion.sales_cycle_months}mo, buffer{" "}
          {selectedMotion.buffer_months}mo, win rate{" "}
          {selectedMotion.opp_to_close_win_rate_pct}%, prospect→opp{" "}
          {selectedMotion.prospect_to_opp_rate_pct}%, prospecting lead{" "}
          {selectedMotion.prospecting_lead_time_months}mo
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left">
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Close Month</th>
              <th className="px-3 py-2 font-medium text-right">Deals</th>
              <th className="px-3 py-2 font-medium text-right">Opps Needed</th>
              <th className="px-3 py-2 font-medium text-right">
                Prospects Needed
              </th>
              <th className="px-3 py-2 font-medium">Pipeline Month</th>
              <th className="px-3 py-2 font-medium">Prospecting Start</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                  No workback data. Enter forecast quantities first.
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => {
                const pipelineBefore2026 = r.pipeline_month < "2026-01";
                const prospectBefore2026 =
                  r.prospecting_start_month < "2026-01";
                return (
                  <tr
                    key={`${r.product_id}-${r.close_month}`}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2">{r.product_name}</td>
                    <td className="px-3 py-2">
                      {formatMonth(r.close_month)}
                    </td>
                    <td className="px-3 py-2 text-right">{r.deals_needed}</td>
                    <td className="px-3 py-2 text-right">{r.opps_needed}</td>
                    <td className="px-3 py-2 text-right">
                      {r.prospects_needed}
                    </td>
                    <td
                      className={`px-3 py-2 ${pipelineBefore2026 ? "text-orange-600 italic" : ""}`}
                    >
                      {formatMonth(r.pipeline_month)}
                      {pipelineBefore2026 && (
                        <span className="text-xs ml-1">(pre-FY)</span>
                      )}
                    </td>
                    <td
                      className={`px-3 py-2 ${prospectBefore2026 ? "text-orange-600 italic" : ""}`}
                    >
                      {formatMonth(r.prospecting_start_month)}
                      {prospectBefore2026 && (
                        <span className="text-xs ml-1">(pre-FY)</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
