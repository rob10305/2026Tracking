"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useStore } from "@/lib/store/context";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";
import type { LaunchRequirement } from "@/lib/models/types";
import { STANDARD_DELIVERABLES, MONTHS_2026, forecastKey, variantForecastKey } from "@/lib/models/types";
import type { Product, ProductVariant } from "@/lib/models/types";
import Link from "next/link";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertCircle,
  Package,
  Megaphone,
  HandshakeIcon,
  Rocket,
  HeadphonesIcon,
  Link2,
  Clock,
  CalendarClock,
  GitBranch,
  Target,
  ListChecks,
  DollarSign,
  Hash,
  ExternalLink,
} from "lucide-react";

const PILLARS = [
  {
    id: "product",
    number: 1,
    label: "Product",
    subtitle: "Define & Build",
    icon: Package,
    color: "purple",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    accent: "bg-purple-500",
    lightAccent: "bg-purple-100",
    ring: "ring-purple-200",
    deliverables: ["Product Descriptions", "Product Pricing", "Product/Beta/MVP", "General Availability (GA)"],
  },
  {
    id: "marketing",
    number: 2,
    label: "Marketing",
    subtitle: "Position & Promote",
    icon: Megaphone,
    color: "blue",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    accent: "bg-blue-500",
    lightAccent: "bg-blue-100",
    ring: "ring-blue-200",
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
    number: 3,
    label: "Sales",
    subtitle: "Enable & Close",
    icon: HandshakeIcon,
    color: "green",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    accent: "bg-green-500",
    lightAccent: "bg-green-100",
    ring: "ring-green-200",
    deliverables: [
      "Sales - Pipeline Building",
      "Sales - Beta Customers",
      "Sales - Closed Deals",
    ],
  },
  {
    id: "delivery",
    number: 4,
    label: "Delivery",
    subtitle: "Deploy & Validate",
    icon: Rocket,
    color: "orange",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    accent: "bg-orange-500",
    lightAccent: "bg-orange-100",
    ring: "ring-orange-200",
    deliverables: [
      "Delivery - Technical Readiness",
      "Delivery - Onboarded Customers",
    ],
  },
  {
    id: "support",
    number: 5,
    label: "Support & Ops",
    subtitle: "Scale & Sustain",
    icon: HeadphonesIcon,
    color: "slate",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    accent: "bg-slate-500",
    lightAccent: "bg-slate-100",
    ring: "ring-slate-200",
    deliverables: ["Support and Ops - Customer Onboarding"],
  },
];

