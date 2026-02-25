"use client";

import React, { useMemo, useState } from "react";
import { useStore } from "@/lib/store/context";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";
import { MONTHS_2026, MONTH_LABELS, forecastKey, variantForecastKey } from "@/lib/models/types";
import type { WorkbackRow, ProductVariant } from "@/lib/models/types";
import { calcWorkbackRow, formatMonth } from "@/lib/calc/workback";
import { ChevronDown } from "lucide-react";

const VARIANTS: ProductVariant[] = ["small", "medium", "large"];

function monthToQuarter(m: string): string {
  const month = parseInt(m.split("-")[1], 10);
  if (month <= 3) return "Q1";
  if (month <= 6) return "Q2";
  if (month <= 9) return "Q3";
  return "Q4";
}

export default function WorkbackPage() {
  const { state } = useStore();
  const { forecasts, isLoaded: fcLoaded } = useSavedForecasts();
  const [selectedForecastId, setSelectedForecastId] = useState<string>("default");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(state.products.map((p) => p.id))
  );
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set(["Q1", "Q2", "Q3", "Q4"]));

  const toggleQuarter = (q: string) => {
    setExpandedQuarters((prev) => {
      const next = new Set(prev);
      if (next.has(q)) next.delete(q);
      else next.add(q);
      return next;
    });
  };

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedProductIds(new Set(state.products.map((p) => p.id)));
  const selectNone = () => setSelectedProductIds(new Set());

  const quantities = useMemo(() => {
    if (selectedForecastId === "default") {
      return state.forecastByProductIdMonth;
    }
    const fc = forecasts.find((f) => f.id === selectedForecastId);
    return fc?.quantities ?? {};
  }, [selectedForecastId, state.forecastByProductIdMonth, forecasts]);

  const rows = useMemo(() => {
    const result: WorkbackRow[] = [];
    for (const p of state.products) {
      if (!selectedProductIds.has(p.id)) continue;
      const motion = state.salesMotionByProductId[p.id];
      if (!motion) continue;
      for (const m of MONTHS_2026) {
        let qty = 0;
        if (p.has_variants) {
          for (const v of VARIANTS) qty += quantities[variantForecastKey(p.id, v, m)] ?? 0;
        } else {
          qty = quantities[forecastKey(p.id, m)] ?? 0;
        }
        if (qty === 0) continue;
        result.push(calcWorkbackRow(p.id, p.name, m, qty, motion));
      }
    }
    return result;
  }, [state.products, state.salesMotionByProductId, quantities, selectedProductIds]);

  const groupedByQuarter = useMemo(() => {
    const map = new Map<string, WorkbackRow[]>();
    for (const q of ["Q1", "Q2", "Q3", "Q4"]) map.set(q, []);
    for (const r of rows) {
      const q = monthToQuarter(r.close_month);
      map.get(q)!.push(r);
    }
    return map;
  }, [rows]);

  const quarterTotals = useMemo(() => {
    const totals: Record<string, { deals: number; opps: number; prospects: number }> = {};
    for (const [q, qRows] of groupedByQuarter) {
      totals[q] = {
        deals: qRows.reduce((s, r) => s + r.deals_needed, 0),
        opps: qRows.reduce((s, r) => s + r.opps_needed, 0),
        prospects: qRows.reduce((s, r) => s + r.prospects_needed, 0),
      };
    }
    return totals;
  }, [groupedByQuarter]);

  if (!fcLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workback Plan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pipeline requirements by fiscal quarter, product, and forecast model.
          </p>
        </div>
        <select
          value={selectedForecastId}
          onChange={(e) => setSelectedForecastId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="default">Default Forecast</option>
          {forecasts.map((fc) => (
            <option key={fc.id} value={fc.id}>{fc.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Products</span>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs text-blue-600 hover:text-blue-800">Select All</button>
            <span className="text-gray-300">|</span>
            <button onClick={selectNone} className="text-xs text-blue-600 hover:text-blue-800">Clear All</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.products.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleProduct(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedProductIds.has(p.id)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {selectedProductIds.size === 1 && (() => {
        const pid = [...selectedProductIds][0];
        const motion = state.salesMotionByProductId[pid];
        if (!motion) return null;
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <span className="font-semibold">Assumptions:</span>{" "}
            Sales cycle {motion.sales_cycle_months}mo, win rate{" "}
            {motion.opp_to_close_win_rate_pct}%, prospect→opp{" "}
            {motion.prospect_to_opp_rate_pct}%, lead time to close{" "}
            {motion.prospecting_lead_time_months}mo
          </div>
        );
      })()}

      {["Q1", "Q2", "Q3", "Q4"].map((q) => {
        const qRows = groupedByQuarter.get(q) ?? [];
        const totals = quarterTotals[q];
        return (
          <div key={q} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleQuarter(q)}
              className="w-full bg-gray-50 px-4 py-3 border-b flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedQuarters.has(q) ? "rotate-0" : "-rotate-90"}`} />
                <h3 className="font-semibold text-gray-800">{q} FY2026</h3>
              </div>
              {qRows.length > 0 && (
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Deals: <span className="font-semibold text-gray-700">{totals.deals.toLocaleString()}</span></span>
                  <span>Opps: <span className="font-semibold text-gray-700">{totals.opps.toLocaleString()}</span></span>
                  <span>Prospects: <span className="font-semibold text-gray-700">{totals.prospects.toLocaleString()}</span></span>
                </div>
              )}
            </button>
            {expandedQuarters.has(q) && <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="px-4 py-2 font-medium">Product</th>
                  <th className="px-4 py-2 font-medium">Fiscal Quarter</th>
                  <th className="px-4 py-2 font-medium">Close Month</th>
                  <th className="px-4 py-2 font-medium text-right">Deals</th>
                  <th className="px-4 py-2 font-medium text-right">Opps Needed</th>
                  <th className="px-4 py-2 font-medium text-right">Prospects Needed</th>
                  <th className="px-4 py-2 font-medium">Pipeline Month</th>
                  <th className="px-4 py-2 font-medium">Prospecting Start</th>
                </tr>
              </thead>
              <tbody>
                {qRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                      No data for {q}
                    </td>
                  </tr>
                ) : (
                  qRows.map((r, i) => {
                    const pipelineBefore2026 = r.pipeline_month < "2026-01";
                    const prospectBefore2026 = r.prospecting_start_month < "2026-01";
                    return (
                      <tr
                        key={`${r.product_id}-${r.close_month}`}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                      >
                        <td className="px-4 py-2 font-medium text-gray-800">{r.product_name}</td>
                        <td className="px-4 py-2">{q}</td>
                        <td className="px-4 py-2">{formatMonth(r.close_month)}</td>
                        <td className="px-4 py-2 text-right">{r.deals_needed}</td>
                        <td className="px-4 py-2 text-right">{r.opps_needed}</td>
                        <td className="px-4 py-2 text-right">{r.prospects_needed}</td>
                        <td className={`px-4 py-2 ${pipelineBefore2026 ? "text-orange-600 italic" : ""}`}>
                          {formatMonth(r.pipeline_month)}
                          {pipelineBefore2026 && <span className="text-xs ml-1">(pre-FY)</span>}
                        </td>
                        <td className={`px-4 py-2 ${prospectBefore2026 ? "text-orange-600 italic" : ""}`}>
                          {formatMonth(r.prospecting_start_month)}
                          {prospectBefore2026 && <span className="text-xs ml-1">(pre-FY)</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>}
          </div>
        );
      })}
    </div>
  );
}
