"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store/context";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";
import {
  MONTHS_2026,
  MONTH_LABELS,
  forecastKey,
  variantForecastKey,
} from "@/lib/models/types";
import type { RevenueMode, Product, RevenueResult, ProductVariant } from "@/lib/models/types";
import { calcFullRevenue } from "@/lib/calc/revenue";
import { calcWorkbackRow } from "@/lib/calc/workback";
import { formatMonth } from "@/lib/calc/workback";
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
} from "recharts";
import {
  ArrowLeft,
  DollarSign,
  Package,
  TrendingUp,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

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

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function numFmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const PRODUCT_COLORS = [
  "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
  "#06B6D4", "#EF4444", "#84CC16", "#F97316", "#6366F1",
];

const CHANNEL_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981"];

const VARIANTS: ProductVariant[] = ["small", "medium", "large"];
const VARIANT_LABELS: Record<ProductVariant, string> = { small: "Small", medium: "Medium", large: "Large" };
const VARIANT_SHORT: Record<ProductVariant, string> = { small: "S", medium: "M", large: "L" };

const GA_MONTH_INDEX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function getGaMonthIndex(ga: string): number {
  return GA_MONTH_INDEX[ga] ?? 0;
}

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

interface VariantMonthData {
  variant: ProductVariant;
  months: { qty: number; result: RevenueResult | null }[];
  annualQty: number;
}

interface MonthlyProductData {
  product: Product;
  months: { qty: number; result: RevenueResult | null }[];
  annualQty: number;
  annualResult: RevenueResult | null;
  variantData?: VariantMonthData[];
}

type TabKey = "revenue" | "components" | "gp" | "pipeline" | "contribution";

export default function ForecastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const forecastId = params.id as string;
  const { state } = useStore();
  const { getForecast, setQty, setVariantQty, isLoaded } = useSavedForecasts();
  const [mode, setMode] = useState<RevenueMode>("net");
  const [activeTab, setActiveTab] = useState<TabKey>("revenue");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const forecast = getForecast(forecastId);
  const products = state.products;
  const quantities = forecast?.quantities ?? {};

  const toggleExpand = useCallback((productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const handleQtyDirect = useCallback(
    (productId: string, month: string, value: string) => {
      const parsed = parseInt(value, 10);
      setQty(forecastId, productId, month, isNaN(parsed) ? 0 : Math.max(0, parsed));
    },
    [forecastId, setQty]
  );

  const handleVariantQtyDirect = useCallback(
    (productId: string, variant: ProductVariant, month: string, value: string) => {
      const parsed = parseInt(value, 10);
      setVariantQty(forecastId, productId, variant, month, isNaN(parsed) ? 0 : Math.max(0, parsed));
    },
    [forecastId, setVariantQty]
  );

  const monthlyProductData: MonthlyProductData[] = useMemo(() => {
    return products.map((product) => {
      const gaIdx = getGaMonthIndex(product.generally_available);
      if (product.has_variants && product.variants) {
        const variantData: VariantMonthData[] = VARIANTS.map((variant) => {
          const variantProduct = { ...product, selected_variant: variant };
          let annualQty = 0;
          const months = MONTHS_2026.map((m, mi) => {
            const qty = mi < gaIdx ? 0 : (quantities[variantForecastKey(product.id, variant, m)] ?? 0);
            annualQty += qty;
            return {
              qty,
              result: qty > 0 ? calcFullRevenue(variantProduct, state.margins, qty) : null,
            };
          });
          return { variant, months, annualQty };
        });

        let annualQty = 0;
        const months = MONTHS_2026.map((_, mi) => {
          let totalQty = 0;
          const results: RevenueResult[] = [];
          for (const vd of variantData) {
            totalQty += vd.months[mi].qty;
            if (vd.months[mi].result) results.push(vd.months[mi].result!);
          }
          annualQty += totalQty;
          return {
            qty: totalQty,
            result: results.length > 0 ? mergeRevenueResults(results) : null,
          };
        });

        const allResults = months.filter((m) => m.result).map((m) => m.result!);
        return {
          product,
          months,
          annualQty,
          annualResult: allResults.length > 0 ? mergeRevenueResults(allResults) : null,
          variantData,
        };
      }

      let annualQty = 0;
      const months = MONTHS_2026.map((m, mi) => {
        const qty = mi < gaIdx ? 0 : (quantities[forecastKey(product.id, m)] ?? 0);
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
  }, [products, quantities, state.margins]);

  const monthlyTotals = useMemo(() => {
    return MONTHS_2026.map((_, mi) => {
      let grossRev = 0, netRev = 0, grossGP = 0, netGP = 0;
      let ps = 0, sr = 0, cc = 0, pss = 0;
      let gpPs = 0, gpSr = 0, gpCc = 0, gpPss = 0;
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
        pss += comp.pss;
        gpPs += gp.professional_services;
        gpSr += gp.software_resale;
        gpCc += gp.cloud_consumption;
        gpPss += gp.pss;
      }
      const rev = mode === "gross" ? grossRev : netRev;
      const totalGP = mode === "gross" ? grossGP : netGP;
      return { grossRev, netRev, grossGP, netGP, ps, sr, cc, pss, gpPs, gpSr, gpCc, gpPss, rev, totalGP };
    });
  }, [monthlyProductData, mode]);

  const annualTotals = useMemo(() => {
    const t = { grossRev: 0, netRev: 0, grossGP: 0, netGP: 0, ps: 0, sr: 0, cc: 0, pss: 0, gpPs: 0, gpSr: 0, gpCc: 0, gpPss: 0 };
    for (const mt of monthlyTotals) {
      t.grossRev += mt.grossRev;
      t.netRev += mt.netRev;
      t.grossGP += mt.grossGP;
      t.netGP += mt.netGP;
      t.ps += mt.ps;
      t.sr += mt.sr;
      t.cc += mt.cc;
      t.pss += mt.pss;
      t.gpPs += mt.gpPs;
      t.gpSr += mt.gpSr;
      t.gpCc += mt.gpCc;
      t.gpPss += mt.gpPss;
    }
    return { ...t, rev: mode === "gross" ? t.grossRev : t.netRev, totalGP: mode === "gross" ? t.grossGP : t.netGP };
  }, [monthlyTotals, mode]);

  const pipelineData = useMemo(() => {
    const rows: {
      productName: string;
      closeMonth: string;
      qty: number;
      dealsNeeded: number;
      oppsNeeded: number;
      prospectsNeeded: number;
      pipelineMonth: string;
      prospectingStart: string;
    }[] = [];
    for (const p of products) {
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
        const wb = calcWorkbackRow(p.id, p.name, m, qty, motion);
        rows.push({
          productName: p.name,
          closeMonth: m,
          qty,
          dealsNeeded: wb.deals_needed,
          oppsNeeded: wb.opps_needed,
          prospectsNeeded: wb.prospects_needed,
          pipelineMonth: wb.pipeline_month,
          prospectingStart: wb.prospecting_start_month,
        });
      }
    }
    return rows;
  }, [products, quantities, state.salesMotionByProductId]);

  const pipelineByMonth = useMemo(() => {
    const byMonth: Record<string, { opps: number; prospects: number; deals: number }> = {};
    for (const r of pipelineData) {
      if (!byMonth[r.pipelineMonth]) byMonth[r.pipelineMonth] = { opps: 0, prospects: 0, deals: 0 };
      byMonth[r.pipelineMonth].opps += r.oppsNeeded;
      byMonth[r.pipelineMonth].prospects += r.prospectsNeeded;
      byMonth[r.pipelineMonth].deals += r.dealsNeeded;
    }
    return byMonth;
  }, [pipelineData]);

  const contributionData = useMemo(() => {
    const pc = state.pipelineContribution;
    const totalProspects = pipelineData.reduce((sum, r) => sum + r.prospectsNeeded, 0);
    const totalOpps = pipelineData.reduce((sum, r) => sum + r.oppsNeeded, 0);
    if (pc.mode === "pct") {
      return {
        channels: [
          { label: "Website Inbound", pct: pc.website_inbound, prospects: Math.ceil(totalProspects * pc.website_inbound / 100), opps: Math.ceil(totalOpps * pc.website_inbound / 100) },
          { label: "Sales Team", pct: pc.sales_team_generated, prospects: Math.ceil(totalProspects * pc.sales_team_generated / 100), opps: Math.ceil(totalOpps * pc.sales_team_generated / 100) },
          { label: "Event Sourced", pct: pc.event_sourced, prospects: Math.ceil(totalProspects * pc.event_sourced / 100), opps: Math.ceil(totalOpps * pc.event_sourced / 100) },
          { label: "ABM/Thought Leadership", pct: pc.abm_thought_leadership, prospects: Math.ceil(totalProspects * pc.abm_thought_leadership / 100), opps: Math.ceil(totalOpps * pc.abm_thought_leadership / 100) },
          { label: "Partner Referral", pct: pc.partner_referral, prospects: Math.ceil(totalProspects * pc.partner_referral / 100), opps: Math.ceil(totalOpps * pc.partner_referral / 100) },
        ],
        totalProspects,
        totalOpps,
      };
    }
    const totalNum = pc.website_inbound + pc.sales_team_generated + pc.event_sourced + pc.abm_thought_leadership + pc.partner_referral;
    const pctOf = (v: number) => totalNum > 0 ? (v / totalNum) * 100 : 0;
    return {
      channels: [
        { label: "Website Inbound", pct: pctOf(pc.website_inbound), prospects: Math.ceil(totalProspects * pctOf(pc.website_inbound) / 100), opps: Math.ceil(totalOpps * pctOf(pc.website_inbound) / 100) },
        { label: "Sales Team", pct: pctOf(pc.sales_team_generated), prospects: Math.ceil(totalProspects * pctOf(pc.sales_team_generated) / 100), opps: Math.ceil(totalOpps * pctOf(pc.sales_team_generated) / 100) },
        { label: "Event Sourced", pct: pctOf(pc.event_sourced), prospects: Math.ceil(totalProspects * pctOf(pc.event_sourced) / 100), opps: Math.ceil(totalOpps * pctOf(pc.event_sourced) / 100) },
        { label: "ABM/Thought Leadership", pct: pctOf(pc.abm_thought_leadership), prospects: Math.ceil(totalProspects * pctOf(pc.abm_thought_leadership) / 100), opps: Math.ceil(totalOpps * pctOf(pc.abm_thought_leadership) / 100) },
        { label: "Partner Referral", pct: pctOf(pc.partner_referral), prospects: Math.ceil(totalProspects * pctOf(pc.partner_referral) / 100), opps: Math.ceil(totalOpps * pctOf(pc.partner_referral) / 100) },
      ],
      totalProspects,
      totalOpps,
    };
  }, [pipelineData, state.pipelineContribution]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="font-semibold text-gray-700 text-lg mb-2">Forecast not found</h2>
        <p className="text-sm text-gray-500 mb-4">This forecast may have been deleted.</p>
        <Link href="/forecast" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to forecasts
        </Link>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/forecast" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{forecast.name}</h1>
        </div>
        <div className="text-gray-500 p-12 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
          <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium mb-1">No products configured</p>
          <p className="text-sm">
            Go to{" "}
            <a href="/settings/products" className="text-blue-600 underline">Settings &gt; Products</a>{" "}
            to add products first.
          </p>
        </div>
      </div>
    );
  }

  const hasData = monthlyProductData.some((pd) => pd.annualQty > 0);
  const totalUnits = monthlyProductData.reduce((s, pd) => s + pd.annualQty, 0);
  const marginPct = annualTotals.rev > 0 ? (annualTotals.totalGP / annualTotals.rev) * 100 : 0;

  const revenueChartData = MONTH_LABELS.map((label, i) => ({
    month: label,
    revenue: monthlyTotals[i].rev,
    gp: monthlyTotals[i].totalGP,
  }));

  const componentChartData = [
    { name: "Prof. Services", value: annualTotals.ps, color: "#3B82F6" },
    { name: "Software Resale", value: annualTotals.sr, color: "#8B5CF6" },
    { name: "Cloud", value: annualTotals.cc, color: "#F59E0B" },
    { name: "PSS", value: annualTotals.pss, color: "#10B981" },
  ].filter(d => d.value > 0);

  const contributionChartData = contributionData.channels
    .map((ch, i) => ({ name: ch.label, value: ch.prospects, color: CHANNEL_COLORS[i] }))
    .filter(d => d.value > 0);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "revenue", label: "Revenue", icon: <DollarSign className="w-4 h-4" /> },
    { key: "components", label: "Components", icon: <Layers className="w-4 h-4" /> },
    { key: "gp", label: "Profit & Margin", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "pipeline", label: "Pipeline", icon: <Users className="w-4 h-4" /> },
    { key: "contribution", label: "Channels", icon: <PieChartIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/forecast" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{forecast.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Last updated {new Date(forecast.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setMode("gross")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${mode === "gross" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Gross
          </button>
          <button
            onClick={() => setMode("net")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${mode === "net" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Net
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<DollarSign className="w-5 h-5" />}
          label={`${mode === "gross" ? "Gross" : "Net"} Revenue`}
          value={hasData ? fmtCompact(annualTotals.rev) : "--"}
          color="blue"
        />
        <KpiCard
          icon={<Package className="w-5 h-5" />}
          label="Total Units"
          value={hasData ? totalUnits.toLocaleString() : "--"}
          color="purple"
        />
        <KpiCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Gross Profit"
          value={hasData ? fmtCompact(annualTotals.totalGP) : "--"}
          color="green"
        />
        <KpiCard
          icon={<Target className="w-5 h-5" />}
          label="Blended Margin"
          value={hasData ? pct(marginPct) : "--"}
          color="amber"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Product Quantities</h2>
          <p className="text-xs text-gray-400">Set units per month for each product</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 min-w-[180px] z-10">
                  Product
                </th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[72px]">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[72px] bg-gray-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, pi) => {
                const pd = monthlyProductData[pi];
                const isExpanded = expandedProducts.has(product.id);
                const hasVariants = product.has_variants && pd.variantData;
                const gaIdx = getGaMonthIndex(product.generally_available);
                return (
                  <React.Fragment key={product.id}>
                    <tr
                      className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${hasVariants ? "cursor-pointer" : ""}`}
                      onClick={hasVariants ? () => toggleExpand(product.id) : undefined}
                    >
                      <td className="px-4 py-3 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                          {hasVariants && (
                            <span className="text-gray-400 shrink-0">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                          )}
                          {!hasVariants && <span className="w-4" />}
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: PRODUCT_COLORS[pi % PRODUCT_COLORS.length] }}
                          />
                          <span className="font-medium text-sm text-gray-900 truncate">{product.name}</span>
                        </div>
                      </td>
                      {MONTHS_2026.map((m, mi) => {
                        const beforeGA = mi < gaIdx;
                        return (
                          <td key={m} className={`px-1 py-1.5 text-center ${beforeGA ? "bg-gray-100/50" : ""}`}>
                            {beforeGA ? (
                              <span className="text-[10px] font-medium text-gray-400">N/A</span>
                            ) : hasVariants ? (
                              <span className="text-sm font-medium text-gray-500 tabular-nums">
                                {pd.months[mi].qty || <span className="text-gray-300">0</span>}
                              </span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                value={(quantities[forecastKey(product.id, m)] ?? 0) || ""}
                                placeholder="0"
                                onChange={(e) => handleQtyDirect(product.id, m, e.target.value)}
                                className="w-14 text-center text-sm font-medium bg-gray-50 border border-gray-200 rounded-md py-1.5 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 text-center bg-gray-50">
                        <span className="font-semibold text-sm text-gray-900">{pd.annualQty}</span>
                      </td>
                    </tr>
                    {hasVariants && isExpanded && pd.variantData!.map((vd) => {
                      const variantPricing = product.variants![vd.variant];
                      const isNA = variantPricing.gross_annual_price === 0 && variantPricing.user_count?.toLowerCase().includes("n/a");
                      return (
                        <tr key={`${product.id}-${vd.variant}`} className="border-b border-gray-50 bg-gray-50/40">
                          <td className="pl-14 pr-4 py-2 sticky left-0 bg-gray-50/40 z-10">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold bg-gray-200 text-gray-600">
                                {VARIANT_SHORT[vd.variant]}
                              </span>
                              <span className="text-xs text-gray-600">{VARIANT_LABELS[vd.variant]}</span>
                              {isNA && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">N/A</span>}
                              {!isNA && variantPricing.gross_annual_price > 0 && (
                                <span className="text-[10px] text-gray-400">{fmtCompact(variantPricing.gross_annual_price)}</span>
                              )}
                            </div>
                          </td>
                          {MONTHS_2026.map((m, mi) => {
                            const beforeGA = mi < gaIdx;
                            const qty = quantities[variantForecastKey(product.id, vd.variant, m)] ?? 0;
                            return (
                              <td key={m} className={`px-1 py-1 text-center ${beforeGA ? "bg-gray-100/50" : ""}`}>
                                {beforeGA ? (
                                  <span className="text-[10px] font-medium text-gray-400">N/A</span>
                                ) : isNA ? (
                                  <span className="text-gray-300 text-xs">-</span>
                                ) : (
                                  <input
                                    type="number"
                                    min={0}
                                    value={qty || ""}
                                    placeholder="0"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleVariantQtyDirect(product.id, vd.variant, m, e.target.value)}
                                    className="w-14 text-center text-xs font-medium bg-white border border-gray-200 rounded-md py-1 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                )}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2 text-center bg-gray-100/50">
                            <span className="font-medium text-xs text-gray-600">{vd.annualQty}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3 sticky left-0 bg-gray-50 z-10 text-sm text-gray-700">
                  <div className="flex items-center gap-2"><span className="w-4" />Total</div>
                </td>
                {MONTHS_2026.map((m, mi) => (
                  <td key={m} className="px-2 py-3 text-center text-sm text-gray-700">
                    {monthlyProductData.reduce((s, pd) => s + pd.months[mi].qty, 0)}
                  </td>
                ))}
                <td className="px-3 py-3 text-center text-sm text-gray-900 bg-gray-100">{totalUnits}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {hasData && (
        <div>
          <div className="flex items-center gap-2 border-b border-gray-200 mb-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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

          <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-t-0 border-gray-200">
            {activeTab === "revenue" && (
              <div className="p-5 space-y-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData} barCategoryGap="20%">
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmtCompact(v)} />
                      <Tooltip
                        formatter={(value: number | undefined) => value != null ? fmt(value) : ""}
                        labelStyle={{ fontWeight: 600 }}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
                      />
                      <Bar dataKey="revenue" name={`${mode === "gross" ? "Gross" : "Net"} Revenue`} fill="#3B82F6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="gp" name="Gross Profit" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-3 py-2.5 text-left font-medium text-gray-500 sticky left-0 bg-white min-w-[160px]">Product</th>
                        {MONTH_LABELS.map((m) => (
                          <th key={m} className="px-3 py-2.5 text-right font-medium text-gray-500 min-w-[90px]">{m}</th>
                        ))}
                        <th className="px-3 py-2.5 text-right font-medium text-gray-500 min-w-[100px] bg-gray-50">Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyProductData.map((pd, i) => (
                        <tr key={pd.product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-2.5 font-medium sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRODUCT_COLORS[i % PRODUCT_COLORS.length] }} />
                              {pd.product.name}
                            </div>
                          </td>
                          {pd.months.map((m, mi) => {
                            const rev = m.result ? (mode === "gross" ? m.result.gross_revenue : m.result.net_revenue) : 0;
                            return (
                              <td key={mi} className="px-3 py-2.5 text-right tabular-nums">
                                {m.qty > 0 ? fmt(rev) : <span className="text-gray-300">-</span>}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2.5 text-right font-semibold bg-gray-50 tabular-nums">
                            {pd.annualResult ? fmt(mode === "gross" ? pd.annualResult.gross_revenue : pd.annualResult.net_revenue) : <span className="text-gray-300">-</span>}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-50">
                        <td className="px-3 py-2.5 sticky left-0 bg-gray-50">Total</td>
                        {monthlyTotals.map((mt, mi) => (
                          <td key={mi} className="px-3 py-2.5 text-right tabular-nums">{fmt(mt.rev)}</td>
                        ))}
                        <td className="px-3 py-2.5 text-right tabular-nums bg-gray-100">{fmt(annualTotals.rev)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "components" && (
              <div className="p-5 space-y-6">
                {componentChartData.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={componentChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {componentChartData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number | undefined) => value != null ? fmt(value) : ""} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                      {componentChartData.map((comp) => (
                        <div key={comp.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.color }} />
                            <span className="text-sm text-gray-700">{comp.name}</span>
                          </div>
                          <span className="font-semibold text-sm">{fmt(comp.value)}</span>
                        </div>
                      ))}
                      <hr className="border-gray-200" />
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-sm text-gray-700">Total</span>
                        <span className="text-sm">{fmt(annualTotals.rev)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-3 py-2.5 text-left font-medium text-gray-500 sticky left-0 bg-white min-w-[160px]">Component</th>
                        {MONTH_LABELS.map((m) => (
                          <th key={m} className="px-3 py-2.5 text-right font-medium text-gray-500 min-w-[90px]">{m}</th>
                        ))}
                        <th className="px-3 py-2.5 text-right font-medium text-gray-500 min-w-[100px] bg-gray-50">Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Professional Services", key: "ps" as const, color: "#3B82F6" },
                        { label: "Software Resale", key: "sr" as const, color: "#8B5CF6" },
                        { label: "Cloud Consumption", key: "cc" as const, color: "#F59E0B" },
                        { label: "PSS", key: "pss" as const, color: "#10B981" },
                      ].map((comp) => (
                        <tr key={comp.key} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-2.5 font-medium sticky left-0 bg-white">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: comp.color }} />
                              {comp.label}
                            </div>
                          </td>
                          {monthlyTotals.map((mt, mi) => (
                            <td key={mi} className="px-3 py-2.5 text-right tabular-nums">{fmt(mt[comp.key])}</td>
                          ))}
                          <td className="px-3 py-2.5 text-right font-semibold bg-gray-50 tabular-nums">{fmt(annualTotals[comp.key])}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-50">
                        <td className="px-3 py-2.5 sticky left-0 bg-gray-50">Total Revenue</td>
                        {monthlyTotals.map((mt, mi) => (
                          <td key={mi} className="px-3 py-2.5 text-right tabular-nums">{fmt(mt.rev)}</td>
                        ))}
                        <td className="px-3 py-2.5 text-right tabular-nums bg-gray-100">{fmt(annualTotals.rev)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "gp" && (
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "PS GP$", value: annualTotals.gpPs, color: "#3B82F6" },
                    { label: "Resale GP$", value: annualTotals.gpSr, color: "#8B5CF6" },
                    { label: "Cloud GP$", value: annualTotals.gpCc, color: "#F59E0B" },
                    { label: "PSS GP$", value: annualTotals.gpPss, color: "#10B981" },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-500">{item.label}</span>
                      </div>
                      <div className="font-semibold text-lg">{fmtCompact(item.value)}</div>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-3 py-2.5 text-left font-medium text-gray-500 sticky left-0 bg-white min-w-[160px]">Metric</th>
                        {MONTH_LABELS.map((m) => (
                          <th key={m} className="px-3 py-2.5 text-right font-medium text-gray-500 min-w-[90px]">{m}</th>
                        ))}
                        <th className="px-3 py-2.5 text-right font-medium text-gray-500 min-w-[100px] bg-gray-50">Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "PS GP$", key: "gpPs" as const },
                        { label: "Resale GP$", key: "gpSr" as const },
                        { label: "Cloud GP$", key: "gpCc" as const },
                        { label: "PSS GP$", key: "gpPss" as const },
                      ].map((row) => (
                        <tr key={row.key} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-2.5 font-medium sticky left-0 bg-white">{row.label}</td>
                          {monthlyTotals.map((mt, mi) => (
                            <td key={mi} className="px-3 py-2.5 text-right tabular-nums">{fmt(mt[row.key])}</td>
                          ))}
                          <td className="px-3 py-2.5 text-right font-semibold bg-gray-50 tabular-nums">{fmt(annualTotals[row.key])}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-50">
                        <td className="px-3 py-2.5 sticky left-0 bg-gray-50">Total GP$</td>
                        {monthlyTotals.map((mt, mi) => (
                          <td key={mi} className="px-3 py-2.5 text-right tabular-nums">{fmt(mt.totalGP)}</td>
                        ))}
                        <td className="px-3 py-2.5 text-right tabular-nums bg-gray-100">{fmt(annualTotals.totalGP)}</td>
                      </tr>
                      <tr className="font-semibold bg-blue-50/50">
                        <td className="px-3 py-2.5 sticky left-0 bg-blue-50/50">Blended Margin %</td>
                        {monthlyTotals.map((mt, mi) => (
                          <td key={mi} className="px-3 py-2.5 text-right tabular-nums">
                            {mt.rev > 0 ? pct((mt.totalGP / mt.rev) * 100) : <span className="text-gray-300">-</span>}
                          </td>
                        ))}
                        <td className="px-3 py-2.5 text-right tabular-nums bg-blue-100/50">
                          {annualTotals.rev > 0 ? pct((annualTotals.totalGP / annualTotals.rev) * 100) : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "pipeline" && (
              <div className="p-5 space-y-6">
                {pipelineData.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-xs text-blue-600 font-medium mb-1">Total Deals</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {numFmt(pipelineData.reduce((s, r) => s + r.dealsNeeded, 0))}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <div className="text-xs text-purple-600 font-medium mb-1">Opps Needed</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {numFmt(pipelineData.reduce((s, r) => s + r.oppsNeeded, 0))}
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                      <div className="text-xs text-amber-600 font-medium mb-1">Prospects Needed</div>
                      <div className="text-2xl font-bold text-amber-700">
                        {numFmt(pipelineData.reduce((s, r) => s + r.prospectsNeeded, 0))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-3 py-2.5 text-left font-medium text-gray-500">Product</th>
                        <th className="px-3 py-2.5 text-left font-medium text-gray-500">Close Month</th>
                        <th className="px-3 py-2.5 text-right font-medium text-gray-500">Deals</th>
                        <th className="px-3 py-2.5 text-right font-medium text-gray-500">Opps Needed</th>
                        <th className="px-3 py-2.5 text-right font-medium text-gray-500">Prospects</th>
                        <th className="px-3 py-2.5 text-left font-medium text-gray-500">Pipeline Start</th>
                        <th className="px-3 py-2.5 text-left font-medium text-gray-500">Prospecting Start</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pipelineData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                            Enter quantities above to see pipeline requirements.
                          </td>
                        </tr>
                      ) : (
                        pipelineData.map((r, i) => {
                          const pipelineBefore = r.pipelineMonth < "2026-01";
                          const prospectBefore = r.prospectingStart < "2026-01";
                          return (
                            <tr key={`${r.productName}-${r.closeMonth}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="px-3 py-2.5 font-medium">{r.productName}</td>
                              <td className="px-3 py-2.5">{formatMonth(r.closeMonth)}</td>
                              <td className="px-3 py-2.5 text-right tabular-nums">{numFmt(r.dealsNeeded)}</td>
                              <td className="px-3 py-2.5 text-right tabular-nums">{numFmt(r.oppsNeeded)}</td>
                              <td className="px-3 py-2.5 text-right tabular-nums">{numFmt(r.prospectsNeeded)}</td>
                              <td className={`px-3 py-2.5 ${pipelineBefore ? "text-orange-600 font-medium" : ""}`}>
                                {formatMonth(r.pipelineMonth)}
                                {pipelineBefore && <span className="text-[10px] ml-1 bg-orange-100 px-1.5 py-0.5 rounded-full">pre-FY</span>}
                              </td>
                              <td className={`px-3 py-2.5 ${prospectBefore ? "text-orange-600 font-medium" : ""}`}>
                                {formatMonth(r.prospectingStart)}
                                {prospectBefore && <span className="text-[10px] ml-1 bg-orange-100 px-1.5 py-0.5 rounded-full">pre-FY</span>}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {Object.keys(pipelineByMonth).length > 0 && (
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="font-semibold text-sm mb-3 text-gray-700">Pipeline Summary by Month</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-3 py-2.5 text-left font-medium text-gray-500">Pipeline Month</th>
                            <th className="px-3 py-2.5 text-right font-medium text-gray-500">Total Opps</th>
                            <th className="px-3 py-2.5 text-right font-medium text-gray-500">Total Prospects</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(pipelineByMonth)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([month, data], i) => {
                              const before = month < "2026-01";
                              return (
                                <tr key={month} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                  <td className={`px-3 py-2.5 ${before ? "text-orange-600 font-medium" : ""}`}>
                                    {formatMonth(month)}
                                    {before && <span className="text-[10px] ml-1 bg-orange-100 px-1.5 py-0.5 rounded-full">pre-FY</span>}
                                  </td>
                                  <td className="px-3 py-2.5 text-right tabular-nums">{numFmt(data.opps)}</td>
                                  <td className="px-3 py-2.5 text-right tabular-nums">{numFmt(data.prospects)}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "contribution" && (
              <div className="p-5 space-y-6">
                <p className="text-sm text-gray-500">
                  Pipeline requirements broken down by channel based on your contribution settings.
                </p>

                {contributionChartData.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={contributionChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }: { name: string; percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                          >
                            {contributionChartData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number | undefined) => value != null ? numFmt(value) : ""} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                      {contributionData.channels.map((ch, i) => (
                        <div key={ch.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[i] }} />
                            <span className="text-sm font-medium text-gray-700">{ch.label}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">{numFmt(ch.prospects)} prospects</div>
                            <div className="text-xs text-gray-500">{pct(ch.pct)} share</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-3 py-2.5 text-left font-medium text-gray-500">Channel</th>
                        <th className="px-3 py-2.5 text-right font-medium text-gray-500">Contribution %</th>
                        <th className="px-3 py-2.5 text-right font-medium text-gray-500">Prospects</th>
                        <th className="px-3 py-2.5 text-right font-medium text-gray-500">Opps</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributionData.channels.map((ch, i) => (
                        <tr key={ch.label} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-2.5 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[i] }} />
                              {ch.label}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{pct(ch.pct)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{numFmt(ch.prospects)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{numFmt(ch.opps)}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-50">
                        <td className="px-3 py-2.5">Total</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">100.0%</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{numFmt(contributionData.totalProspects)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{numFmt(contributionData.totalOpps)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!hasData && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-gray-500 font-medium">Set product quantities above to see your forecast analysis</p>
          <p className="text-gray-400 text-sm mt-1">Revenue, profit, pipeline, and channel breakdowns will appear here</p>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "purple" | "green" | "amber";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
    </div>
  );
}
