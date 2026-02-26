"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/store/context";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";
import { calcFullRevenue } from "@/lib/calc/revenue";
import {
  MONTHS_2026,
  MONTH_LABELS,
  forecastKey,
  variantForecastKey,
} from "@/lib/models/types";
import type {
  SavedForecast,
  ProductVariant,
  Product,
  RevenueResult,
} from "@/lib/models/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Layers,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";

const VARIANTS: ProductVariant[] = ["small", "medium", "large"];

const GA_MONTH_INDEX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function numFmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function pctFmt(n: number): string {
  return `${n.toFixed(1)}%`;
}

const CATEGORY_COLORS = {
  oneTime: "#F59E0B",
  recurring: "#3B82F6",
  softwareResale: "#8B5CF6",
};

const COMPONENT_COLORS = {
  ps: "#F59E0B",
  pss: "#3B82F6",
  cc: "#06B6D4",
  sr: "#8B5CF6",
};

function mergeRevenueResults(results: RevenueResult[]): RevenueResult {
  const m: RevenueResult = {
    gross_revenue: 0, net_revenue: 0, net_unit_price: 0,
    gross_components: { professional_services: 0, software_resale: 0, cloud_consumption: 0, pss: 0 },
    net_components: { professional_services: 0, software_resale: 0, cloud_consumption: 0, pss: 0 },
    gross_gp: { professional_services: 0, software_resale: 0, cloud_consumption: 0, pss: 0 },
    net_gp: { professional_services: 0, software_resale: 0, cloud_consumption: 0, pss: 0 },
    total_gross_gp: 0, total_net_gp: 0, gross_margin_pct: 0, net_margin_pct: 0,
  };
  for (const r of results) {
    m.gross_revenue += r.gross_revenue;
    m.net_revenue += r.net_revenue;
    for (const k of ["professional_services", "software_resale", "cloud_consumption", "pss"] as const) {
      m.gross_components[k] += r.gross_components[k];
      m.net_components[k] += r.net_components[k];
      m.gross_gp[k] += r.gross_gp[k];
      m.net_gp[k] += r.net_gp[k];
    }
    m.total_gross_gp += r.total_gross_gp;
    m.total_net_gp += r.total_net_gp;
  }
  if (m.gross_revenue > 0) m.gross_margin_pct = (m.total_gross_gp / m.gross_revenue) * 100;
  if (m.net_revenue > 0) m.net_margin_pct = (m.total_net_gp / m.net_revenue) * 100;
  return m;
}

interface MonthlyData {
  grossRev: number;
  netRev: number;
  ps: number;
  sr: number;
  cc: number;
  pss: number;
  grossGP: number;
  netGP: number;
  totalDeals: number;
}

function calcForecastData(
  forecast: SavedForecast,
  products: Product[],
  margins: Parameters<typeof calcFullRevenue>[1],
) {
  const monthly: MonthlyData[] = MONTHS_2026.map(() => ({
    grossRev: 0, netRev: 0, ps: 0, sr: 0, cc: 0, pss: 0, grossGP: 0, netGP: 0, totalDeals: 0,
  }));

  const quantities = forecast.quantities;
  let totalDeals = 0;

  const productBreakdown: { name: string; grossRev: number; netRev: number; deals: number }[] = [];

  for (const p of products) {
    const gaIdx = GA_MONTH_INDEX[p.generally_available] ?? 0;
    let prodGross = 0;
    let prodNet = 0;
    let prodDeals = 0;

    if (p.has_variants && p.variants) {
      for (const v of VARIANTS) {
        const variantProduct = { ...p, selected_variant: v };
        MONTHS_2026.forEach((m, mi) => {
          if (mi < gaIdx) return;
          const qty = quantities[variantForecastKey(p.id, v, m)] ?? 0;
          if (qty <= 0) return;
          const result = calcFullRevenue(variantProduct, margins, qty);
          monthly[mi].grossRev += result.gross_revenue;
          monthly[mi].netRev += result.net_revenue;
          monthly[mi].ps += result.gross_components.professional_services;
          monthly[mi].sr += result.gross_components.software_resale;
          monthly[mi].cc += result.gross_components.cloud_consumption;
          monthly[mi].pss += result.gross_components.pss;
          monthly[mi].grossGP += result.total_gross_gp;
          monthly[mi].netGP += result.total_net_gp;
          monthly[mi].totalDeals += qty;
          totalDeals += qty;
          prodGross += result.gross_revenue;
          prodNet += result.net_revenue;
          prodDeals += qty;
        });
      }
    } else {
      MONTHS_2026.forEach((m, mi) => {
        if (mi < gaIdx) return;
        const qty = quantities[forecastKey(p.id, m)] ?? 0;
        if (qty <= 0) return;
        const result = calcFullRevenue(p, margins, qty);
        monthly[mi].grossRev += result.gross_revenue;
        monthly[mi].netRev += result.net_revenue;
        monthly[mi].ps += result.gross_components.professional_services;
        monthly[mi].sr += result.gross_components.software_resale;
        monthly[mi].cc += result.gross_components.cloud_consumption;
        monthly[mi].pss += result.gross_components.pss;
        monthly[mi].grossGP += result.total_gross_gp;
        monthly[mi].netGP += result.total_net_gp;
        monthly[mi].totalDeals += qty;
        totalDeals += qty;
        prodGross += result.gross_revenue;
        prodNet += result.net_revenue;
        prodDeals += qty;
      });
    }

    if (prodDeals > 0) {
      productBreakdown.push({ name: p.name, grossRev: prodGross, netRev: prodNet, deals: prodDeals });
    }
  }

  const annual = monthly.reduce(
    (acc, m) => ({
      grossRev: acc.grossRev + m.grossRev,
      netRev: acc.netRev + m.netRev,
      ps: acc.ps + m.ps,
      sr: acc.sr + m.sr,
      cc: acc.cc + m.cc,
      pss: acc.pss + m.pss,
      grossGP: acc.grossGP + m.grossGP,
      netGP: acc.netGP + m.netGP,
      totalDeals: acc.totalDeals + m.totalDeals,
    }),
    { grossRev: 0, netRev: 0, ps: 0, sr: 0, cc: 0, pss: 0, grossGP: 0, netGP: 0, totalDeals: 0 },
  );

  const oneTime = annual.ps;
  const recurring = annual.pss + annual.cc;
  const softwareResale = annual.sr;

  return {
    monthly,
    annual,
    totalDeals,
    oneTime,
    recurring,
    softwareResale,
    productBreakdown: productBreakdown.sort((a, b) => b.grossRev - a.grossRev),
  };
}

