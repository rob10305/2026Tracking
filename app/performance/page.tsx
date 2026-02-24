"use client";

import React, { useMemo, useState } from "react";
import { useStore } from "@/lib/store/context";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";
import {
  MONTHS_2026,
  MONTH_LABELS,
  forecastKey,
  variantForecastKey,
  type ProductVariant,
} from "@/lib/models/types";
import { calcFullRevenue } from "@/lib/calc/revenue";
import { calcWorkbackRow } from "@/lib/calc/workback";
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
} from "recharts";
import {
  Activity,
  TrendingUp,
  Target,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const CHANNEL_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899"];
const VARIANTS: ProductVariant[] = ["small", "medium", "large"];

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function numFmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

type TabKey = "coverage" | "channels" | "monthly";
type AverageSource = "product" | "industry" | "itm";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "coverage", label: "Pipeline Coverage", icon: <Target className="w-4 h-4" /> },
  { key: "channels", label: "Channel Performance", icon: <Activity className="w-4 h-4" /> },
  { key: "monthly", label: "Monthly Trends", icon: <TrendingUp className="w-4 h-4" /> },
];

function CoverageGauge({ label, ratio, needed, have, suffix }: { label: string; ratio: number; needed: number; have: number; suffix?: string }) {
  const healthy = ratio >= 3;
  const warning = ratio >= 2 && ratio < 3;
  const critical = ratio < 2;
  const color = healthy ? "text-green-600" : warning ? "text-amber-600" : "text-red-600";
  const bgColor = healthy ? "bg-green-100" : warning ? "bg-amber-100" : "bg-red-100";
  const barColor = healthy ? "bg-green-500" : warning ? "bg-amber-500" : "bg-red-500";
  const barPct = Math.min(ratio / 5 * 100, 100);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bgColor} ${color}`}>
          {ratio.toFixed(1)}x
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${barPct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Target: {numFmt(needed)}{suffix}</span>
        <span>Pipeline: {numFmt(have)}{suffix}</span>
      </div>
    </div>
  );
}

export default function PerformanceTrackerPage() {
  const { state, isLoaded } = useStore();
  const { forecasts, isLoaded: fcLoaded } = useSavedForecasts();
  const [activeTab, setActiveTab] = useState<TabKey>("coverage");
  const [selectedForecastId, setSelectedForecastId] = useState<string>("default");
  const [averageSource, setAverageSource] = useState<AverageSource>("product");
  const [healthOpen, setHealthOpen] = useState(true);

  const products = state.products;

  const quantities = useMemo(() => {
    if (selectedForecastId === "default") {
      return state.forecastByProductIdMonth;
    }
    const fc = forecasts.find((f) => f.id === selectedForecastId);
    return fc?.quantities ?? {};
  }, [selectedForecastId, state.forecastByProductIdMonth, forecasts]);

  const monthlyTotals = useMemo(() => {
    return MONTHS_2026.map((m, i) => {
      let grossRev = 0;
      let totalUnits = 0;
      for (const p of products) {
        if (p.has_variants && p.variants) {
          for (const v of VARIANTS) {
            const qty = quantities[variantForecastKey(p.id, v, m)] ?? 0;
            totalUnits += qty;
            if (qty > 0) {
              const variantProduct = { ...p, selected_variant: v };
              const r = calcFullRevenue(variantProduct, state.margins, qty);
              grossRev += r.gross_revenue;
            }
          }
        } else {
          const qty = quantities[forecastKey(p.id, m)] ?? 0;
          totalUnits += qty;
          if (qty > 0) {
            const r = calcFullRevenue(p, state.margins, qty);
            grossRev += r.gross_revenue;
          }
        }
      }
      return { month: m, label: MONTH_LABELS[i], grossRev, totalUnits };
    });
  }, [products, quantities, state.margins]);

  const annualRevenue = useMemo(() => {
    return monthlyTotals.reduce((sum, mt) => sum + mt.grossRev, 0);
  }, [monthlyTotals]);

  const totalUnits = useMemo(() => {
    return monthlyTotals.reduce((sum, mt) => sum + mt.totalUnits, 0);
  }, [monthlyTotals]);

  const activeMotion = useMemo(() => {
    if (averageSource === "industry") return state.industryAverages;
    if (averageSource === "itm") return state.itmHistoricalAverages;
    return null;
  }, [averageSource, state.industryAverages, state.itmHistoricalAverages]);

  const pipelineData = useMemo(() => {
    const rows: {
      productName: string;
      closeMonth: string;
      qty: number;
      dealsNeeded: number;
      oppsNeeded: number;
      prospectsNeeded: number;
      pipelineMonth: string;
    }[] = [];
    for (const p of products) {
      const motion = activeMotion ?? state.salesMotionByProductId[p.id];
      if (!motion) continue;
      for (const m of MONTHS_2026) {
        let qty = 0;
        if (p.has_variants) {
          for (const v of VARIANTS) qty += quantities[variantForecastKey(p.id, v, m)] ?? 0;
        } else {
          qty = quantities[forecastKey(p.id, m)] ?? 0;
        }
        if (qty === 0) continue;
        const wb = calcWorkbackRow(p.id, p.name, m, qty, motion);
        rows.push({
          productName: p.name,
          closeMonth: m,
          qty,
          dealsNeeded: wb.deals_needed,
          oppsNeeded: wb.opps_needed,
          prospectsNeeded: wb.prospects_needed,
          pipelineMonth: wb.pipeline_month,
        });
      }
    }
    return rows;
  }, [products, quantities, state.salesMotionByProductId, activeMotion]);

  const totals = useMemo(() => {
    const totalDeals = pipelineData.reduce((s, r) => s + r.dealsNeeded, 0);
    const totalOpps = pipelineData.reduce((s, r) => s + r.oppsNeeded, 0);
    const totalProspects = pipelineData.reduce((s, r) => s + r.prospectsNeeded, 0);
    const blendedWinRate = totalOpps > 0 ? (totalDeals / totalOpps) * 100 : 0;
    const blendedProspectRate = totalProspects > 0 ? (totalOpps / totalProspects) * 100 : 0;
    return { totalDeals, totalOpps, totalProspects, blendedWinRate, blendedProspectRate };
  }, [pipelineData]);

  const channelBreakdown = useMemo(() => {
    const pc = state.pipelineContribution;
    const { totalProspects, totalOpps } = totals;

    const channelKeys = [
      { key: "website_inbound" as const, label: "Website Inbound" },
      { key: "sales_team_generated" as const, label: "Sales Team" },
      { key: "event_sourced" as const, label: "Event Sourced" },
      { key: "abm_thought_leadership" as const, label: "ABM/Thought Leadership" },
      { key: "partner_referral" as const, label: "Partner Referral" },
    ];

    if (pc.mode === "pct") {
      return channelKeys.map((ch) => ({
        label: ch.label,
        pct: pc[ch.key],
        prospects: Math.ceil(totalProspects * pc[ch.key] / 100),
        opps: Math.ceil(totalOpps * pc[ch.key] / 100),
      }));
    }

    const totalNum = channelKeys.reduce((s, ch) => s + pc[ch.key], 0);
    const pctOf = (v: number) => totalNum > 0 ? (v / totalNum) * 100 : 0;
    return channelKeys.map((ch) => ({
      label: ch.label,
      pct: pctOf(pc[ch.key]),
      prospects: Math.ceil(totalProspects * pctOf(pc[ch.key]) / 100),
      opps: Math.ceil(totalOpps * pctOf(pc[ch.key]) / 100),
    }));
  }, [state.pipelineContribution, totals]);

  const pipelineByMonth = useMemo(() => {
    const byMonth: Record<string, { opps: number; prospects: number; deals: number }> = {};
    for (const r of pipelineData) {
      if (!byMonth[r.pipelineMonth]) byMonth[r.pipelineMonth] = { opps: 0, prospects: 0, deals: 0 };
      byMonth[r.pipelineMonth].opps += r.oppsNeeded;
      byMonth[r.pipelineMonth].prospects += r.prospectsNeeded;
      byMonth[r.pipelineMonth].deals += r.dealsNeeded;
    }
    return MONTHS_2026.map((m, i) => ({
      month: MONTH_LABELS[i],
      deals: byMonth[m]?.deals ?? 0,
      opps: byMonth[m]?.opps ?? 0,
      prospects: byMonth[m]?.prospects ?? 0,
    }));
  }, [pipelineData]);

  const coverageRatio = useMemo(() => {
    const { totalDeals, totalOpps, totalProspects } = totals;
    return {
      oppsToDeals: totalDeals > 0 ? totalOpps / totalDeals : 0,
      prospectsToOpps: totalOpps > 0 ? totalProspects / totalOpps : 0,
      prospectsToDeals: totalDeals > 0 ? totalProspects / totalDeals : 0,
    };
  }, [totals]);

  const topChannel = useMemo(() => {
    if (channelBreakdown.length === 0) return null;
    return channelBreakdown.reduce((best, ch) => ch.prospects > best.prospects ? ch : best, channelBreakdown[0]);
  }, [channelBreakdown]);

  const h1Revenue = useMemo(() => {
    return monthlyTotals.slice(0, 6).reduce((s, m) => s + m.grossRev, 0);
  }, [monthlyTotals]);
  const h2Revenue = useMemo(() => {
    return monthlyTotals.slice(6, 12).reduce((s, m) => s + m.grossRev, 0);
  }, [monthlyTotals]);
  const h2Growth = h1Revenue > 0 ? ((h2Revenue - h1Revenue) / h1Revenue) * 100 : 0;

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pipeline coverage, channel performance, and forecast health indicators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {([
              { key: "product" as AverageSource, label: "Product-Specific" },
              { key: "industry" as AverageSource, label: "Industry Avg" },
              { key: "itm" as AverageSource, label: "ITM Historical" },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setAverageSource(opt.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  averageSource === opt.key
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
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
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 text-center">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Prospects Needed</span>
          <p className="text-3xl font-bold text-amber-700 mt-1">{numFmt(totals.totalProspects)}</p>
          <p className="text-[10px] text-amber-500 mt-2 leading-tight">
            {numFmt(totals.totalOpps)} opps ÷ {totals.blendedProspectRate.toFixed(1)}% prospect-to-opp rate
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-5 text-center">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Opps Needed</span>
          <p className="text-3xl font-bold text-purple-700 mt-1">{numFmt(totals.totalOpps)}</p>
          <p className="text-[10px] text-purple-500 mt-2 leading-tight">
            {numFmt(totals.totalDeals)} deals ÷ {totals.blendedWinRate.toFixed(1)}% win rate
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-center">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Deals</span>
          <p className="text-3xl font-bold text-blue-700 mt-1">{numFmt(totals.totalDeals)}</p>
          <p className="text-[10px] text-blue-500 mt-2 leading-tight">
            Sum of forecasted units across {products.filter(p => pipelineData.some(r => r.productName === p.name)).length} products
          </p>
        </div>
      </div>

      {(() => {
        const mqlChannels = channelBreakdown.filter((ch) =>
          ["Website Inbound", "Event Sourced", "ABM/Thought Leadership"].includes(ch.label)
        );
        const mqlProspects = mqlChannels.reduce((s, ch) => s + ch.prospects, 0);
        const mqlOpps = mqlChannels.reduce((s, ch) => s + ch.opps, 0);
        const mqlPct = totals.totalProspects > 0 ? (mqlProspects / totals.totalProspects) * 100 : 0;
        return (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">MQL Contribution Needed</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-5 text-center">
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">MQL Prospects</span>
                <p className="text-3xl font-bold text-green-700 mt-1">{numFmt(mqlProspects)}</p>
                <p className="text-[10px] text-green-500 mt-2 leading-tight">
                  Website + Events + ABM channels ({mqlPct.toFixed(0)}% of total)
                </p>
              </div>
              <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-5 text-center">
                <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">MQL Opps</span>
                <p className="text-3xl font-bold text-cyan-700 mt-1">{numFmt(mqlOpps)}</p>
                <p className="text-[10px] text-cyan-500 mt-2 leading-tight">
                  MQL prospects × prospect-to-opp conversion rate
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 text-center">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">MQL Share</span>
                <p className="text-3xl font-bold text-indigo-700 mt-1">{mqlPct.toFixed(1)}%</p>
                <p className="text-[10px] text-indigo-500 mt-2 leading-tight">
                  {numFmt(mqlProspects)} MQL of {numFmt(totals.totalProspects)} total prospects
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">MQL Breakdown</span>
                <div className="mt-2 space-y-1.5">
                  {mqlChannels.map((ch) => (
                    <div key={ch.label} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{ch.label}</span>
                      <span className="font-semibold text-gray-800">{numFmt(ch.prospects)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "coverage" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CoverageGauge
              label="Opportunity Coverage"
              ratio={coverageRatio.oppsToDeals}
              needed={totals.totalDeals}
              have={totals.totalOpps}
              suffix=" opps"
            />
            <CoverageGauge
              label="Prospect Coverage"
              ratio={coverageRatio.prospectsToOpps}
              needed={totals.totalOpps}
              have={totals.totalProspects}
              suffix=" prospects"
            />
            <CoverageGauge
              label="Full Funnel Coverage"
              ratio={coverageRatio.prospectsToDeals}
              needed={totals.totalDeals}
              have={totals.totalProspects}
              suffix=" total"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <button
              onClick={() => setHealthOpen(!healthOpen)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="text-sm font-semibold text-gray-700">Coverage Health Assessment</h3>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${healthOpen ? "rotate-180" : ""}`} />
            </button>
            {healthOpen && <div className="space-y-3 mt-4">
              {coverageRatio.oppsToDeals >= 3 ? (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Opportunity pipeline is healthy</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      You have {coverageRatio.oppsToDeals.toFixed(1)}x opportunity coverage. Industry standard is 3x minimum.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Opportunity pipeline needs attention</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Only {coverageRatio.oppsToDeals.toFixed(1)}x coverage. You need at least 3x to hit targets reliably.
                      {totals.totalDeals > 0 && ` Gap: ${numFmt(Math.max(0, totals.totalDeals * 3 - totals.totalOpps))} additional opps needed.`}
                    </p>
                  </div>
                </div>
              )}

              {coverageRatio.prospectsToOpps >= 5 ? (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Prospect volume is sufficient</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {coverageRatio.prospectsToOpps.toFixed(1)}x prospect-to-opportunity ratio provides a strong foundation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Prospect generation could be stronger</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {coverageRatio.prospectsToOpps.toFixed(1)}x prospect-to-opp ratio. Consider increasing inbound lead generation or outbound activity.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Revenue trajectory</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    H1 revenue: {fmtCompact(h1Revenue)} → H2 revenue: {fmtCompact(h2Revenue)} ({h2Growth >= 0 ? "+" : ""}{h2Growth.toFixed(1)}% growth).
                    {h2Growth > 20 ? " Strong growth trajectory." : h2Growth > 0 ? " Moderate growth planned." : " Revenue is flat or declining — review forecast."}
                  </p>
                </div>
              </div>
            </div>}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Product Pipeline Requirements</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 font-medium text-gray-500">Product</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Deals</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Opps Needed</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Prospects Needed</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Opp Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const motion = state.salesMotionByProductId[p.id];
                    if (!motion) return null;
                    const rows = pipelineData.filter((r) => r.productName === p.name);
                    const deals = rows.reduce((s, r) => s + r.dealsNeeded, 0);
                    const opps = rows.reduce((s, r) => s + r.oppsNeeded, 0);
                    const prospects = rows.reduce((s, r) => s + r.prospectsNeeded, 0);
                    const ratio = deals > 0 ? opps / deals : 0;
                    return (
                      <tr key={p.id} className="border-b border-gray-100">
                        <td className="py-2.5 font-medium text-gray-800">{p.name}</td>
                        <td className="py-2.5 text-right text-gray-700">{numFmt(deals)}</td>
                        <td className="py-2.5 text-right text-gray-700">{numFmt(opps)}</td>
                        <td className="py-2.5 text-right text-gray-700">{numFmt(prospects)}</td>
                        <td className="py-2.5 text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            ratio >= 3 ? "bg-green-100 text-green-700" :
                            ratio >= 2 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {ratio.toFixed(1)}x
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "channels" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Channel Contribution Share</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelBreakdown.map((ch) => ({ name: ch.label, value: ch.pct }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {channelBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(1)}%` : ""} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Prospects by Channel</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="prospects" name="Prospects" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Channel Performance Detail</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 font-medium text-gray-500">Channel</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Contribution %</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Prospects</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Opportunities</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Ranking</th>
                  </tr>
                </thead>
                <tbody>
                  {[...channelBreakdown]
                    .sort((a, b) => b.prospects - a.prospects)
                    .map((ch, i) => (
                      <tr key={ch.label} className="border-b border-gray-100">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[channelBreakdown.findIndex((c) => c.label === ch.label)] }} />
                            <span className="font-medium text-gray-800">{ch.label}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right text-gray-700">{ch.pct.toFixed(1)}%</td>
                        <td className="py-2.5 text-right text-gray-700">{numFmt(ch.prospects)}</td>
                        <td className="py-2.5 text-right text-gray-700">{numFmt(ch.opps)}</td>
                        <td className="py-2.5 text-right">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            i === 0 ? "bg-green-100 text-green-700" :
                            i === channelBreakdown.length - 1 ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            #{i + 1}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Channel Insights</h3>
            <div className="space-y-3 mt-4">
              {topChannel && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Strongest channel: {topChannel.label}</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Generating {topChannel.pct.toFixed(0)}% of your pipeline with {numFmt(topChannel.prospects)} prospects and {numFmt(topChannel.opps)} opportunities.
                    </p>
                  </div>
                </div>
              )}

              {channelBreakdown.length > 0 && (() => {
                const weakest = [...channelBreakdown].sort((a, b) => a.prospects - b.prospects)[0];
                return (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Weakest channel: {weakest.label}</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Only contributing {weakest.pct.toFixed(0)}% ({numFmt(weakest.prospects)} prospects). Consider investing more resources here or reallocating to stronger channels.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const sorted = [...channelBreakdown].sort((a, b) => b.pct - a.pct);
                const topPct = sorted[0]?.pct ?? 0;
                if (topPct > 50) {
                  return (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">High channel concentration risk</p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          {sorted[0].label} accounts for {topPct.toFixed(0)}% of your pipeline. Diversifying sources reduces risk if one channel underperforms.
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Well-diversified pipeline</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        No single channel exceeds 50% of your pipeline. This balanced mix reduces risk.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === "monthly" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue Forecast</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTotals}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => fmtCompact(v)} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number | undefined) => v !== undefined ? fmt(v) : ""} />
                  <Bar dataKey="grossRev" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Activity by Month</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pipelineByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="prospects" name="Prospects" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="opps" name="Opportunities" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="deals" name="Deals" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 font-medium text-gray-500">Month</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Revenue</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Units</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Pipeline Opps</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Pipeline Prospects</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTotals.map((mt, i) => (
                    <tr key={mt.month} className="border-b border-gray-100">
                      <td className="py-2.5 font-medium text-gray-800">{mt.label} 2026</td>
                      <td className="py-2.5 text-right text-gray-700">{fmt(mt.grossRev)}</td>
                      <td className="py-2.5 text-right text-gray-700">{numFmt(mt.totalUnits)}</td>
                      <td className="py-2.5 text-right text-gray-700">{numFmt(pipelineByMonth[i]?.opps ?? 0)}</td>
                      <td className="py-2.5 text-right text-gray-700">{numFmt(pipelineByMonth[i]?.prospects ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 font-semibold">
                    <td className="py-2.5 text-gray-800">Total</td>
                    <td className="py-2.5 text-right text-gray-800">{fmt(annualRevenue)}</td>
                    <td className="py-2.5 text-right text-gray-800">{numFmt(totalUnits)}</td>
                    <td className="py-2.5 text-right text-gray-800">{numFmt(totals.totalOpps)}</td>
                    <td className="py-2.5 text-right text-gray-800">{numFmt(totals.totalProspects)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
