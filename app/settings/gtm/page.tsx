"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useStore } from "@/lib/store/context";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";
import {
  MONTHS_2026,
  MONTH_LABELS,
  STANDARD_DELIVERABLES,
  forecastKey,
  variantForecastKey,
} from "@/lib/models/types";
import type {
  Product,
  ProductVariant,
  SalesMotion,
  LaunchRequirement,
} from "@/lib/models/types";
import {
  calcOppsNeeded,
  calcProspectsNeeded,
  calcPipelineMonth,
  calcProspectingStartMonth,
} from "@/lib/calc/workback";
import { calcFullRevenue } from "@/lib/calc/revenue";
import {
  ChevronDown,
  ChevronRight,
  Target,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  Megaphone,
  ShoppingCart,
  Truck,
  HeadphonesIcon,
  Package,
  Rocket,
  TrendingUp,
  Filter,
  AlertTriangle,
  HandshakeIcon,
  Link2,
} from "lucide-react";

const VARIANTS: ProductVariant[] = ["small", "medium", "large"];

const GA_MONTH_INDEX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

const PILLAR_CONFIG = [
  { name: "Product", prefix: "Product", color: "blue", icon: Package },
  { name: "Marketing", prefix: "Marketing", color: "purple", icon: Megaphone },
  { name: "Sales", prefix: "Sales", color: "green", icon: ShoppingCart },
  { name: "Delivery", prefix: "Delivery", color: "amber", icon: Truck },
  { name: "Support & Ops", prefix: "Support", color: "red", icon: HeadphonesIcon },
];

const PILLAR_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
  red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700" },
};

function getDeliverablesByPillar(pillarPrefix: string): string[] {
  return STANDARD_DELIVERABLES.filter((d) => {
    if (pillarPrefix === "Product") return d.startsWith("Product");
    if (pillarPrefix === "Marketing") return d.startsWith("Marketing");
    if (pillarPrefix === "Sales") return d.startsWith("Sales");
    if (pillarPrefix === "Delivery") return d.startsWith("Delivery");
    if (pillarPrefix === "Support") return d.startsWith("Support");
    return false;
  });
}

function isDeliverableComplete(req: LaunchRequirement): boolean {
  return !!req.complete;
}

function getDealsForMonth(
  product: Product,
  month: string,
  quantities: Record<string, number>,
): number {
  let deals = 0;
  if (product.has_variants && product.variants) {
    for (const v of VARIANTS) {
      deals += quantities[variantForecastKey(product.id, v, month)] || 0;
    }
  } else {
    deals += quantities[forecastKey(product.id, month)] || 0;
  }
  return deals;
}

const CRITICAL_DEPENDENCIES = [
  { deliverable: "General Availability (GA)", label: "Product Launched", category: "Product" },
  { deliverable: "Product Pricing", label: "Pricing Defined", category: "Product" },
  { deliverable: "Marketing - ICP", label: "ICP Defined", category: "Marketing" },
  { deliverable: "Marketing - Customer Content", label: "Customer Content", category: "Marketing" },
  { deliverable: "Marketing - Digital Campaigns", label: "Campaigns Live", category: "Marketing" },
  { deliverable: "Marketing - Website", label: "Website Ready", category: "Marketing" },
  { deliverable: "Sales - Pipeline Building", label: "Pipeline Building", category: "Sales" },
  { deliverable: "Delivery - Technical Readiness", label: "Tech Ready", category: "Delivery" },
];

interface ProductGTMData {
  product: Product;
  motion: SalesMotion;
  gaMonthIndex: number;
  totalDeals: number;
  totalGrossRevenue: number;
  monthlyBreakdown: {
    month: string;
    monthIndex: number;
    deals: number;
    oppsNeeded: number;
    prospectsNeeded: number;
    pipelineMonth: string;
    pipelineMonthIndex: number;
    prospectingStart: string;
    prospectingStartIndex: number;
  }[];
  readiness: LaunchRequirement[];
  readinessComplete: number;
  readinessTotal: number;
}

