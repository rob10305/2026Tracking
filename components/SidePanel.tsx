"use client";

import React, { useMemo } from "react";
import { useStore } from "@/lib/store/context";
import { MONTHS_2026, forecastKey } from "@/lib/models/types";
import type { RevenueMode } from "@/lib/models/types";
import { calcFullRevenue } from "@/lib/calc/revenue";

interface SidePanelProps {
  productId: string | null;
  mode: RevenueMode;
}

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

export default function SidePanel({ productId, mode }: SidePanelProps) {
  const { state } = useStore();

  const product = state.products.find((p) => p.id === productId);
  const margins = state.margins;

  const result = useMemo(() => {
    if (!product || !margins) return null;

    let totalQty = 0;
    for (const m of MONTHS_2026) {
      totalQty +=
        state.forecastByProductIdMonth[forecastKey(product.id, m)] ?? 0;
    }

    return calcFullRevenue(product, margins, totalQty);
  }, [product, margins, state.forecastByProductIdMonth]);

  if (!product || !result) {
    return (
      <div className="text-gray-400 text-sm p-4">
        Select a product row to see breakdowns
      </div>
    );
  }

  const revenue =
    mode === "gross" ? result.gross_revenue : result.net_revenue;
  const components =
    mode === "gross" ? result.gross_components : result.net_components;
  const gp = mode === "gross" ? result.gross_gp : result.net_gp;
  const totalGP =
    mode === "gross" ? result.total_gross_gp : result.total_net_gp;
  const marginPct =
    mode === "gross" ? result.gross_margin_pct : result.net_margin_pct;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm">{product.name}</h3>
      <p className="text-xs text-gray-500 uppercase tracking-wide">
        {mode} view — FY2026 Annual
      </p>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Revenue</span>
          <span className="font-semibold">{fmt(revenue)}</span>
        </div>
        <div className="flex justify-between">
          <span>Gross Profit</span>
          <span className="font-semibold">{fmt(totalGP)}</span>
        </div>
        <div className="flex justify-between">
          <span>Margin</span>
          <span className="font-semibold">{pct(marginPct)}</span>
        </div>
      </div>

      <hr className="border-gray-200" />

      <p className="text-xs text-gray-500 uppercase tracking-wide">
        Component Breakdown
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="text-left py-1">Component</th>
            <th className="text-right py-1">Revenue</th>
            <th className="text-right py-1">GP$</th>
          </tr>
        </thead>
        <tbody>
          {(
            [
              ["Prof. Services", "professional_services"],
              ["Software Resale", "software_resale"],
              ["Cloud Consumption", "cloud_consumption"],
              ["EPS", "epss"],
            ] as const
          ).map(([label, key]) => (
            <tr key={key} className="border-b border-gray-100">
              <td className="py-1">{label}</td>
              <td className="text-right py-1">{fmt(components[key])}</td>
              <td className="text-right py-1">{fmt(gp[key])}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td className="py-1">Total</td>
            <td className="text-right py-1">{fmt(revenue)}</td>
            <td className="text-right py-1">{fmt(totalGP)}</td>
          </tr>
        </tbody>
      </table>

      <hr className="border-gray-200" />

      <div className="text-xs text-gray-400 space-y-1">
        <p>Annual price: {fmt(product.gross_annual_price)}</p>
        {product.has_variants && product.selected_variant && (
          <p>Variant: {product.selected_variant.charAt(0).toUpperCase() + product.selected_variant.slice(1)}</p>
        )}
      </div>
    </div>
  );
}
