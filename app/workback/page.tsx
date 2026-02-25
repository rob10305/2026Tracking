"use client";

import React, { useState, useCallback } from "react";
import { useStore } from "@/lib/store/context";
import type { LaunchRequirement } from "@/lib/models/types";
import { STANDARD_DELIVERABLES } from "@/lib/models/types";
import { ChevronDown, CheckCircle2, Circle, AlertCircle } from "lucide-react";

const CATEGORY_ORDER = [
  { prefix: "Product", label: "Product", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { prefix: "Marketing", label: "Marketing", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { prefix: "Sales", label: "Sales", color: "bg-green-50 text-green-700 border-green-200" },
  { prefix: "Delivery", label: "Delivery", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { prefix: "Support", label: "Support & Ops", color: "bg-gray-50 text-gray-700 border-gray-200" },
];

function getCategory(deliverable: string) {
  for (const cat of CATEGORY_ORDER) {
    if (deliverable.startsWith(cat.prefix)) return cat;
  }
  return CATEGORY_ORDER[0];
}

function completionCount(reqs: LaunchRequirement[]): { done: number; total: number } {
  const total = reqs.length;
  const done = reqs.filter((r) => r.criticalPath && r.timeline && r.content).length;
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
  const overallPct = totalCompletion.total > 0 ? Math.round((totalCompletion.done / totalCompletion.total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Launch Readiness</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track dependencies and deliverables required to launch each product.
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

      <div className="flex gap-2">
        <button onClick={expandAll} className="text-xs text-blue-600 hover:text-blue-800">Expand All</button>
        <span className="text-gray-300">|</span>
        <button onClick={collapseAll} className="text-xs text-blue-600 hover:text-blue-800">Collapse All</button>
      </div>

      <div className="space-y-4">
        {state.products.map((p) => {
          const reqs = getReqs(p.id);
          const { done, total } = completionCount(reqs);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isExpanded = expandedProducts.has(p.id);

          return (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                    <span className="text-xs text-gray-500">GA: {p.generally_available || "TBD"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
                <div className="border-t border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b text-left text-gray-500">
                        <th className="px-4 py-2.5 font-medium w-[280px]">Dependencies / Deliverables</th>
                        <th className="px-4 py-2.5 font-medium w-[100px]">Owner</th>
                        <th className="px-4 py-2.5 font-medium">Critical Path to $$</th>
                        <th className="px-4 py-2.5 font-medium">Timeline</th>
                        <th className="px-4 py-2.5 font-medium">Content</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reqs.map((r, i) => {
                        const cat = getCategory(r.deliverable);
                        const cellKey = (field: string) => `${p.id}::${r.deliverable}::${field}`;
                        const isComplete = r.criticalPath && r.timeline && r.content;

                        return (
                          <tr
                            key={r.deliverable}
                            className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                          >
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                {isComplete ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                )}
                                <span className="text-gray-800">{r.deliverable}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              {editingCell === cellKey("owner") ? (
                                <input
                                  autoFocus
                                  className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  defaultValue={r.owner}
                                  onBlur={(e) => {
                                    updateField(p.id, r.deliverable, "owner", e.target.value);
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
                                  className={`cursor-pointer inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                                    r.owner ? cat.color : "bg-gray-100 text-gray-400 border-gray-200"
                                  }`}
                                >
                                  {r.owner || "—"}
                                </span>
                              )}
                            </td>
                            {(["criticalPath", "timeline", "content"] as const).map((field) => (
                              <td key={field} className="px-4 py-2.5">
                                {editingCell === cellKey(field) ? (
                                  <input
                                    autoFocus
                                    className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    defaultValue={r[field]}
                                    onBlur={(e) => {
                                      updateField(p.id, r.deliverable, field, e.target.value);
                                      setEditingCell(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                      if (e.key === "Escape") setEditingCell(null);
                                    }}
                                  />
                                ) : (
                                  <span
                                    onClick={() => setEditingCell(cellKey(field))}
                                    className={`cursor-pointer block min-h-[24px] px-2 py-0.5 rounded text-sm hover:bg-blue-50 transition-colors ${
                                      r[field] ? "text-gray-700" : "text-gray-300 italic"
                                    }`}
                                  >
                                    {r[field] || "Click to edit"}
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