export default function GTMPage() {
  const { state, isLoaded: storeLoaded, updateLaunchRequirements } = useStore();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const { forecasts, isLoaded: forecastsLoaded } = useSavedForecasts();
  const [selectedForecastId, setSelectedForecastId] = useState<string>("");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const getReqs = useCallback(
    (productId: string): LaunchRequirement[] => {
      if (state.launchRequirements[productId]) {
        return state.launchRequirements[productId];
      }
      return STANDARD_DELIVERABLES.map((d) => ({
        deliverable: d,
        owner: "",
        criticalPath: "",
        timeline: "",
        content: "",
        dependency: "",
        complete: false,
      }));
    },
    [state.launchRequirements],
  );

  const updateField = useCallback(
    (productId: string, deliverable: string, field: keyof LaunchRequirement, value: string) => {
      const reqs = getReqs(productId).map((r) =>
        r.deliverable === deliverable ? { ...r, [field]: value } : r,
      );
      updateLaunchRequirements(productId, reqs);
    },
    [getReqs, updateLaunchRequirements],
  );

  const selectedForecast = useMemo(() => {
    if (selectedForecastId) return forecasts.find((f) => f.id === selectedForecastId);
    return forecasts[0];
  }, [selectedForecastId, forecasts]);

  const gtmData = useMemo<ProductGTMData[]>(() => {
    if (!state.products.length) return [];

    const quantities = selectedForecast?.quantities || {};

    return state.products
      .filter((p) => p.status === "live")
      .map((product) => {
        const motion = state.salesMotionByProductId[product.id] || state.industryAverages;
        const gaIdx = GA_MONTH_INDEX[product.generally_available] ?? 0;

        const monthlyBreakdown: ProductGTMData["monthlyBreakdown"] = [];
        let totalDeals = 0;

        for (let mi = 0; mi < 12; mi++) {
          const month = MONTHS_2026[mi];
          const deals = getDealsForMonth(product, month, quantities);

          if (deals > 0) {
            totalDeals += deals;
            const oppsNeeded = calcOppsNeeded(deals, motion.opp_to_close_win_rate_pct);
            const prospectsNeeded = calcProspectsNeeded(oppsNeeded, motion.prospect_to_opp_rate_pct);
            const pipelineMonth = calcPipelineMonth(month, motion.sales_cycle_months);
            const prospectingStart = calcProspectingStartMonth(pipelineMonth, motion.prospecting_lead_time_months);

            const pmParts = pipelineMonth.split("-").map(Number);
            const psParts = prospectingStart.split("-").map(Number);

            monthlyBreakdown.push({
              month,
              monthIndex: mi,
              deals,
              oppsNeeded,
              prospectsNeeded,
              pipelineMonth,
              pipelineMonthIndex: pmParts[0] === 2026 ? pmParts[1] - 1 : pmParts[1] - 1 - 12,
              prospectingStart,
              prospectingStartIndex: psParts[0] === 2026 ? psParts[1] - 1 : psParts[1] - 1 - 12,
            });
          }
        }

        let totalGrossRevenue = 0;
        for (let mi = 0; mi < 12; mi++) {
          const month = MONTHS_2026[mi];
          if (product.has_variants && product.variants) {
            for (const v of VARIANTS) {
              const qty = quantities[variantForecastKey(product.id, v, month)] || 0;
              if (qty > 0) {
                const variantProduct = { ...product, selected_variant: v };
                const result = calcFullRevenue(variantProduct, state.margins, qty);
                totalGrossRevenue += result.gross_revenue;
              }
            }
          } else {
            const qty = quantities[forecastKey(product.id, month)] || 0;
            if (qty > 0) {
              const result = calcFullRevenue(product, state.margins, qty);
              totalGrossRevenue += result.gross_revenue;
            }
          }
        }

        const reqs = state.launchRequirements?.[product.id] || [];
        const readinessComplete = reqs.filter(isDeliverableComplete).length;

        return {
          product,
          motion,
          gaMonthIndex: gaIdx,
          totalDeals,
          totalGrossRevenue,
          monthlyBreakdown,
          readiness: reqs,
          readinessComplete: readinessComplete,
          readinessTotal: reqs.length || STANDARD_DELIVERABLES.length,
        };
      })
      .sort((a, b) => a.gaMonthIndex - b.gaMonthIndex);
  }, [selectedForecast, state]);

  const summaryStats = useMemo(() => {
    let totalDeals = 0;
    let totalOpps = 0;
    let totalProspects = 0;
    let productsWithDeals = 0;
    let earliestProspecting = 12;

    for (const d of gtmData) {
      totalDeals += d.totalDeals;
      if (d.totalDeals > 0) productsWithDeals++;
      for (const mb of d.monthlyBreakdown) {
        totalOpps += mb.oppsNeeded;
        totalProspects += mb.prospectsNeeded;
        if (mb.prospectingStartIndex < earliestProspecting) {
          earliestProspecting = mb.prospectingStartIndex;
        }
      }
    }

    return { totalDeals, totalOpps, totalProspects, productsWithDeals, earliestProspecting };
  }, [gtmData]);

  const toggleProduct = (id: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedProducts(new Set());
    } else {
      setExpandedProducts(new Set(gtmData.map((d) => d.product.id)));
    }
    setExpandAll(!expandAll);
  };

  if (!storeLoaded || !forecastsLoaded) {
    return (
      <div className="max-w-[1400px] mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 text-sm">Loading GTM data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GTM Readiness</h1>
          <p className="text-gray-500 text-sm mt-1">
            Go-to-market workback analysis. For each product, see what needs to be true — pipeline requirements, timing dependencies, and launch readiness — to close forecasted deals.
          </p>
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedForecastId || selectedForecast?.id || ""}
            onChange={(e) => setSelectedForecastId(e.target.value)}
          >
            {forecasts.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Target className="w-5 h-5" />}
          label="Total Deals Forecasted"
          value={summaryStats.totalDeals.toString()}
          color="blue"
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Opportunities Required"
          value={summaryStats.totalOpps.toString()}
          color="amber"
        />
        <SummaryCard
          icon={<Users className="w-5 h-5" />}
          label="Prospects Required"
          value={summaryStats.totalProspects.toString()}
          color="green"
        />
        <SummaryCard
          icon={<Rocket className="w-5 h-5" />}
          label="Products with Deals"
          value={`${summaryStats.productsWithDeals} / ${gtmData.length}`}
          color="purple"
        />
      </div>

      <RevenueAtRisk data={gtmData} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Product GTM Workback</h2>
        <button
          onClick={handleExpandAll}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <Filter className="w-4 h-4" />
          {expandAll ? "Collapse All" : "Expand All"}
        </button>
      </div>

      <div className="space-y-3">
        {gtmData.map((data) => (
          <ProductGTMCard
            key={data.product.id}
            data={data}
            expanded={expandedProducts.has(data.product.id)}
            onToggle={() => toggleProduct(data.product.id)}
            allReqs={getReqs(data.product.id)}
            updateField={updateField}
            editingCell={editingCell}
            setEditingCell={setEditingCell}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "amber" | "green" | "purple";
}) {
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "bg-blue-100 text-blue-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", icon: "bg-amber-100 text-amber-600" },
    green: { bg: "bg-green-50", text: "text-green-600", icon: "bg-green-100 text-green-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "bg-purple-100 text-purple-600" },
  };
  const c = colors[color];
  return (
    <div className={`${c.bg} rounded-xl p-4 border border-gray-100`}>
      <div className={`w-8 h-8 rounded-lg ${c.icon} flex items-center justify-center mb-2`}>{icon}</div>
      <div className={`text-2xl font-bold ${c.text}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function ProductGTMCard({
  data,
  expanded,
  onToggle,
  allReqs,
  updateField,
  editingCell,
  setEditingCell,
}: {
  data: ProductGTMData;
  expanded: boolean;
  onToggle: () => void;
  allReqs: LaunchRequirement[];
  updateField: (productId: string, deliverable: string, field: keyof LaunchRequirement, value: string) => void;
  editingCell: string | null;
  setEditingCell: (key: string | null) => void;
}) {
  const { product, motion, gaMonthIndex, totalDeals, monthlyBreakdown, readiness, readinessComplete, readinessTotal } = data;
  const gaLabel = MONTH_LABELS[gaMonthIndex] || "TBD";
  const readinessPct = readinessTotal > 0 ? Math.round((readinessComplete / readinessTotal) * 100) : 0;

  const hasDeals = totalDeals > 0;
  const firstCloseMonth = monthlyBreakdown.length > 0 ? monthlyBreakdown[0].monthIndex : -1;
  const earliestProspecting = monthlyBreakdown.length > 0
    ? Math.min(...monthlyBreakdown.map((m) => m.prospectingStartIndex))
    : -1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}

        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">{product.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              GA: {product.generally_available}
            </span>
            {hasDeals && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {totalDeals} deal{totalDeals !== 1 ? "s" : ""} forecasted
              </span>
            )}
            {!hasDeals && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                No deals forecasted
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {PILLAR_CONFIG.map((pillar) => {
              const deliverables = getDeliverablesByPillar(pillar.prefix);
              const done = deliverables.filter((d) => {
                const req = readiness.find((r) => r.deliverable === d);
                return req ? isDeliverableComplete(req) : false;
              }).length;
              const total = deliverables.length;
              const pct = total > 0 ? done / total : 0;
              const pc = PILLAR_COLORS[pillar.color];
              return (
                <div
                  key={pillar.name}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    pct === 1
                      ? "bg-green-100 text-green-700"
                      : pct > 0
                      ? `${pc.badge}`
                      : "bg-gray-100 text-gray-400"
                  }`}
                  title={`${pillar.name}: ${done}/${total}`}
                >
                  {pct === 1 ? "✓" : `${done}`}
                </div>
              );
            })}
          </div>

          <div className="w-20">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Ready</span>
              <span>{readinessPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  readinessPct === 100
                    ? "bg-green-500"
                    : readinessPct > 50
                    ? "bg-blue-500"
                    : readinessPct > 0
                    ? "bg-amber-500"
                    : "bg-gray-300"
                }`}
                style={{ width: `${readinessPct}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PipelineWorkback data={data} />
            <TimelineView data={data} />
          </div>

          <ReadinessActivities
            productId={product.id}
            allReqs={allReqs}
            updateField={updateField}
            editingCell={editingCell}
            setEditingCell={setEditingCell}
          />
        </div>
      )}
    </div>
  );
}

