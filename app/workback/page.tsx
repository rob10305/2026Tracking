"use client";

import React, { useState, useCallback } from "react";
import { useStore } from "@/lib/store/context";
import type { LaunchRequirement } from "@/lib/models/types";
import { STANDARD_DELIVERABLES } from "@/lib/models/types";
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
    deliverables: ["Product Descriptions", "Product Pricing", "Product/Beta/MVP/GA"],
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
  if (deliverable === "Product/Beta/MVP/GA") return "Beta / MVP / GA";
  return stripPrefix(deliverable);
}

function completionCount(reqs: LaunchRequirement[]): { done: number; total: number } {
  const total = reqs.length;
  const done = reqs.filter((r) => r.criticalPath && r.timeline && r.content).length;
  return { done, total };
}

function pillarCompletion(
  reqs: LaunchRequirement[],
  pillarDeliverables: string[],
): { done: number; total: number } {
  const relevant = reqs.filter((r) => pillarDeliverables.includes(r.deliverable));
  const total = relevant.length;
  const done = relevant.filter((r) => r.criticalPath && r.timeline && r.content).length;
  return { done, total };
}

export default function LaunchReadinessPage() {
  const { state, updateLaunchRequirements, isLoaded } = useStore();
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);

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

  const totalCompletion = state.products.reduce(
    (acc, p) => {
      const c = completionCount(getReqs(p.id));
      return { done: acc.done + c.done, total: acc.total + c.total };
    },
    { done: 0, total: 0 },
  );
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
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-500">Overall Completion</div>
            <div className="text-lg font-bold text-gray-800">{overallPct}%</div>
          </div>
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${overallPct === 100 ? "bg-green-500" : overallPct > 50 ? "bg-blue-500" : "bg-amber-500"}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={expandAll} className="text-xs text-blue-600 hover:text-blue-800">
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={collapseAll} className="text-xs text-blue-600 hover:text-blue-800">
            Collapse All
          </button>
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

      <div className="space-y-4">
        {state.products.map((p) => {
          const reqs = getReqs(p.id);
          const { done, total } = completionCount(reqs);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isExpanded = expandedProducts.has(p.id);

          return (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleProduct(p.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                  />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{p.name}</h3>
                    <span className="text-xs text-gray-500">
                      GA: {p.generally_available || "TBD"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-1">
                    {PILLARS.map((pillar) => {
                      const pc = pillarCompletion(reqs, pillar.deliverables);
                      const allDone = pc.done === pc.total && pc.total > 0;
                      return (
                        <div
                          key={pillar.id}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            allDone
                              ? `${pillar.accent} text-white`
                              : pc.done > 0
                                ? `${pillar.lightAccent} ${pillar.text}`
                                : "bg-gray-100 text-gray-400"
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
                    <span className="text-sm text-gray-600">
                      {done}/{total}
                    </span>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : pct > 50 ? "bg-blue-500" : "bg-amber-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 px-5 py-4 space-y-5">
                  {PILLARS.map((pillar, pillarIdx) => {
                    const pillarReqs = reqs.filter((r) =>
                      pillar.deliverables.includes(r.deliverable),
                    );
                    if (pillarReqs.length === 0) return null;
                    const pc = pillarCompletion(reqs, pillar.deliverables);
                    const allDone = pc.done === pc.total;
                    const PillarIcon = pillar.icon;

                    return (
                      <div key={pillar.id}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-lg ${pillar.accent} text-white flex items-center justify-center`}
                            >
                              <PillarIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold uppercase tracking-wider ${pillar.text}`}>
                                  Pillar {pillar.number}
                                </span>
                                <span className="font-semibold text-gray-800 text-sm">
                                  {pillar.label}
                                </span>
                                <span className="text-xs text-gray-400 italic">
                                  {pillar.subtitle}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 flex items-center gap-2 justify-end">
                            <span className={`text-xs font-medium ${allDone ? "text-green-600" : "text-gray-400"}`}>
                              {pc.done}/{pc.total}
                            </span>
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${allDone ? "bg-green-500" : pillar.accent}`}
                                style={{
                                  width: `${pc.total > 0 ? (pc.done / pc.total) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={`rounded-lg border ${pillar.border} overflow-hidden`}>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className={`${pillar.bg} border-b ${pillar.border}`}>
                                <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs w-[220px]`}>
                                  Activity
                                </th>
                                <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs w-[100px]`}>
                                  Owner
                                </th>
                                <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs`}>
                                  Critical Path to $$
                                </th>
                                <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs`}>
                                  Timeline
                                </th>
                                <th className={`px-4 py-2 text-left font-medium ${pillar.text} text-xs`}>
                                  Content
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {pillarReqs.map((r, i) => {
                                const cellKey = (field: string) =>
                                  `${p.id}::${r.deliverable}::${field}`;
                                const isComplete = r.criticalPath && r.timeline && r.content;

                                return (
                                  <tr
                                    key={r.deliverable}
                                    className={`border-b last:border-b-0 ${pillar.border} ${i % 2 === 0 ? "bg-white" : pillar.bg + "/30"}`}
                                  >
                                    <td className="px-4 py-2.5">
                                      <div className="flex items-center gap-2">
                                        {isComplete ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                        )}
                                        <span className="text-gray-800 font-medium">
                                          {friendlyName(r.deliverable)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                      {editingCell === cellKey("owner") ? (
                                        <input
                                          autoFocus
                                          className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                          defaultValue={r.owner}
                                          onBlur={(e) => {
                                            updateField(
                                              p.id,
                                              r.deliverable,
                                              "owner",
                                              e.target.value,
                                            );
                                            setEditingCell(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                              (e.target as HTMLInputElement).blur();
                                            if (e.key === "Escape") setEditingCell(null);
                                          }}
                                        />
                                      ) : (
                                        <span
                                          onClick={() => setEditingCell(cellKey("owner"))}
                                          className={`cursor-pointer inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                                            r.owner
                                              ? `${pillar.bg} ${pillar.text} ${pillar.border}`
                                              : "bg-gray-100 text-gray-400 border-gray-200"
                                          }`}
                                        >
                                          {r.owner || "\u2014"}
                                        </span>
                                      )}
                                    </td>
                                    {(["criticalPath", "timeline", "content"] as const).map(
                                      (field) => (
                                        <td key={field} className="px-4 py-2.5">
                                          {editingCell === cellKey(field) ? (
                                            <input
                                              autoFocus
                                              className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                              defaultValue={r[field]}
                                              onBlur={(e) => {
                                                updateField(
                                                  p.id,
                                                  r.deliverable,
                                                  field,
                                                  e.target.value,
                                                );
                                                setEditingCell(null);
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                  (e.target as HTMLInputElement).blur();
                                                if (e.key === "Escape") setEditingCell(null);
                                              }}
                                            />
                                          ) : (
                                            <span
                                              onClick={() => setEditingCell(cellKey(field))}
                                              className={`cursor-pointer block min-h-[24px] px-2 py-0.5 rounded text-sm hover:bg-blue-50 transition-colors ${
                                                r[field]
                                                  ? "text-gray-700"
                                                  : "text-gray-300 italic"
                                              }`}
                                            >
                                              {r[field] || "Click to edit"}
                                            </span>
                                          )}
                                        </td>
                                      ),
                                    )}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