const MONTH_ORDER = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function stripPrefix(deliverable: string): string {
  return deliverable
    .replace(/^Product\s*[-–—]?\s*/, "")
    .replace(/^Marketing\s*[-–—]\s*/, "")
    .replace(/^Sales\s*[-–—]\s*/, "")
    .replace(/^Delivery\s*[-–—]\s*/, "")
    .replace(/^Support and Ops\s*[-–—]\s*/, "")
    .replace(/^Product\//, "");
}

function friendlyName(deliverable: string): string {
  if (deliverable === "Product Descriptions") return "Descriptions";
  if (deliverable === "Product Pricing") return "Pricing";
  if (deliverable === "Product/Beta/MVP") return "Beta / MVP";
  if (deliverable === "General Availability (GA)") return "GA";
  return stripPrefix(deliverable);
}

function completionCount(reqs: LaunchRequirement[]): { done: number; total: number } {
  const total = reqs.length;
  const done = reqs.filter((r) => r.complete).length;
  return { done, total };
}

function pillarCompletion(
  reqs: LaunchRequirement[],
  pillarDeliverables: string[],
): { done: number; total: number } {
  const relevant = reqs.filter((r) => pillarDeliverables.includes(r.deliverable));
  const total = relevant.length;
  const done = relevant.filter((r) => r.complete).length;
  return { done, total };
}

function computeTMinus(gaMonth: string): { days: number; label: string; color: string } | null {
  const idx = MONTH_ORDER.indexOf((gaMonth || "").toLowerCase());
  if (idx < 0) return null;
  const now = new Date();
  let gaYear = now.getFullYear();
  const gaDate = new Date(gaYear, idx, 1);
  if (gaDate < now) gaDate.setFullYear(gaYear + 1);
  const diff = Math.ceil((gaDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let color = "text-green-600";
  if (diff <= 30) color = "text-red-600";
  else if (diff <= 90) color = "text-amber-600";
  return { days: diff, label: `T-${diff}d`, color };
}

function getNextActionDue(reqs: LaunchRequirement[]): { deliverable: string; date: string } | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let nearest: { deliverable: string; date: string; ts: number } | null = null;
  for (const r of reqs) {
    if (r.complete) continue;
    if (!r.timeline) continue;
    const ts = new Date(r.timeline).getTime();
    if (isNaN(ts)) continue;
    if (!nearest || ts < nearest.ts) {
      nearest = { deliverable: r.deliverable, date: r.timeline, ts };
    }
  }
  if (nearest) return { deliverable: nearest.deliverable, date: nearest.date };
  const incomplete = reqs.filter((r) => !r.complete);
  if (incomplete.length > 0) return { deliverable: incomplete[0].deliverable, date: "" };
  return null;
}

function countDepsBeforeActivity(reqs: LaunchRequirement[], targetDeliverable: string): number {
  const visited = new Set<string>();
  function walk(deliverable: string) {
    const req = reqs.find((r) => r.deliverable === deliverable);
    if (!req) return;
    if (req.dependency && !visited.has(req.dependency)) {
      visited.add(req.dependency);
      walk(req.dependency);
    }
  }
  walk(targetDeliverable);
  const incomplete = [...visited].filter((d) => {
    const r = reqs.find((rr) => rr.deliverable === d);
    return r && !r.complete;
  });
  return incomplete.length;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getProductForecastStats(
  product: Product,
  quantities: Record<string, number>,
): { totalDeals: number; totalRevenue: number } {
  let totalDeals = 0;
  let totalRevenue = 0;
  for (const m of MONTHS_2026) {
    if (product.has_variants && product.variants) {
      for (const v of ["small", "medium", "large"] as ProductVariant[]) {
        const key = variantForecastKey(product.id, v, m);
        const qty = quantities[key] || 0;
        if (qty > 0) {
          totalDeals += qty;
          const variantPricing = product.variants[v];
          totalRevenue += qty * (variantPricing?.gross_annual_price ?? product.gross_annual_price);
        }
      }
    } else {
      const key = forecastKey(product.id, m);
      const qty = quantities[key] || 0;
      if (qty > 0) {
        totalDeals += qty;
        totalRevenue += qty * product.gross_annual_price;
      }
    }
  }
  return { totalDeals, totalRevenue };
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

interface FlashCardData {
  product: Product;
  reqs: LaunchRequirement[];
  done: number;
  total: number;
  pct: number;
  tMinus: { days: number; label: string; color: string } | null;
  nextAction: { deliverable: string; date: string } | null;
  depsBeforePipeline: number;
  depsBeforeClosedDeals: number;
  outstanding: number;
  totalDeals: number;
  totalRevenue: number;
}

export default function LaunchReadinessPage() {
  const { state, isLoaded } = useStore();
  const { forecasts } = useSavedForecasts();
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [hideGA, setHideGA] = useState(false);
  const [selectedForecastId, setSelectedForecastId] = useState<string>("");

  const toggleProduct = useCallback((id: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isAlreadyGA = (p: { generally_available: string }) =>
    (p.generally_available || "").toLowerCase() === "january";

  const visibleProducts = hideGA
    ? state.products.filter((p) => !isAlreadyGA(p))
    : state.products;

  const expandAll = () => setExpandedProducts(new Set(visibleProducts.map((p) => p.id)));
  const collapseAll = () => setExpandedProducts(new Set());

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

  const selectedForecast = forecasts.find((f) => f.id === selectedForecastId) || forecasts[0] || null;
  const quantities = selectedForecast?.quantities || {};

  const flashCards: FlashCardData[] = useMemo(() => {
    return visibleProducts.map((p) => {
      const reqs = getReqs(p.id);
      const { done, total } = completionCount(reqs);
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const tMinus = computeTMinus(p.generally_available);
      const nextAction = getNextActionDue(reqs);
      const depsBeforePipeline = countDepsBeforeActivity(reqs, "Sales - Pipeline Building");
      const depsBeforeClosedDeals = countDepsBeforeActivity(reqs, "Sales - Closed Deals");
      const { totalDeals, totalRevenue } = getProductForecastStats(p, quantities);
      return {
        product: p,
        reqs,
        done,
        total,
        pct,
        tMinus,
        nextAction,
        depsBeforePipeline,
        depsBeforeClosedDeals,
        outstanding: total - done,
        totalDeals,
        totalRevenue,
      };
    });
  }, [visibleProducts, getReqs, quantities]);

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

  const totalCompletion = flashCards.reduce(
    (acc, fc) => ({ done: acc.done + fc.done, total: acc.total + fc.total }),
    { done: 0, total: 0 },
  );

  const hasGAProducts = state.products.some(isAlreadyGA);
  const overallPct =
    totalCompletion.total > 0
      ? Math.round((totalCompletion.done / totalCompletion.total) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Launch Readiness</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track the journey from product definition through launch execution.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Forecast Model</label>
            <select
              value={selectedForecast?.id || ""}
              onChange={(e) => setSelectedForecastId(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-w-[180px]"
            >
              {forecasts.length === 0 && (
                <option value="">No forecasts</option>
              )}
              {forecasts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Completion</div>
              <div className="text-sm font-bold text-gray-800">{overallPct}%</div>
            </div>
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${overallPct === 100 ? "bg-green-500" : overallPct > 50 ? "bg-blue-500" : "bg-amber-500"}`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-xs text-blue-600 hover:text-blue-800">
              Expand All
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={collapseAll} className="text-xs text-blue-600 hover:text-blue-800">
              Collapse All
            </button>
          </div>
          {hasGAProducts && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setHideGA((v) => !v)}
                className={`relative w-8 h-[18px] rounded-full transition-colors ${hideGA ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${hideGA ? "translate-x-[16px]" : "translate-x-[2px]"}`} />
              </div>
              <span className="text-xs text-gray-600">Hide already GA products</span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-1">
          {PILLARS.map((pillar, idx) => (
            <React.Fragment key={pillar.id}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${pillar.bg} ${pillar.text} ${pillar.border} border`}>
                <span className={`w-5 h-5 rounded-full ${pillar.accent} text-white flex items-center justify-center text-[10px] font-bold`}>
                  {pillar.number}
                </span>
                {pillar.label}
              </div>
              {idx < PILLARS.length - 1 && (
                <div className="w-4 h-px bg-gray-300" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        {flashCards.flatMap((fc) => {
          const { product: p, outstanding } = fc;
          const isExpanded = expandedProducts.has(p.id);
          const items: React.ReactNode[] = [];

          items.push(
            <button
              key={p.id}
              onClick={() => toggleProduct(p.id)}
              className={`bg-white border-2 rounded-xl p-6 transition-all text-left hover:shadow-md w-full md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)] ${
                isExpanded
                  ? "border-blue-300 ring-2 ring-blue-100"
                  : "border-blue-100 hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <h2 className="font-bold text-base leading-tight">{p.name}</h2>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">GA Date</span>
                  <span className="text-sm font-semibold text-gray-700">{p.generally_available || "TBD"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">FY Revenue</span>
                  <span className={`text-sm font-semibold ${fc.totalRevenue > 0 ? "text-blue-700" : "text-gray-400"}`}>
                    {fc.totalRevenue > 0 ? formatCurrency(fc.totalRevenue) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Steps Pending</span>
                  <span className={`text-sm font-semibold ${outstanding === 0 ? "text-green-600" : "text-gray-800"}`}>
                    {outstanding}
                  </span>
                </div>
              </div>
            </button>
          );

          if (isExpanded) {
            items.push(
              <ExpandedDetail key={`detail-${p.id}`} fc={fc} toggleProduct={toggleProduct} />
            );
          }

          return items;
        })}
      </div>
    </div>
  );
}

function ExpandedDetail({ fc, toggleProduct }: { fc: FlashCardData; toggleProduct: (id: string) => void }) {
  const { product: p, reqs, done, total, pct, tMinus, nextAction, depsBeforePipeline, depsBeforeClosedDeals, outstanding } = fc;
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-800">{p.name}</h3>
            <span className="text-xs text-gray-500">GA: {p.generally_available || "TBD"}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1">
            {PILLARS.map((pillar) => {
              const pc = pillarCompletion(reqs, pillar.deliverables);
              const allDone = pc.done === pc.total && pc.total > 0;
              return (
                <div
                  key={pillar.id}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    allDone ? `${pillar.accent} text-white` : pc.done > 0 ? `${pillar.lightAccent} ${pillar.text}` : "bg-gray-100 text-gray-400"
                  }`}
                  title={`${pillar.label}: ${pc.done}/${pc.total}`}
                >
                  {pillar.number}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            {pct === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : pct > 0 ? (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300" />
            )}
            <span className="text-sm text-gray-600">{done}/{total}</span>
          </div>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : pct > 50 ? "bg-blue-500" : "bg-amber-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <button onClick={() => toggleProduct(p.id)} className="text-gray-400 hover:text-gray-600 transition-colors ml-2">
            <ChevronDown className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
      <div className="px-5 py-3">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <ListChecks className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">Outstanding</div>
              <div className={`text-sm font-bold ${outstanding === 0 ? "text-green-600" : "text-gray-800"}`}>{outstanding} action{outstanding !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">T-Minus to GA</div>
              {tMinus ? <div className={`text-sm font-bold ${tMinus.color}`}>{tMinus.label}</div> : <div className="text-sm font-bold text-gray-400">TBD</div>}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <CalendarClock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">Next Due</div>
              {nextAction ? (
                <div className="text-sm font-bold text-gray-800 truncate" title={friendlyName(nextAction.deliverable)}>
                  {nextAction.date ? formatDate(nextAction.date) : "No date"} — {friendlyName(nextAction.deliverable)}
                </div>
              ) : (
                <div className="text-sm font-bold text-green-600">All done</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <GitBranch className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">Deps to Pipeline</div>
              <div className={`text-sm font-bold ${depsBeforePipeline > 0 ? "text-amber-600" : "text-green-600"}`}>
                {depsBeforePipeline > 0 ? `${depsBeforePipeline} blocking` : "Clear"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">Deps to Deals</div>
              <div className={`text-sm font-bold ${depsBeforeClosedDeals > 0 ? "text-red-600" : "text-green-600"}`}>
                {depsBeforeClosedDeals > 0 ? `${depsBeforeClosedDeals} blocking` : "Clear"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
            <DollarSign className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-blue-400 uppercase tracking-wider leading-tight">FY Revenue</div>
              <div className={`text-sm font-bold ${fc.totalRevenue > 0 ? "text-blue-700" : "text-gray-400"}`}>
                {fc.totalRevenue > 0 ? formatCurrency(fc.totalRevenue) : "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
            <Hash className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-blue-400 uppercase tracking-wider leading-tight">Total Deals</div>
              <div className={`text-sm font-bold ${fc.totalDeals > 0 ? "text-blue-700" : "text-gray-400"}`}>
                {fc.totalDeals > 0 ? fc.totalDeals : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-5 py-4 space-y-5">
        <div className="flex items-center justify-end">
          <Link href="/settings/launch" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Edit in Product Launch
          </Link>
        </div>
        {PILLARS.map((pillar, pillarIdx) => {
          const pillarReqs = reqs.filter((r) => pillar.deliverables.includes(r.deliverable));
          if (pillarReqs.length === 0) return null;
          const pc = pillarCompletion(reqs, pillar.deliverables);
          const allDone = pc.done === pc.total;
          const PillarIcon = pillar.icon;
          return (
            <div key={pillar.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${pillar.accent} text-white flex items-center justify-center`}>
                    <PillarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${pillar.text}`}>Pillar {pillar.number}</span>
                      <span className="font-semibold text-gray-800 text-sm">{pillar.label}</span>
                      <span className="text-xs text-gray-400 italic">{pillar.subtitle}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 justify-end">
                  <span className={`text-xs font-medium ${allDone ? "text-green-600" : "text-gray-400"}`}>{pc.done}/{pc.total}</span>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${allDone ? "bg-green-500" : pillar.accent}`} style={{ width: `${pc.total > 0 ? (pc.done / pc.total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
              <div className={`rounded-lg border ${pillar.border} overflow-hidden`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${pillar.bg} border-b ${pillar.border}`}>
                      <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs w-[200px]`}>Activity</th>
                      <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs w-[90px]`}>Owner</th>
                      <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs w-[130px]`}>Due Date</th>
                      <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs`}>Content</th>
                      <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs w-[170px]`}>Depends On</th>
                      <th className={`px-4 py-2 text-center font-medium ${pillar.text} text-xs w-[70px]`}>Complete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pillarReqs.map((r, i) => {
                      const hasDependants = reqs.some((other) => other.dependency === r.deliverable);
                      return (
                        <tr key={r.deliverable} className={`border-b last:border-b-0 ${pillar.border} ${i % 2 === 0 ? "bg-white" : pillar.bg + "/30"}`}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              {r.complete ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                              <span className="text-gray-800 font-medium">{friendlyName(r.deliverable)}</span>
                              {hasDependants && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200" title="Other activities depend on this">
                                  <Link2 className="w-3 h-3" />BLOCKER
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${r.owner ? `${pillar.bg} ${pillar.text} ${pillar.border}` : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                              {r.owner || "\u2014"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`text-xs ${r.timeline ? "text-gray-700" : "text-gray-400"}`}>{r.timeline ? formatDate(r.timeline) : "\u2014"}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`text-sm ${r.content ? "text-gray-700" : "text-gray-300 italic"}`}>{r.content || "\u2014"}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            {r.dependency ? (
                              <span className="text-xs px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700">{friendlyName(r.dependency)}</span>
                            ) : (
                              <span className="text-xs text-gray-400">{"\u2014"}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {r.complete ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <Circle className="w-4 h-4 text-gray-300 mx-auto" />}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pillarIdx < PILLARS.length - 1 && (
                <div className="flex justify-center mt-4">
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3 bg-gray-200" />
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