function PipelineWorkback({ data }: { data: ProductGTMData }) {
  const { product, motion, monthlyBreakdown, totalDeals } = data;

  if (!totalDeals) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" /> Pipeline Requirements
        </h3>
        <p className="text-sm text-gray-500">No deals forecasted for this product. Add deals in Forecast Modelling to see pipeline requirements.</p>
      </div>
    );
  }

  const totalOpps = monthlyBreakdown.reduce((s, m) => s + m.oppsNeeded, 0);
  const totalProspects = monthlyBreakdown.reduce((s, m) => s + m.prospectsNeeded, 0);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Target className="w-4 h-4" /> Pipeline Requirements
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
          <div className="text-lg font-bold text-blue-600">{totalDeals}</div>
          <div className="text-xs text-gray-500">Deals</div>
        </div>
        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
          <div className="text-lg font-bold text-amber-600">{totalOpps}</div>
          <div className="text-xs text-gray-500">Opportunities</div>
        </div>
        <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
          <div className="text-lg font-bold text-green-600">{totalProspects}</div>
          <div className="text-xs text-gray-500">Prospects</div>
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-600 mb-3">
        <div className="flex justify-between">
          <span>Sales Cycle</span>
          <span className="font-medium">{motion.sales_cycle_months} months</span>
        </div>
        <div className="flex justify-between">
          <span>Win Rate (Opp → Deal)</span>
          <span className="font-medium">{motion.opp_to_close_win_rate_pct}%</span>
        </div>
        <div className="flex justify-between">
          <span>Conversion (Prospect → Opp)</span>
          <span className="font-medium">{motion.prospect_to_opp_rate_pct}%</span>
        </div>
        <div className="flex justify-between">
          <span>Prospecting Lead Time</span>
          <span className="font-medium">{motion.prospecting_lead_time_months} month{motion.prospecting_lead_time_months !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1.5 text-gray-500 font-medium">Close Month</th>
              <th className="text-right py-1.5 text-gray-500 font-medium">Deals</th>
              <th className="text-right py-1.5 text-gray-500 font-medium">Opps</th>
              <th className="text-right py-1.5 text-gray-500 font-medium">Prospects</th>
              <th className="text-left py-1.5 text-gray-500 font-medium pl-3">Pipeline By</th>
              <th className="text-left py-1.5 text-gray-500 font-medium">Prospect By</th>
            </tr>
          </thead>
          <tbody>
            {monthlyBreakdown.map((mb) => (
              <tr key={mb.month} className="border-b border-gray-100">
                <td className="py-1.5 font-medium text-gray-900">{MONTH_LABELS[mb.monthIndex]}</td>
                <td className="py-1.5 text-right text-blue-600 font-semibold">{mb.deals}</td>
                <td className="py-1.5 text-right text-amber-600">{mb.oppsNeeded}</td>
                <td className="py-1.5 text-right text-green-600">{mb.prospectsNeeded}</td>
                <td className="py-1.5 pl-3">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    mb.pipelineMonthIndex < 0 ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {formatMonthLabel(mb.pipelineMonth)}
                  </span>
                </td>
                <td className="py-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    mb.prospectingStartIndex < 0 ? "bg-red-100 text-red-700" : "bg-green-50 text-green-700"
                  }`}>
                    {formatMonthLabel(mb.prospectingStart)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (y < 2026) return `${labels[m - 1]} ${y} ⚠`;
  return `${labels[m - 1]}`;
}

function TimelineView({ data }: { data: ProductGTMData }) {
  const { product, gaMonthIndex, monthlyBreakdown, motion } = data;

  const phases: { label: string; start: number; end: number; color: string }[] = [];

  if (monthlyBreakdown.length > 0) {
    const earliestProspect = Math.min(...monthlyBreakdown.map((m) => m.prospectingStartIndex));
    const earliestPipeline = Math.min(...monthlyBreakdown.map((m) => m.pipelineMonthIndex));
    const firstClose = monthlyBreakdown[0].monthIndex;
    const lastClose = monthlyBreakdown[monthlyBreakdown.length - 1].monthIndex;

    if (earliestProspect >= 0) {
      phases.push({
        label: "Prospecting",
        start: Math.max(0, earliestProspect),
        end: Math.max(0, earliestPipeline),
        color: "bg-green-400",
      });
    }
    if (earliestPipeline >= 0) {
      phases.push({
        label: "Pipeline Building",
        start: Math.max(0, earliestPipeline),
        end: firstClose,
        color: "bg-amber-400",
      });
    }
    phases.push({
      label: "Closing Deals",
      start: firstClose,
      end: lastClose + 1,
      color: "bg-blue-500",
    });
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4" /> Timeline
      </h3>

      <div className="space-y-2">
        <div className="flex text-xs text-gray-400">
          {MONTH_LABELS.map((m) => (
            <div key={m} className="flex-1 text-center">{m}</div>
          ))}
        </div>

        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden flex">
          {MONTH_LABELS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 border-r border-gray-300/30 ${
                i === gaMonthIndex ? "bg-gray-400/30" : ""
              }`}
            />
          ))}
        </div>

        {gaMonthIndex >= 0 && (
          <div className="relative h-0">
            <div
              className="absolute -top-8 flex flex-col items-center"
              style={{ left: `${((gaMonthIndex + 0.5) / 12) * 100}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-0.5 h-3 bg-red-500" />
              <div className="text-[10px] text-red-600 font-semibold whitespace-nowrap mt-0.5">GA</div>
            </div>
          </div>
        )}

        {phases.map((phase, i) => (
          <div key={i} className="relative">
            <div className="flex items-center gap-2">
              <div className="relative h-4 flex-1 bg-gray-100 rounded overflow-hidden">
                <div
                  className={`absolute h-full rounded ${phase.color}`}
                  style={{
                    left: `${(Math.max(0, phase.start) / 12) * 100}%`,
                    width: `${(Math.max(1, phase.end - Math.max(0, phase.start)) / 12) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 w-28 text-right">{phase.label}</span>
            </div>
          </div>
        ))}

        {phases.length === 0 && (
          <div className="text-xs text-gray-500 text-center py-2">
            No deals forecasted — add deals to see timeline
          </div>
        )}

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-400" /> Prospecting
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-400" /> Pipeline
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" /> Closing
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-4 bg-red-500" /> GA
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function RevenueAtRisk({ data }: { data: ProductGTMData[] }) {
  const productsWithRevenue = data.filter((d) => d.totalGrossRevenue > 0);
  const totalForecastedRevenue = productsWithRevenue.reduce((s, d) => s + d.totalGrossRevenue, 0);

  const rows = productsWithRevenue.map((d) => {
    const missingDeps: { label: string; category: string }[] = [];
    for (const dep of CRITICAL_DEPENDENCIES) {
      const req = d.readiness.find((r) => r.deliverable === dep.deliverable);
      if (!req || !isDeliverableComplete(req)) {
        missingDeps.push({ label: dep.label, category: dep.category });
      }
    }
    const isAtRisk = missingDeps.length > 0;
    return { ...d, missingDeps, isAtRisk };
  });

  const totalAtRisk = rows.filter((r) => r.isAtRisk).reduce((s, r) => s + r.totalGrossRevenue, 0);
  const totalClear = totalForecastedRevenue - totalAtRisk;
  const atRiskPct = totalForecastedRevenue > 0 ? (totalAtRisk / totalForecastedRevenue) * 100 : 0;

  if (productsWithRevenue.length === 0) return null;

  const categoryColors: Record<string, string> = {
    Product: "bg-blue-100 text-blue-700",
    Marketing: "bg-purple-100 text-purple-700",
    Sales: "bg-green-100 text-green-700",
    Delivery: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Revenue at Risk</h2>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Clear: <span className="font-semibold text-green-700">{fmtCurrency(totalClear)}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">At Risk: <span className="font-semibold text-red-700">{fmtCurrency(totalAtRisk)}</span></span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Total: <span className="font-semibold">{fmtCurrency(totalForecastedRevenue)}</span></span>
          </div>
        </div>
        <div className="mt-3 w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
          {totalForecastedRevenue > 0 && (
            <>
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${100 - atRiskPct}%` }}
              />
              <div
                className="h-full bg-red-400 transition-all"
                style={{ width: `${atRiskPct}%` }}
              />
            </>
          )}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{(100 - atRiskPct).toFixed(0)}% ready</span>
          <span>{atRiskPct.toFixed(0)}% at risk</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-2.5 font-medium text-gray-500">Product</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">GA</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Deals</th>
              <th className="text-right px-3 py-2.5 font-medium text-gray-500">Gross Revenue</th>
              <th className="text-center px-3 py-2.5 font-medium text-gray-500">Status</th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-500">Missing Dependencies</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .sort((a, b) => b.totalGrossRevenue - a.totalGrossRevenue)
              .map((row) => (
                <tr
                  key={row.product.id}
                  className={`border-b border-gray-100 ${row.isAtRisk ? "bg-red-50/40" : ""}`}
                >
                  <td className="px-5 py-3 font-medium text-gray-900">{row.product.name}</td>
                  <td className="px-3 py-3 text-gray-600">{row.product.generally_available}</td>
                  <td className="px-3 py-3 text-right text-gray-900">{row.totalDeals}</td>
                  <td className="px-3 py-3 text-right">
                    <span className={`font-semibold ${row.isAtRisk ? "text-red-700" : "text-green-700"}`}>
                      {fmtCurrency(row.totalGrossRevenue)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {row.isAtRisk ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3" /> At Risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {row.missingDeps.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.missingDeps.map((dep) => (
                          <span
                            key={dep.label}
                            className={`text-xs px-1.5 py-0.5 rounded ${categoryColors[dep.category] || "bg-gray-100 text-gray-600"}`}
                          >
                            {dep.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">All dependencies met</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-5 py-2.5 text-gray-700">Total</td>
              <td className="px-3 py-2.5"></td>
              <td className="px-3 py-2.5 text-right text-gray-700">
                {productsWithRevenue.reduce((s, d) => s + d.totalDeals, 0)}
              </td>
              <td className="px-3 py-2.5 text-right text-gray-700">{fmtCurrency(totalForecastedRevenue)}</td>
              <td className="px-3 py-2.5"></td>
              <td className="px-3 py-2.5"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

const GTM_PILLARS = [
  {
    id: "product",
    label: "Product",
    subtitle: "Define & Build",
    icon: Package,
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    accent: "bg-purple-500",
    lightAccent: "bg-purple-100",
    deliverables: ["Product Descriptions", "Product Pricing", "Product/Beta/MVP", "General Availability (GA)"],
  },
  {
    id: "marketing",
    label: "Marketing",
    subtitle: "Position & Promote",
    icon: Megaphone,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    accent: "bg-blue-500",
    lightAccent: "bg-blue-100",
    deliverables: [
      "Marketing - ICP",
      "Marketing - Customer Content",
      "Marketing - Website",
      "Marketing - Digital Campaigns",
      "Marketing - Event Strategy",
    ],
  },
  {
    id: "sales",
    label: "Sales",
    subtitle: "Enable & Close",
    icon: HandshakeIcon,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    accent: "bg-green-500",
    lightAccent: "bg-green-100",
    deliverables: [
      "Sales - Pipeline Building",
      "Sales - Beta Customers",
      "Sales - Closed Deals",
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    subtitle: "Deploy & Validate",
    icon: Rocket,
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    accent: "bg-orange-500",
    lightAccent: "bg-orange-100",
    deliverables: [
      "Delivery - Technical Readiness",
      "Delivery - Onboarded Customers",
    ],
  },
  {
    id: "support",
    label: "Support & Ops",
    subtitle: "Scale & Sustain",
    icon: HeadphonesIcon,
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    accent: "bg-slate-500",
    lightAccent: "bg-slate-100",
    deliverables: ["Support and Ops - Customer Onboarding"],
  },
];

function friendlyName(deliverable: string): string {
  if (deliverable === "Product Descriptions") return "Descriptions";
  if (deliverable === "Product Pricing") return "Pricing";
  if (deliverable === "Product/Beta/MVP") return "Beta / MVP";
  if (deliverable === "General Availability (GA)") return "GA";
  const stripped = deliverable
    .replace(/^Product\s*[-–—]?\s*/, "")
    .replace(/^Marketing\s*[-–—]\s*/, "")
    .replace(/^Sales\s*[-–—]\s*/, "")
    .replace(/^Delivery\s*[-–—]\s*/, "")
    .replace(/^Support and Ops\s*[-–—]\s*/, "")
    .replace(/^Product\//, "");
  return stripped;
}

function ReadinessActivities({
  productId,
  allReqs,
  updateField,
  editingCell,
  setEditingCell,
}: {
  productId: string;
  allReqs: LaunchRequirement[];
  updateField: (productId: string, deliverable: string, field: keyof LaunchRequirement, value: string) => void;
  editingCell: string | null;
  setEditingCell: (key: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> GTM Activities
      </h3>
      {GTM_PILLARS.map((pillar) => {
        const pillarReqs = allReqs.filter((r) => pillar.deliverables.includes(r.deliverable));
        if (pillarReqs.length === 0) return null;

        const done = pillarReqs.filter((r) => r.complete).length;
        const total = pillarReqs.length;
        const allDone = done === total && total > 0;
        const PillarIcon = pillar.icon;

        return (
          <div key={pillar.id}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-7 h-7 rounded-lg ${pillar.accent} text-white flex items-center justify-center`}>
                <PillarIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${pillar.text}`}>{pillar.label}</span>
                <span className="text-xs text-gray-400 italic">{pillar.subtitle}</span>
              </div>
              <div className="flex-1 flex items-center gap-2 justify-end">
                <span className={`text-xs font-medium ${allDone ? "text-green-600" : "text-gray-400"}`}>
                  {done}/{total}
                </span>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${allDone ? "bg-green-500" : pillar.accent}`}
                    style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={`rounded-lg border ${pillar.border} overflow-hidden`}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${pillar.bg} border-b ${pillar.border}`}>
                    <th className={`px-3 py-2 text-left font-medium ${pillar.text} text-xs w-[180px]`}>Activity</th>
                    <th className={`px-3 py-2 text-left font-medium ${pillar.text} text-xs w-[80px]`}>Owner</th>
                    <th className={`px-3 py-2 text-left font-medium ${pillar.text} text-xs w-[120px]`}>Due Date</th>
                    <th className={`px-3 py-2 text-left font-medium ${pillar.text} text-xs`}>Content</th>
                    <th className={`px-3 py-2 text-left font-medium ${pillar.text} text-xs w-[150px]`}>Depends On</th>
                  </tr>
                </thead>
                <tbody>
                  {pillarReqs.map((r, i) => {
                    const cellKey = (field: string) => `gtm::${productId}::${r.deliverable}::${field}`;
                    const hasDependants = allReqs.some((other) => other.dependency === r.deliverable);

                    return (
                      <tr
                        key={r.deliverable}
                        className={`border-b last:border-b-0 ${pillar.border} ${i % 2 === 0 ? "bg-white" : pillar.bg + "/30"}`}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {r.complete ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                            )}
                            <span className="text-gray-800 font-medium text-xs">
                              {friendlyName(r.deliverable)}
                            </span>
                            {hasDependants && (
                              <span
                                className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200"
                                title="Other activities depend on this"
                              >
                                <Link2 className="w-2.5 h-2.5" />
                                BLOCKER
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {editingCell === cellKey("owner") ? (
                            <input
                              autoFocus
                              className="w-full border border-blue-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                              defaultValue={r.owner}
                              onBlur={(e) => {
                                updateField(productId, r.deliverable, "owner", e.target.value);
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                            />
                          ) : (
                            <span
                              onClick={() => setEditingCell(cellKey("owner"))}
                              className={`cursor-pointer inline-block px-1.5 py-0.5 rounded text-xs font-medium border ${
                                r.owner
                                  ? `${pillar.bg} ${pillar.text} ${pillar.border}`
                                  : "bg-gray-100 text-gray-400 border-gray-200"
                              }`}
                            >
                              {r.owner || "\u2014"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={r.timeline || ""}
                            onChange={(e) =>
                              updateField(productId, r.deliverable, "timeline", e.target.value)
                            }
                            className={`w-full text-xs border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                              r.timeline
                                ? "border-gray-300 text-gray-700"
                                : "border-gray-200 text-gray-400"
                            }`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          {editingCell === cellKey("content") ? (
                            <input
                              autoFocus
                              className="w-full border border-blue-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                              defaultValue={r.content}
                              onBlur={(e) => {
                                updateField(productId, r.deliverable, "content", e.target.value);
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                            />
                          ) : (
                            <span
                              onClick={() => setEditingCell(cellKey("content"))}
                              className={`cursor-pointer block min-h-[20px] px-1.5 py-0.5 rounded text-xs hover:bg-blue-50 transition-colors ${
                                r.content ? "text-gray-700" : "text-gray-300 italic"
                              }`}
                            >
                              {r.content || "Click to edit"}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={r.dependency || ""}
                            onChange={(e) =>
                              updateField(productId, r.deliverable, "dependency", e.target.value)
                            }
                            className={`w-full text-xs border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                              r.dependency
                                ? "border-blue-300 bg-blue-50 text-blue-800"
                                : "border-gray-200 text-gray-400"
                            }`}
                          >
                            <option value="">None</option>
                            {allReqs
                              .filter((other) => other.deliverable !== r.deliverable)
                              .map((other) => (
                                <option key={other.deliverable} value={other.deliverable}>
                                  {friendlyName(other.deliverable)}
                                </option>
                              ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
