"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/lib/store/context";
import {
  MONTHS_2026,
  MONTH_LABELS,
  forecastKey,
} from "@/lib/models/types";
import type { RevenueMode, Product } from "@/lib/models/types";
import { calcFullRevenue } from "@/lib/calc/revenue";
import type { RevenueResult } from "@/lib/models/types";

const ForecastGrid = dynamic(() => import("@/components/ForecastGrid"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-gray-400">Loading grid...</div>
  ),
});

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

interface MonthlyProductData {
  product: Product;
  months: { qty: number; result: RevenueResult | null }[];
  annualQty: number;
  annualResult: RevenueResult | null;
}

export default function ForecastPage() {
  const { state, isLoaded } = useStore();
  const [mode, setMode] = useState<RevenueMode>("net");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    revenue: true,
    components: true,
    gp: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const monthlyProductData: MonthlyProductData[] = useMemo(() => {
    return state.products.map((product) => {
      let annualQty = 0;
      const months = MONTHS_2026.map((m) => {
        const qty = state.forecastByProductIdMonth[forecastKey(product.id, m)] ?? 0;
        annualQty += qty;
        return {
          qty,
          result: qty > 0 ? calcFullRevenue(product, state.margins, qty) : null,
        };
      });

      return {
        product,
        months,
        annualQty,
        annualResult: annualQty > 0 ? calcFullRevenue(product, state.margins, annualQty) : null,
      };
    });
  }, [state]);

  const monthlyTotals = useMemo(() => {
    return MONTHS_2026.map((_, mi) => {
      let grossRev = 0;
      let netRev = 0;
      let grossGP = 0;
      let netGP = 0;
      let ps = 0;
      let sr = 0;
      let cc = 0;
      let epss = 0;
      let gpPs = 0;
      let gpSr = 0;
      let gpCc = 0;
      let gpEpss = 0;

      for (const pd of monthlyProductData) {
        const r = pd.months[mi].result;
        if (!r) continue;
        const comp = mode === "gross" ? r.gross_components : r.net_components;
        const gp = mode === "gross" ? r.gross_gp : r.net_gp;
        grossRev += r.gross_revenue;
        netRev += r.net_revenue;
        grossGP += r.total_gross_gp;
        netGP += r.total_net_gp;
        ps += comp.professional_services;
        sr += comp.software_resale;
        cc += comp.cloud_consumption;
        epss += comp.epss;
        gpPs += gp.professional_services;
        gpSr += gp.software_resale;
        gpCc += gp.cloud_consumption;
        gpEpss += gp.epss;
      }

      const rev = mode === "gross" ? grossRev : netRev;
      const totalGP = mode === "gross" ? grossGP : netGP;

      return { grossRev, netRev, grossGP, netGP, ps, sr, cc, epss, gpPs, gpSr, gpCc, gpEpss, rev, totalGP };
    });
  }, [monthlyProductData, mode]);

  const annualTotals = useMemo(() => {
    const t = { grossRev: 0, netRev: 0, grossGP: 0, netGP: 0, ps: 0, sr: 0, cc: 0, epss: 0, gpPs: 0, gpSr: 0, gpCc: 0, gpEpss: 0 };
    for (const mt of monthlyTotals) {
      t.grossRev += mt.grossRev;
      t.netRev += mt.netRev;
      t.grossGP += mt.grossGP;
      t.netGP += mt.netGP;
      t.ps += mt.ps;
      t.sr += mt.sr;
      t.cc += mt.cc;
      t.epss += mt.epss;
      t.gpPs += mt.gpPs;
      t.gpSr += mt.gpSr;
      t.gpCc += mt.gpCc;
      t.gpEpss += mt.gpEpss;
    }
    return { ...t, rev: mode === "gross" ? t.grossRev : t.netRev, totalGP: mode === "gross" ? t.grossGP : t.netGP };
  }, [monthlyTotals, mode]);

  if (!isLoaded) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  if (state.products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Forecast Model — FY2026</h1>
        <div className="text-gray-500 p-8 text-center bg-white border border-gray-200 rounded-lg">
          No products configured. Go to{" "}
          <a href="/settings/products" className="text-blue-600 underline">Settings &gt; Products</a>{" "}
          to add products.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Forecast Model — FY2026</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Mode:</span>
          <button
            onClick={() => setMode("gross")}
            className={`px-3 py-1 text-sm rounded ${
              mode === "gross" ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Gross
          </button>
          <button
            onClick={() => setMode("net")}
            className={`px-3 py-1 text-sm rounded ${
              mode === "net" ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Net
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-3">Unit Quantity by Month</h2>
        <ForecastGrid onSelectProduct={() => {}} />
        <p className="text-xs text-gray-400 mt-2">
          Enter the number of units expected to close each month. Revenue and margin tables update automatically.
        </p>
      </div>

      <SectionToggle
        title={`${mode === "gross" ? "Gross" : "Net"} Revenue by Product`}
        sectionKey="revenue"
        expanded={expandedSections.revenue}
        onToggle={toggleSection}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-3 py-2 font-medium sticky left-0 bg-gray-50 min-w-[160px]">Product</th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="px-3 py-2 font-medium text-right min-w-[90px]">{m}</th>
                ))}
                <th className="px-3 py-2 font-medium text-right min-w-[100px]">Annual</th>
              </tr>
            </thead>
            <tbody>
              {monthlyProductData.map((pd, i) => {
                return (
                  <tr key={pd.product.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className={`px-3 py-2 font-medium sticky left-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>{pd.product.name}</td>
                    {pd.months.map((m, mi) => {
                      const rev = m.result
                        ? mode === "gross" ? m.result.gross_revenue : m.result.net_revenue
                        : 0;
                      return (
                        <td key={mi} className="px-3 py-2 text-right">
                          {m.qty > 0 ? fmt(rev) : <span className="text-gray-300">-</span>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right font-semibold">
                      {pd.annualResult
                        ? fmt(mode === "gross" ? pd.annualResult.gross_revenue : pd.annualResult.net_revenue)
                        : <span className="text-gray-300">-</span>}
                    </td>
                  </tr>
                );
              })}
              <tr className="font-semibold bg-gray-100 border-t">
                <td className="px-3 py-2 sticky left-0 bg-gray-100">TOTAL</td>
                {monthlyTotals.map((mt, mi) => (
                  <td key={mi} className="px-3 py-2 text-right">{fmt(mt.rev)}</td>
                ))}
                <td className="px-3 py-2 text-right">{fmt(annualTotals.rev)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionToggle>

      <SectionToggle
        title="Revenue Component Breakdown"
        sectionKey="components"
        expanded={expandedSections.components}
        onToggle={toggleSection}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-3 py-2 font-medium sticky left-0 bg-gray-50 min-w-[160px]">Component</th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="px-3 py-2 font-medium text-right min-w-[90px]">{m}</th>
                ))}
                <th className="px-3 py-2 font-medium text-right min-w-[100px]">Annual</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Professional Services", key: "ps" as const },
                { label: "Software Resale", key: "sr" as const },
                { label: "Cloud Consumption", key: "cc" as const },
                { label: "EPS", key: "epss" as const },
              ].map((comp, i) => (
                <tr key={comp.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className={`px-3 py-2 font-medium sticky left-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>{comp.label}</td>
                  {monthlyTotals.map((mt, mi) => (
                    <td key={mi} className="px-3 py-2 text-right">{fmt(mt[comp.key])}</td>
                  ))}
                  <td className="px-3 py-2 text-right font-semibold">{fmt(annualTotals[comp.key])}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-100 border-t">
                <td className="px-3 py-2 sticky left-0 bg-gray-100">Total Revenue</td>
                {monthlyTotals.map((mt, mi) => (
                  <td key={mi} className="px-3 py-2 text-right">{fmt(mt.rev)}</td>
                ))}
                <td className="px-3 py-2 text-right">{fmt(annualTotals.rev)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionToggle>

      <SectionToggle
        title="Gross Profit & Margin"
        sectionKey="gp"
        expanded={expandedSections.gp}
        onToggle={toggleSection}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-3 py-2 font-medium sticky left-0 bg-gray-50 min-w-[160px]">Metric</th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="px-3 py-2 font-medium text-right min-w-[90px]">{m}</th>
                ))}
                <th className="px-3 py-2 font-medium text-right min-w-[100px]">Annual</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "PS GP$", key: "gpPs" as const },
                { label: "Resale GP$", key: "gpSr" as const },
                { label: "Cloud GP$", key: "gpCc" as const },
                { label: "EPS GP$", key: "gpEpss" as const },
              ].map((row, i) => (
                <tr key={row.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className={`px-3 py-2 font-medium sticky left-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>{row.label}</td>
                  {monthlyTotals.map((mt, mi) => (
                    <td key={mi} className="px-3 py-2 text-right">{fmt(mt[row.key])}</td>
                  ))}
                  <td className="px-3 py-2 text-right font-semibold">{fmt(annualTotals[row.key])}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-100 border-t">
                <td className="px-3 py-2 sticky left-0 bg-gray-100">Total GP$</td>
                {monthlyTotals.map((mt, mi) => (
                  <td key={mi} className="px-3 py-2 text-right">{fmt(mt.totalGP)}</td>
                ))}
                <td className="px-3 py-2 text-right">{fmt(annualTotals.totalGP)}</td>
              </tr>
              <tr className="font-semibold bg-blue-50 border-t">
                <td className="px-3 py-2 sticky left-0 bg-blue-50">Blended Margin %</td>
                {monthlyTotals.map((mt, mi) => (
                  <td key={mi} className="px-3 py-2 text-right">
                    {mt.rev > 0 ? pct((mt.totalGP / mt.rev) * 100) : <span className="text-gray-300">-</span>}
                  </td>
                ))}
                <td className="px-3 py-2 text-right">
                  {annualTotals.rev > 0 ? pct((annualTotals.totalGP / annualTotals.rev) * 100) : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionToggle>
    </div>
  );
}

function SectionToggle({
  title,
  sectionKey,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <h2 className="font-semibold text-sm">{title}</h2>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="border-t">{children}</div>}
    </div>
  );
}
