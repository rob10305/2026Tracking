"use client";

import React, { useMemo, useState } from "react";
import { useStore } from "@/lib/store/context";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";
import {
  MONTHS_2026,
  MONTH_LABELS,
  forecastKey,
  variantForecastKey,
} from "@/lib/models/types";
import type { ProductVariant, Product, SavedForecast } from "@/lib/models/types";
import {
  calcOppsNeeded,
  calcProspectsNeeded,
  offsetMonth,
} from "@/lib/calc/workback";
import {
  ChevronDown,
  Megaphone,
  Target,
  Package,
  Clock,
  ArrowRight,
} from "lucide-react";

const VARIANTS: ProductVariant[] = ["small", "medium", "large"];

const GA_MONTH_INDEX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function getCurrentMonthIndex(): number {
  const now = new Date();
  if (now.getFullYear() < 2026) return 0;
  if (now.getFullYear() > 2026) return 11;
  return now.getMonth();
}

function numFmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function getDealsForMonth(
  forecast: SavedForecast,
  products: Product[],
  monthIdx: number,
): number {
  const month = MONTHS_2026[monthIdx];
  let total = 0;
  for (const p of products) {
    if (p.has_variants && p.variants) {
      for (const v of VARIANTS) {
        total += forecast.quantities[variantForecastKey(p.id, v, month)] ?? 0;
      }
    } else {
      total += forecast.quantities[forecastKey(p.id, month)] ?? 0;
    }
  }
  return total;
}

function getTotalDeals(
  forecast: SavedForecast,
  products: Product[],
): number {
  let total = 0;
  for (let i = 0; i < 12; i++) {
    total += getDealsForMonth(forecast, products, i);
  }
  return total;
}

function getTotalPipelineValue(
  forecast: SavedForecast,
  products: Product[],
): number {
  let total = 0;
  for (const p of products) {
    for (let i = 0; i < 12; i++) {
      const month = MONTHS_2026[i];
      let qty = 0;
      if (p.has_variants && p.variants) {
        for (const v of VARIANTS) {
          qty += forecast.quantities[variantForecastKey(p.id, v, month)] ?? 0;
        }
      } else {
        qty += forecast.quantities[forecastKey(p.id, month)] ?? 0;
      }
      total += qty * p.gross_annual_price;
    }
  }
  return total;
}

type RiskLevel = "on-track" | "at-risk" | "behind";

interface ScorecardMetric {
  label: string;
  target: number | string | null;
  actual: number | string | null;
  format: "number" | "currency" | "text";
  risk: RiskLevel;
  leadTimeNote?: string;
}

function MetricRow({ metric }: { metric: ScorecardMetric }) {
  const riskColors: Record<RiskLevel, { bg: string; text: string; dot: string; label: string }> = {
    "on-track": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "On Track" },
    "at-risk": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "At Risk" },
    "behind": { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Behind" },
  };

  const risk = riskColors[metric.risk];

  const formatValue = (val: number | string | null) => {
    if (val === null) return "—";
    if (typeof val === "string") return val;
    if (metric.format === "currency") return fmtCompact(val);
    return numFmt(val);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700">{metric.label}</span>
        {metric.leadTimeNote && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-[11px] text-gray-400">{metric.leadTimeNote}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right w-20">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Target</div>
          <div className="text-sm font-semibold text-gray-900">{formatValue(metric.target)}</div>
        </div>
        <div className="text-right w-20">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Actual</div>
          <div className="text-sm font-semibold text-gray-500">{formatValue(metric.actual)}</div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${risk.bg} ${risk.text} w-24 justify-center`}>
          <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
          {risk.label}
        </div>
      </div>
    </div>
  );
}

function ScorecardSection({
  title,
  icon,
  metrics,
  accentColor,
}: {
  title: string;
  icon: React.ReactNode;
  metrics: ScorecardMetric[];
  accentColor: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 ${accentColor}`}>
        {icon}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-5 py-1">
        {metrics.map((m, i) => (
          <MetricRow key={i} metric={m} />
        ))}
      </div>
    </div>
  );
}

