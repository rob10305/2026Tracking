"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useStore } from "@/lib/store/context";
import type { LaunchRequirement, Product } from "@/lib/models/types";
import { STANDARD_DELIVERABLES } from "@/lib/models/types";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Package,
  Megaphone,
  HandshakeIcon,
  Rocket,
  HeadphonesIcon,
  ArrowRight,
  Link2,
  Shield,
  Zap,
  Clock,
  Filter,
} from "lucide-react";

const PILLARS = [
  { id: "product", label: "Product", prefix: "Product", icon: Package, color: "purple", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", accent: "bg-purple-500", ring: "ring-purple-300", dot: "bg-purple-400" },
  { id: "marketing", label: "Marketing", prefix: "Marketing", icon: Megaphone, color: "blue", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", accent: "bg-blue-500", ring: "ring-blue-300", dot: "bg-blue-400" },
  { id: "sales", label: "Sales", prefix: "Sales", icon: HandshakeIcon, color: "green", bg: "bg-green-50", border: "border-green-200", text: "text-green-700", accent: "bg-green-500", ring: "ring-green-300", dot: "bg-green-400" },
  { id: "delivery", label: "Delivery", prefix: "Delivery", icon: Rocket, color: "orange", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", accent: "bg-orange-500", ring: "ring-orange-300", dot: "bg-orange-400" },
  { id: "support", label: "Support & Ops", prefix: "Support and Ops", icon: HeadphonesIcon, color: "slate", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", accent: "bg-slate-500", ring: "ring-slate-300", dot: "bg-slate-400" },
];

function getPillar(deliverable: string) {
  if (deliverable.startsWith("Product") || deliverable === "Product Descriptions" || deliverable === "Product Pricing" || deliverable === "Product/Beta/MVP/GA") return PILLARS[0];
  if (deliverable.startsWith("Marketing")) return PILLARS[1];
  if (deliverable.startsWith("Sales")) return PILLARS[2];
  if (deliverable.startsWith("Delivery")) return PILLARS[3];
  if (deliverable.startsWith("Support")) return PILLARS[4];
  return PILLARS[0];
}

function friendlyName(deliverable: string): string {
  if (deliverable === "Product Descriptions") return "Descriptions";
  if (deliverable === "Product Pricing") return "Pricing";
  if (deliverable === "Product/Beta/MVP/GA") return "Beta / MVP / GA";
  return deliverable
    .replace(/^Product\s*[-–—]?\s*/, "")
    .replace(/^Marketing\s*[-–—]\s*/, "")
    .replace(/^Sales\s*[-–—]\s*/, "")
    .replace(/^Delivery\s*[-–—]\s*/, "")
    .replace(/^Support and Ops\s*[-–—]\s*/, "")
    .replace(/^Product\//, "");
}

interface DepChain {
  deliverable: string;
  dependsOn: string;
  isComplete: boolean;
  depIsComplete: boolean;
  isBlocked: boolean;
}

interface ProductDepData {
  product: Product;
  reqs: LaunchRequirement[];
  chains: DepChain[];
  blockers: LaunchRequirement[];
  blockerCount: number;
  completePct: number;
}

export default function DependencyMapPage() {
  const { state, isLoaded } = useStore();
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<"all" | "blockers" | "incomplete">("all");

  const toggleProduct = useCallback((id: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => setExpandedProducts(new Set(state.products.map((p) => p.id)));
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

  const productData = useMemo<ProductDepData[]>(() => {
    return state.products.map((product) => {
      const reqs = getReqs(product.id);
      const isComplete = (r: LaunchRequirement) => !!r.complete;

      const chains: DepChain[] = reqs
        .filter((r) => r.dependency)
        .map((r) => {
          const dep = reqs.find((d) => d.deliverable === r.dependency);
          const depDone = dep ? isComplete(dep) : true;
          return {
            deliverable: r.deliverable,
            dependsOn: r.dependency,
            isComplete: isComplete(r),
            depIsComplete: depDone,
            isBlocked: !depDone,
          };
        });

      const blockerDeliverables = new Set(
        reqs
          .filter((r) => reqs.some((other) => other.dependency === r.deliverable) && !isComplete(r))
          .map((r) => r.deliverable),
      );
      const blockers = reqs.filter((r) => blockerDeliverables.has(r.deliverable));

      const total = reqs.length;
      const done = reqs.filter(isComplete).length;
      const completePct = total > 0 ? Math.round((done / total) * 100) : 0;

      return { product, reqs, chains, blockers, blockerCount: blockers.length, completePct };
    });
  }, [state.products, getReqs]);

  const filteredData = useMemo(() => {
    if (filterMode === "blockers") return productData.filter((d) => d.blockerCount > 0);
    if (filterMode === "incomplete") return productData.filter((d) => d.completePct < 100);
    return productData;
  }, [productData, filterMode]);

  const totalBlockers = productData.reduce((s, d) => s + d.blockerCount, 0);
  const totalChains = productData.reduce((s, d) => s + d.chains.length, 0);
  const blockedChains = productData.reduce((s, d) => s + d.chains.filter((c) => c.isBlocked).length, 0);
  const productsAtRisk = productData.filter((d) => d.blockerCount > 0).length;

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dependency Map</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visualize dependency chains and blockers across all product launch activities.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Link2 className="w-5 h-5 text-blue-600" />}
          label="Total Dependencies"
          value={totalChains}
          bg="bg-blue-50"
          border="border-blue-200"
        />
        <SummaryCard
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          label="Blocked Chains"
          value={blockedChains}
          bg="bg-amber-50"
          border="border-amber-200"
          alert={blockedChains > 0}
        />
        <SummaryCard
          icon={<Shield className="w-5 h-5 text-red-600" />}
          label="Active Blockers"
          value={totalBlockers}
          bg="bg-red-50"
          border="border-red-200"
          alert={totalBlockers > 0}
        />
        <SummaryCard
          icon={<Zap className="w-5 h-5 text-orange-600" />}
          label="Products at Risk"
          value={productsAtRisk}
          sublabel={`of ${productData.length}`}
          bg="bg-orange-50"
          border="border-orange-200"
          alert={productsAtRisk > 0}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={expandAll} className="text-xs text-blue-600 hover:text-blue-800">Expand All</button>
          <span className="text-gray-300">|</span>
          <button onClick={collapseAll} className="text-xs text-blue-600 hover:text-blue-800">Collapse All</button>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
          {(["all", "blockers", "incomplete"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                filterMode === mode
                  ? "bg-white text-gray-800 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode === "all" ? "All Products" : mode === "blockers" ? "With Blockers" : "Incomplete"}
            </button>
          ))}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No products match this filter.</p>
          <p className="text-sm text-gray-400 mt-1">
            {filterMode === "blockers" ? "No products have active blockers right now." : "All products are complete."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.map((data) => (
            <ProductDependencyCard
              key={data.product.id}
              data={data}
              expanded={expandedProducts.has(data.product.id)}
              onToggle={() => toggleProduct(data.product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sublabel,
  bg,
  border,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sublabel?: string;
  bg: string;
  border: string;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        {alert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <div className="text-2xl font-bold text-gray-800">
        {value}
        {sublabel && <span className="text-sm font-normal text-gray-400 ml-1">{sublabel}</span>}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function ProductDependencyCard({
  data,
  expanded,
  onToggle,
}: {
  data: ProductDepData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { product, reqs, chains, blockers, blockerCount, completePct } = data;
  const hasBlockers = blockerCount > 0;
  const blockedCount = chains.filter((c) => c.isBlocked).length;

  return (
    <div className={`bg-white rounded-xl border overflow-hidden shadow-sm ${hasBlockers ? "border-amber-300" : "border-gray-200"}`}>
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`} />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              {hasBlockers && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3 h-3" />
                  {blockerCount} BLOCKER{blockerCount > 1 ? "S" : ""}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">GA: {product.generally_available || "TBD"}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5" />
              {chains.length} dep{chains.length !== 1 ? "s" : ""}
            </span>
            {blockedCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {blockedCount} blocked
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{completePct}%</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${completePct === 100 ? "bg-green-500" : completePct > 50 ? "bg-blue-500" : "bg-amber-500"}`}
                style={{ width: `${completePct}%` }}
              />
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 px-5 py-4 space-y-5">
          {blockers.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" />
                Active Blockers — These incomplete items are blocking other activities
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {blockers.map((b) => {
                  const pillar = getPillar(b.deliverable);
                  const PIcon = pillar.icon;
                  const downstream = reqs.filter((r) => r.dependency === b.deliverable);
                  return (
                    <div
                      key={b.deliverable}
                      className="bg-white border border-amber-200 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-md ${pillar.accent} text-white flex items-center justify-center`}>
                          <PIcon className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{friendlyName(b.deliverable)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                        {b.owner && <span className={`px-1.5 py-0.5 rounded ${pillar.bg} ${pillar.text} text-[10px] font-medium`}>{b.owner}</span>}
                        {b.timeline ? (
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {b.timeline}</span>
                        ) : (
                          <span className="text-amber-600 italic">No due date</span>
                        )}
                      </div>
                      <div className="text-[10px] text-amber-700 font-medium">
                        Blocking {downstream.length} item{downstream.length > 1 ? "s" : ""}:
                        {" "}
                        {downstream.map((d) => friendlyName(d.deliverable)).join(", ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {chains.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Dependency Chains
              </h4>
              <div className="space-y-2">
                {chains.map((chain) => {
                  const fromPillar = getPillar(chain.dependsOn);
                  const toPillar = getPillar(chain.deliverable);
                  const FromIcon = fromPillar.icon;
                  const ToIcon = toPillar.icon;
                  return (
                    <div
                      key={`${chain.dependsOn}→${chain.deliverable}`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                        chain.isBlocked
                          ? "bg-red-50 border-red-200"
                          : chain.isComplete && chain.depIsComplete
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-7 h-7 rounded-lg ${fromPillar.accent} text-white flex items-center justify-center flex-shrink-0`}>
                          <FromIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{friendlyName(chain.dependsOn)}</div>
                          <div className="text-[10px] text-gray-400">{fromPillar.label}</div>
                        </div>
                        {chain.depIsComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className={`w-8 h-px ${chain.isBlocked ? "bg-red-300" : "bg-gray-300"}`} />
                        <ArrowRight className={`w-4 h-4 ${chain.isBlocked ? "text-red-400" : "text-gray-400"}`} />
                        <div className={`w-8 h-px ${chain.isBlocked ? "bg-red-300" : "bg-gray-300"}`} />
                      </div>

                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-7 h-7 rounded-lg ${toPillar.accent} text-white flex items-center justify-center flex-shrink-0`}>
                          <ToIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{friendlyName(chain.deliverable)}</div>
                          <div className="text-[10px] text-gray-400">{toPillar.label}</div>
                        </div>
                        {chain.isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex-shrink-0 ml-2">
                        {chain.isBlocked ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">BLOCKED</span>
                        ) : chain.isComplete && chain.depIsComplete ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">RESOLVED</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">PENDING</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Link2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No dependencies configured for this product.</p>
              <p className="text-xs mt-1">Add dependencies via the Product Launch settings page.</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Activity Status by Pillar</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {PILLARS.map((pillar) => {
                const pillarReqs = reqs.filter((r) => {
                  if (r.deliverable.startsWith(pillar.prefix + " - ") || r.deliverable.startsWith(pillar.prefix + "/")) return true;
                  if (pillar.prefix === "Product" && ["Product Descriptions", "Product Pricing", "Product/Beta/MVP/GA"].includes(r.deliverable)) return true;
                  return false;
                });
                if (pillarReqs.length === 0) return null;
                const done = pillarReqs.filter((r) => r.complete).length;
                const total = pillarReqs.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const PIcon = pillar.icon;
                const hasBlocker = pillarReqs.some((r) => blockers.some((b) => b.deliverable === r.deliverable));

                return (
                  <div key={pillar.id} className={`rounded-lg border ${pillar.border} ${pillar.bg} p-3`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-md ${pillar.accent} text-white flex items-center justify-center`}>
                        <PIcon className="w-3 h-3" />
                      </div>
                      <span className={`text-xs font-bold ${pillar.text}`}>{pillar.label}</span>
                      {hasBlocker && <AlertTriangle className="w-3 h-3 text-amber-500 ml-auto" />}
                    </div>
                    <div className="space-y-1">
                      {pillarReqs.map((r) => {
                        const complete = !!r.complete;
                        const isBlocker = blockers.some((b) => b.deliverable === r.deliverable);
                        const isBlocked = chains.some((c) => c.deliverable === r.deliverable && c.isBlocked);
                        return (
                          <div key={r.deliverable} className="flex items-center gap-1.5">
                            {complete ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                            ) : isBlocker ? (
                              <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            ) : isBlocked ? (
                              <Shield className="w-3 h-3 text-red-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-3 h-3 text-gray-300 flex-shrink-0" />
                            )}
                            <span className={`text-[10px] leading-tight ${
                              complete ? "text-gray-600" : isBlocker ? "text-amber-700 font-medium" : isBlocked ? "text-red-600" : "text-gray-400"
                            }`}>
                              {friendlyName(r.deliverable)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex-1 h-1 bg-white/50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct === 100 ? "bg-green-500" : pillar.accent}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-medium ${pct === 100 ? "text-green-600" : pillar.text}`}>{done}/{total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
