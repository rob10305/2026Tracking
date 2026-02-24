"use client";

import React, { useMemo, useState } from "react";
import { useStore } from "@/lib/store/context";
import {
  MONTHS_2026,
  MONTH_LABELS,
  forecastKey,
} from "@/lib/models/types";
import type { RevenueMode } from "@/lib/models/types";
import { calcFullRevenue } from "@/lib/calc/revenue";

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export default function SummaryPage() {
  const { state } = useStore();
  const [mode, setMode] = useState<RevenueMode>("net");

  // Monthly summary
  const monthlySummary = useMemo(() => {
    return MONTHS_2026.map((m) => {
      let grossRev = 0;
      let netRev = 0;
      let grossGP = 0;
      let netGP = 0;

      for (const p of state.products) {
        const qty =
          state.forecastByProductIdMonth[forecastKey(p.id, m)] ?? 0;
        if (qty === 0) continue;
        const r = calcFullRevenue(p, state.margins, qty);
        grossRev += r.gross_revenue;
        netRev += r.net_revenue;
        grossGP += r.total_gross_gp;
        netGP += r.total_net_gp;
      }

      return {
        grossRev,
        netRev,
        grossGP,
        netGP,
        grossMargin: grossRev > 0 ? (grossGP / grossRev) * 100 : 0,
        netMargin: netRev > 0 ? (netGP / netRev) * 100 : 0,
      };
    });
  }, [state]);

  // Product annual summary
  const productSummary = useMemo(() => {
    return state.products.map((p) => {
      let totalQty = 0;
      for (const m of MONTHS_2026) {
        totalQty +=
          state.forecastByProductIdMonth[forecastKey(p.id, m)] ?? 0;
      }
      if (totalQty === 0) {
        return {
          product: p,
          qty: totalQty,
          result: null,
        };
      }
      return {
        product: p,
        qty: totalQty,
        result: calcFullRevenue(p, state.margins, totalQty),
      };
    });
  }, [state]);

  // Annual totals
  const annualTotals = useMemo(() => {
    const t = { grossRev: 0, netRev: 0, grossGP: 0, netGP: 0 };
    for (const ms of monthlySummary) {
      t.grossRev += ms.grossRev;
      t.netRev += ms.netRev;
      t.grossGP += ms.grossGP;
      t.netGP += ms.netGP;
    }
    return t;
  }, [monthlySummary]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">FY2026 Summary</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Mode:</span>
          <button
            onClick={() => setMode("gross")}
            className={`px-3 py-1 text-sm rounded ${
              mode === "gross"
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Gross
          </button>
          <button
            onClick={() => setMode("net")}
            className={`px-3 py-1 text-sm rounded ${
              mode === "net"
                ? "bg-gray-900 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Net
          </button>
        </div>
      </div>

      {/* Annual KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">
            Annual Gross Revenue
          </div>
          <div className="text-xl font-bold mt-1">
            {fmt(annualTotals.grossRev)}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">
            Annual Net Revenue
          </div>
          <div className="text-xl font-bold mt-1">
            {fmt(annualTotals.netRev)}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">
            Annual Gross GP$
          </div>
          <div className="text-xl font-bold mt-1">
            {fmt(annualTotals.grossGP)}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">
            Annual Net GP$
          </div>
          <div className="text-xl font-bold mt-1">
            {fmt(annualTotals.netGP)}
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <h2 className="font-semibold text-sm px-4 pt-3 pb-2">
          Monthly Summary
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left">
              <th className="px-3 py-2 font-medium">Month</th>
              <th className="px-3 py-2 font-medium text-right">
                Gross Revenue
              </th>
              <th className="px-3 py-2 font-medium text-right">
                Net Revenue
              </th>
              <th className="px-3 py-2 font-medium text-right">Gross GP$</th>
              <th className="px-3 py-2 font-medium text-right">Net GP$</th>
              <th className="px-3 py-2 font-medium text-right">
                Gross Margin
              </th>
              <th className="px-3 py-2 font-medium text-right">Net Margin</th>
            </tr>
          </thead>
          <tbody>
            {monthlySummary.map((ms, i) => (
              <tr
                key={MONTHS_2026[i]}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-3 py-2">
                  {MONTH_LABELS[i]} 2026
                </td>
                <td className="px-3 py-2 text-right">{fmt(ms.grossRev)}</td>
                <td className="px-3 py-2 text-right">{fmt(ms.netRev)}</td>
                <td className="px-3 py-2 text-right">{fmt(ms.grossGP)}</td>
                <td className="px-3 py-2 text-right">{fmt(ms.netGP)}</td>
                <td className="px-3 py-2 text-right">
                  {pct(ms.grossMargin)}
                </td>
                <td className="px-3 py-2 text-right">{pct(ms.netMargin)}</td>
              </tr>
            ))}
            <tr className="font-semibold bg-gray-100 border-t">
              <td className="px-3 py-2">TOTAL</td>
              <td className="px-3 py-2 text-right">
                {fmt(annualTotals.grossRev)}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(annualTotals.netRev)}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(annualTotals.grossGP)}
              </td>
              <td className="px-3 py-2 text-right">
                {fmt(annualTotals.netGP)}
              </td>
              <td className="px-3 py-2 text-right">
                {pct(
                  annualTotals.grossRev > 0
                    ? (annualTotals.grossGP / annualTotals.grossRev) * 100
                    : 0,
                )}
              </td>
              <td className="px-3 py-2 text-right">
                {pct(
                  annualTotals.netRev > 0
                    ? (annualTotals.netGP / annualTotals.netRev) * 100
                    : 0,
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Product Summary Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <h2 className="font-semibold text-sm px-4 pt-3 pb-2">
          Product Summary — {mode === "gross" ? "Gross" : "Net"}
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left">
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium text-right">Units</th>
              <th className="px-3 py-2 font-medium text-right">Revenue</th>
              <th className="px-3 py-2 font-medium text-right">PS $</th>
              <th className="px-3 py-2 font-medium text-right">Resale $</th>
              <th className="px-3 py-2 font-medium text-right">Cloud $</th>
              <th className="px-3 py-2 font-medium text-right">PSS $</th>
              <th className="px-3 py-2 font-medium text-right">GP$</th>
              <th className="px-3 py-2 font-medium text-right">Margin</th>
            </tr>
          </thead>
          <tbody>
            {productSummary.map((ps, i) => {
              const r = ps.result;
              if (!r) {
                return (
                  <tr
                    key={ps.product.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2">{ps.product.name}</td>
                    <td className="px-3 py-2 text-right">{ps.qty}</td>
                    <td className="px-3 py-2 text-right text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-2 text-right text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-2 text-right text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-2 text-right text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-2 text-right text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-2 text-right text-gray-400">
                      -
                    </td>
                    <td className="px-3 py-2 text-right text-gray-400">
                      -
                    </td>
                  </tr>
                );
              }
              const rev =
                mode === "gross" ? r.gross_revenue : r.net_revenue;
              const comp =
                mode === "gross" ? r.gross_components : r.net_components;
              const gp =
                mode === "gross" ? r.total_gross_gp : r.total_net_gp;
              const margin =
                mode === "gross" ? r.gross_margin_pct : r.net_margin_pct;

              return (
                <tr
                  key={ps.product.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2">{ps.product.name}</td>
                  <td className="px-3 py-2 text-right">{ps.qty}</td>
                  <td className="px-3 py-2 text-right">{fmt(rev)}</td>
                  <td className="px-3 py-2 text-right">
                    {fmt(comp.professional_services)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fmt(comp.software_resale)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {fmt(comp.cloud_consumption)}
                  </td>
                  <td className="px-3 py-2 text-right">{fmt(comp.pss)}</td>
                  <td className="px-3 py-2 text-right">{fmt(gp)}</td>
                  <td className="px-3 py-2 text-right">{pct(margin)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