export default function ScorecardPage() {
  const { state, isLoaded } = useStore();
  const { forecasts, isLoaded: fcLoaded } = useSavedForecasts();
  const [selectedForecastId, setSelectedForecastId] = useState<string>("");

  const selectedForecast = useMemo(() => {
    if (!selectedForecastId && forecasts.length > 0) return forecasts[0];
    return forecasts.find((f) => f.id === selectedForecastId) ?? null;
  }, [selectedForecastId, forecasts]);

  const currentMonthIdx = getCurrentMonthIndex();
  const currentMonthLabel = MONTH_LABELS[currentMonthIdx];

  const scorecardData = useMemo(() => {
    if (!selectedForecast || !state.products.length) {
      return { leadGen: [], pipeline: [], portfolio: [] };
    }

    const products = state.products;
    const forecast = selectedForecast;
    const motions = state.salesMotionByProductId;

    const currentYM = MONTHS_2026[currentMonthIdx];
    const totalDeals = getTotalDeals(forecast, products);
    const totalPipelineValue = getTotalPipelineValue(forecast, products);

    let totalOppsNeeded = 0;
    let currentMonthOpps = 0;

    let prospectsNeededNow = 0;
    let prospectsCloseMonth = "";
    let prospectsCloseDeals = 0;
    let pipelineRisk: RiskLevel = "on-track";
    let mqslRisk: RiskLevel = "on-track";

    for (const p of products) {
      const motion = motions[p.id] ?? state.industryAverages;

      for (let mi = 0; mi < 12; mi++) {
        const closeMonth = MONTHS_2026[mi];
        const mDeals = getDealsForMonth(forecast, [p], mi);
        if (mDeals === 0) continue;

        const opps = calcOppsNeeded(mDeals, motion.opp_to_close_win_rate_pct);
        totalOppsNeeded += opps;

        const pipelineMonth = offsetMonth(closeMonth, -motion.sales_cycle_months);
        const prospectingStart = offsetMonth(pipelineMonth, -motion.prospecting_lead_time_months);

        if (pipelineMonth <= currentYM && closeMonth > currentYM) {
          currentMonthOpps += opps;
          if (pipelineMonth < currentYM) pipelineRisk = "behind";
          else if (pipelineRisk !== "behind") pipelineRisk = "at-risk";
        }

        if (prospectingStart <= currentYM && closeMonth > currentYM) {
          const prospects = calcProspectsNeeded(opps, motion.prospect_to_opp_rate_pct);
          prospectsNeededNow += prospects;
          if (!prospectsCloseMonth || closeMonth < prospectsCloseMonth) {
            prospectsCloseMonth = closeMonth;
            prospectsCloseDeals = mDeals;
          }
          if (prospectingStart < currentYM) mqslRisk = "behind";
          else if (mqslRisk !== "behind") mqslRisk = "at-risk";
        }
      }
    }

    const pipelineContrib = state.pipelineContribution;
    const channelTotal = pipelineContrib.website_inbound + pipelineContrib.sales_team_generated +
      pipelineContrib.event_sourced + pipelineContrib.abm_thought_leadership + pipelineContrib.partner_referral;

    const channelPct = (val: number) => channelTotal > 0 ? Math.round((val / channelTotal) * 100) : 0;
    const directPct = channelPct(pipelineContrib.sales_team_generated);
    const marketingPct = channelPct(pipelineContrib.website_inbound + pipelineContrib.abm_thought_leadership);
    const channelSourcedPct = channelPct(pipelineContrib.partner_referral);

    const liveProducts = products.filter((p) => p.status === "live");
    const devProducts = products.filter((p) => p.status === "in_development");
    const productsAvailableForPipeline = products.filter((p) => {
      const gaIdx = GA_MONTH_INDEX[p.generally_available] ?? 12;
      return gaIdx <= currentMonthIdx;
    });

    const closeLabelIdx = prospectsCloseMonth ? MONTHS_2026.indexOf(prospectsCloseMonth as typeof MONTHS_2026[number]) : -1;
    const closeLabel = closeLabelIdx >= 0 ? MONTH_LABELS[closeLabelIdx] : "";

    const leadGen: ScorecardMetric[] = [
      {
        label: "Marketing campaigns active",
        target: null,
        actual: null,
        format: "number",
        risk: "on-track",
      },
      {
        label: "Users targeted",
        target: null,
        actual: null,
        format: "number",
        risk: "on-track",
      },
      {
        label: "Users engaged",
        target: null,
        actual: null,
        format: "number",
        risk: "on-track",
      },
      {
        label: "MQLs created",
        target: prospectsNeededNow > 0 ? prospectsNeededNow : null,
        actual: null,
        format: "number",
        risk: mqslRisk,
        leadTimeNote: prospectsNeededNow > 0
          ? `Need ${numFmt(prospectsNeededNow)} prospects now to close ${numFmt(prospectsCloseDeals)} deals by ${closeLabel}`
          : undefined,
      },
      {
        label: "In-person events executed",
        target: null,
        actual: null,
        format: "number",
        risk: "on-track",
      },
    ];

    const pipeline: ScorecardMetric[] = [
      {
        label: "Total pipeline opportunities",
        target: totalOppsNeeded,
        actual: null,
        format: "number",
        risk: totalOppsNeeded > 0 ? pipelineRisk : "on-track",
        leadTimeNote: `${numFmt(totalOppsNeeded)} opps needed across FY to win ${numFmt(totalDeals)} deals`,
      },
      {
        label: "Total value of opportunities",
        target: totalPipelineValue,
        actual: null,
        format: "currency",
        risk: totalPipelineValue > 0 ? pipelineRisk : "on-track",
      },
      {
        label: `New opps created (${currentMonthLabel})`,
        target: currentMonthOpps,
        actual: null,
        format: "number",
        risk: currentMonthOpps > 0 ? pipelineRisk : "on-track",
        leadTimeNote: currentMonthOpps > 0
          ? `${numFmt(currentMonthOpps)} opps needed this month based on workback lead times`
          : undefined,
      },
      {
        label: "Channel sourced",
        target: channelSourcedPct > 0 ? `${channelSourcedPct}%` : null,
        actual: null,
        format: "text",
        risk: "on-track",
        leadTimeNote: "Partner referral contribution",
      },
      {
        label: "Direct sourced",
        target: directPct > 0 ? `${directPct}%` : null,
        actual: null,
        format: "text",
        risk: "on-track",
        leadTimeNote: "Sales team generated contribution",
      },
      {
        label: "Marketing sourced",
        target: marketingPct > 0 ? `${marketingPct}%` : null,
        actual: null,
        format: "text",
        risk: "on-track",
        leadTimeNote: "Inbound + ABM/thought leadership",
      },
    ];

    const portfolio: ScorecardMetric[] = [
      {
        label: "New products available",
        target: products.length,
        actual: liveProducts.length,
        format: "number",
        risk: liveProducts.length >= products.length ? "on-track" : liveProducts.length >= products.length * 0.5 ? "at-risk" : "behind",
      },
      {
        label: "New products in MVP/Beta",
        target: devProducts.length,
        actual: devProducts.length,
        format: "number",
        risk: "on-track",
      },
      {
        label: "Products available for pipeline building",
        target: productsAvailableForPipeline.length,
        actual: productsAvailableForPipeline.length,
        format: "number",
        risk: productsAvailableForPipeline.length >= products.length * 0.5 ? "on-track" : "at-risk",
        leadTimeNote: productsAvailableForPipeline.length < products.length
          ? `${products.length - productsAvailableForPipeline.length} products not yet GA`
          : undefined,
      },
    ];

    return { leadGen, pipeline, portfolio };
  }, [selectedForecast, state, currentMonthIdx]);

  if (!isLoaded || !fcLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Scorecard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track business health against forecast targets — {currentMonthLabel} 2026
            </p>
          </div>
          <div className="relative">
            <select
              value={selectedForecast?.id ?? ""}
              onChange={(e) => setSelectedForecastId(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-9 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              {forecasts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {!selectedForecast ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500">
            <Target className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No forecast selected</p>
            <p className="text-sm mt-1">Create a forecast model to populate the scorecard</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Tracking against: <span className="font-semibold">{selectedForecast.name}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Targets are derived from forecast quantities and sales motion parameters. Actuals data sources will be connected.
                  </p>
                </div>
              </div>
            </div>

            <ScorecardSection
              title="Lead Generation"
              icon={<Megaphone className="w-4 h-4 text-violet-600" />}
              metrics={scorecardData.leadGen}
              accentColor="bg-violet-50/60"
            />

            <ScorecardSection
              title="Pipeline"
              icon={<Target className="w-4 h-4 text-blue-600" />}
              metrics={scorecardData.pipeline}
              accentColor="bg-blue-50/60"
            />

            <ScorecardSection
              title="Portfolio (New for 2026)"
              icon={<Package className="w-4 h-4 text-emerald-600" />}
              metrics={scorecardData.portfolio}
              accentColor="bg-emerald-50/60"
            />
          </div>
        )}
      </div>
    </div>
  );
}