export default function CFOViewPage() {
  const { state, isLoaded } = useStore();
  const { forecasts, isLoaded: fcLoaded } = useSavedForecasts();
  const [selectedForecastId, setSelectedForecastId] = useState<string | null>(null);

  const selectedForecast = useMemo(() => {
    if (!fcLoaded || forecasts.length === 0) return null;
    if (selectedForecastId) return forecasts.find((f) => f.id === selectedForecastId) ?? forecasts[0];
    return forecasts[0];
  }, [forecasts, selectedForecastId, fcLoaded]);

  const data = useMemo(() => {
    if (!selectedForecast || !isLoaded) return null;
    return calcForecastData(selectedForecast, state.products, state.margins);
  }, [selectedForecast, state.products, state.margins, isLoaded]);

  if (!isLoaded || !fcLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (forecasts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Forecasts Available</h2>
        <p className="text-gray-500 mb-4">Create a forecast model first to view CFO metrics.</p>
        <a href="/forecast" className="text-blue-600 hover:text-blue-800 font-medium">
          Go to Forecast Modelling
        </a>
      </div>
    );
  }

  if (!data) return null;

  const { monthly, annual, totalDeals, oneTime, recurring, softwareResale, productBreakdown } = data;

  const grossMarginPct = annual.grossRev > 0 ? (annual.grossGP / annual.grossRev) * 100 : 0;
  const netMarginPct = annual.netRev > 0 ? (annual.netGP / annual.netRev) * 100 : 0;

  const revenueByCategory = [
    { name: "One-Time (PS)", value: oneTime, color: CATEGORY_COLORS.oneTime },
    { name: "Recurring (PSS + Cloud)", value: recurring, color: CATEGORY_COLORS.recurring },
    { name: "Software Resale", value: softwareResale, color: CATEGORY_COLORS.softwareResale },
  ].filter((c) => c.value > 0);

  const monthlyChartData = monthly.map((m, i) => ({
    month: MONTH_LABELS[i],
    "Gross Revenue": m.grossRev,
    "Net Revenue": m.netRev,
    "One-Time": m.ps,
    "Recurring": m.pss + m.cc,
    "Software Resale": m.sr,
    Deals: m.totalDeals,
  }));

  const quarterlyData = [
    { name: "Q1", ...sumQuarter(monthly, 0, 3) },
    { name: "Q2", ...sumQuarter(monthly, 3, 6) },
    { name: "Q3", ...sumQuarter(monthly, 6, 9) },
    { name: "Q4", ...sumQuarter(monthly, 9, 12) },
  ];

  const componentPieData = [
    { name: "Prof. Services", value: annual.ps, color: COMPONENT_COLORS.ps },
    { name: "PSS", value: annual.pss, color: COMPONENT_COLORS.pss },
    { name: "Cloud Consumption", value: annual.cc, color: COMPONENT_COLORS.cc },
    { name: "Software Resale", value: annual.sr, color: COMPONENT_COLORS.sr },
  ].filter((c) => c.value > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CFO View</h1>
          <p className="text-sm text-gray-500 mt-1">
            Financial performance overview and revenue analysis.
          </p>
        </div>

        <div className="relative">
          <select
            value={selectedForecast?.id ?? ""}
            onChange={(e) => setSelectedForecastId(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            {forecasts.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <KpiCard
          label="Gross Revenue"
          value={fmtCompact(annual.grossRev)}
          subtext={fmt(annual.grossRev)}
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <KpiCard
          label="Net Revenue"
          value={fmtCompact(annual.netRev)}
          subtext={fmt(annual.netRev)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <KpiCard
          label="One-Time Revenue"
          value={fmtCompact(oneTime)}
          subtext="Professional Services"
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
        />
        <KpiCard
          label="PSS Revenue"
          value={fmtCompact(annual.pss)}
          subtext="Platform Support Services"
          icon={<TrendingUp className="w-5 h-5" />}
          color="cyan"
        />
        <KpiCard
          label="Cloud Revenue"
          value={fmtCompact(annual.cc)}
          subtext="Cloud Consumption"
          icon={<TrendingUp className="w-5 h-5" />}
          color="indigo"
        />
        <KpiCard
          label="Total Deals"
          value={numFmt(totalDeals)}
          subtext={`${productBreakdown.length} active products`}
          icon={<Briefcase className="w-5 h-5" />}
          color="purple"
        />
        <KpiCard
          label="Gross Margin"
          value={pctFmt(grossMarginPct)}
          subtext={`GP: ${fmtCompact(annual.grossGP)}`}
          icon={<Layers className="w-5 h-5" />}
          color="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => fmtCompact(v)} />
              <Tooltip
                formatter={(value: any) => fmt(Number(value) || 0)}
                contentStyle={{ fontSize: 13 }}
              />
              <Area type="monotone" dataKey="Gross Revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="Net Revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue Categories</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={revenueByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
                label={({ name, percent }: Record<string, any>) =>
                  `${(name ?? "").split(" ")[0]} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {revenueByCategory.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => fmt(Number(value) || 0)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {revenueByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-600">{cat.name}</span>
                </div>
                <span className="font-medium text-gray-800">{fmtCompact(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue by Component (Monthly)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 px-2 font-medium text-gray-500">Month</th>
                  <th className="py-2 px-2 font-medium text-right text-blue-600">Cloud</th>
                  <th className="py-2 px-2 font-medium text-right text-indigo-600">PSS</th>
                  <th className="py-2 px-2 font-medium text-right text-amber-600">Prof Svcs</th>
                  <th className="py-2 px-2 font-medium text-right text-purple-600">SW Resale</th>
                  <th className="py-2 px-2 font-medium text-right text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m, i) => {
                  const total = m.cc + m.pss + m.ps + m.sr;
                  return (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1.5 px-2 font-medium text-gray-800">{MONTH_LABELS[i]}</td>
                      <td className="py-1.5 px-2 text-right text-blue-700">{m.cc > 0 ? fmtCompact(m.cc) : "—"}</td>
                      <td className="py-1.5 px-2 text-right text-indigo-700">{m.pss > 0 ? fmtCompact(m.pss) : "—"}</td>
                      <td className="py-1.5 px-2 text-right text-amber-700">{m.ps > 0 ? fmtCompact(m.ps) : "—"}</td>
                      <td className="py-1.5 px-2 text-right text-purple-700">{m.sr > 0 ? fmtCompact(m.sr) : "—"}</td>
                      <td className="py-1.5 px-2 text-right font-semibold text-gray-900">{total > 0 ? fmtCompact(total) : "—"}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-2 px-2 text-gray-900">FY Total</td>
                  <td className="py-2 px-2 text-right text-blue-800">{fmtCompact(monthly.reduce((s, m) => s + m.cc, 0))}</td>
                  <td className="py-2 px-2 text-right text-indigo-800">{fmtCompact(monthly.reduce((s, m) => s + m.pss, 0))}</td>
                  <td className="py-2 px-2 text-right text-amber-800">{fmtCompact(monthly.reduce((s, m) => s + m.ps, 0))}</td>
                  <td className="py-2 px-2 text-right text-purple-800">{fmtCompact(monthly.reduce((s, m) => s + m.sr, 0))}</td>
                  <td className="py-2 px-2 text-right text-gray-900">{fmtCompact(annual.grossRev)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Quarterly Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2.5 px-3 font-medium text-gray-500">Quarter</th>
                  <th className="py-2.5 px-3 font-medium text-gray-500 text-right">Gross Rev</th>
                  <th className="py-2.5 px-3 font-medium text-gray-500 text-right">Net Rev</th>
                  <th className="py-2.5 px-3 font-medium text-gray-500 text-right">One-Time</th>
                  <th className="py-2.5 px-3 font-medium text-gray-500 text-right">Recurring</th>
                  <th className="py-2.5 px-3 font-medium text-gray-500 text-right">Deals</th>
                </tr>
              </thead>
              <tbody>
                {quarterlyData.map((q) => (
                  <tr key={q.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{q.name}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700">{fmtCompact(q.grossRev)}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700">{fmtCompact(q.netRev)}</td>
                    <td className="py-2.5 px-3 text-right text-amber-600">{fmtCompact(q.oneTime)}</td>
                    <td className="py-2.5 px-3 text-right text-blue-600">{fmtCompact(q.recurring)}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700">{numFmt(q.deals)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-2.5 px-3 text-gray-900">FY Total</td>
                  <td className="py-2.5 px-3 text-right text-gray-900">{fmtCompact(annual.grossRev)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-900">{fmtCompact(annual.netRev)}</td>
                  <td className="py-2.5 px-3 text-right text-amber-700">{fmtCompact(oneTime)}</td>
                  <td className="py-2.5 px-3 text-right text-blue-700">{fmtCompact(recurring)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-900">{numFmt(totalDeals)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue Component Mix</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={componentPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
                label={({ name, percent }: Record<string, any>) =>
                  `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {componentPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => fmt(Number(value) || 0)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Product Revenue Ranking</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {productBreakdown.map((p, i) => {
              const pctOfTotal = annual.grossRev > 0 ? (p.grossRev / annual.grossRev) * 100 : 0;
              return (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5 text-right">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
                      <span className="text-sm font-semibold text-gray-700 ml-2 flex-shrink-0">
                        {fmtCompact(p.grossRev)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${pctOfTotal}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-gray-400">{p.deals} deals</span>
                      <span className="text-xs text-gray-400">{pctFmt(pctOfTotal)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {productBreakdown.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No product data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Deals by Month</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ fontSize: 13 }} />
            <Bar dataKey="Deals" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Margin Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MarginCard
            label="Gross Revenue"
            revenue={annual.grossRev}
            gp={annual.grossGP}
            margin={grossMarginPct}
          />
          <MarginCard
            label="Net Revenue"
            revenue={annual.netRev}
            gp={annual.netGP}
            margin={netMarginPct}
          />
          <MarginCard
            label="One-Time (PS)"
            revenue={oneTime}
            gp={oneTime * (state.margins.professional_services_margin_pct / 100)}
            margin={state.margins.professional_services_margin_pct}
          />
          <MarginCard
            label="Recurring"
            revenue={recurring}
            gp={
              annual.pss * (state.margins.pss_margin_pct / 100) +
              annual.cc * (state.margins.cloud_consumption_margin_pct / 100)
            }
            margin={
              recurring > 0
                ? ((annual.pss * (state.margins.pss_margin_pct / 100) +
                    annual.cc * (state.margins.cloud_consumption_margin_pct / 100)) /
                    recurring) *
                  100
                : 0
            }
          />
        </div>
      </div>
    </div>
  );
}

function sumQuarter(monthly: MonthlyData[], start: number, end: number) {
  let grossRev = 0, netRev = 0, oneTime = 0, recurring = 0, deals = 0;
  for (let i = start; i < end; i++) {
    grossRev += monthly[i].grossRev;
    netRev += monthly[i].netRev;
    oneTime += monthly[i].ps;
    recurring += monthly[i].pss + monthly[i].cc;
    deals += monthly[i].totalDeals;
  }
  return { grossRev, netRev, oneTime, recurring, deals };
}

function KpiCard({
  label,
  value,
  subtext,
  icon,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "cyan" | "purple" | "slate" | "indigo";
}) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "bg-blue-100 text-blue-600" },
    green: { bg: "bg-green-50", text: "text-green-600", icon: "bg-green-100 text-green-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", icon: "bg-amber-100 text-amber-600" },
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600", icon: "bg-cyan-100 text-cyan-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "bg-purple-100 text-purple-600" },
    slate: { bg: "bg-slate-50", text: "text-slate-600", icon: "bg-slate-100 text-slate-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", icon: "bg-indigo-100 text-indigo-600" },
  };
  const c = colorMap[color];

  return (
    <div className={`${c.bg} rounded-xl p-4 border border-gray-100`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${c.icon} flex items-center justify-center`}>{icon}</div>
      </div>
      <div className={`text-xl font-bold ${c.text}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{subtext}</div>
    </div>
  );
}

function MarginCard({
  label,
  revenue,
  gp,
  margin,
}: {
  label: string;
  revenue: number;
  gp: number;
  margin: number;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
      <div className="text-lg font-bold text-gray-800">{fmtCompact(revenue)}</div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">GP: {fmtCompact(gp)}</span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            margin >= 50
              ? "bg-green-100 text-green-700"
              : margin >= 30
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {pctFmt(margin)}
        </span>
      </div>
    </div>
  );
}
