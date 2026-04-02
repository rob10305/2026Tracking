"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  CONTRIBUTORS,
  METRICS,
  GOALS,
  CONTRIBUTION_MONTHS,
  CONTRIBUTION_MONTH_LABELS,
  type ContributorId,
  type MetricId,
  type ContributorInfo,
} from "@/lib/contribution/data";
import { Save, RotateCcw } from "lucide-react";

const TEAM_BG: Record<string, string> = {
  cs: "bg-teal-600", sales: "bg-orange-600", partner: "bg-emerald-600",
};

const TEAM_STYLES: Record<string, { badge: string; row: string }> = {
  cs:      { badge: "bg-teal-100 text-teal-800 border border-teal-200",       row: "bg-teal-50/40" },
  sales:   { badge: "bg-orange-100 text-orange-800 border border-orange-200",  row: "bg-orange-50/40" },
  partner: { badge: "bg-emerald-100 text-emerald-800 border border-emerald-200", row: "bg-emerald-50/40" },
};

function Avatar({ contributor, size = 28 }: { contributor: ContributorInfo; size?: number }) {
  if (contributor.photo) {
    return (
      <Image src={contributor.photo} alt={contributor.name} width={size} height={size}
        className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
    );
  }
  return (
    <div className={`${TEAM_BG[contributor.color]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {contributor.name[0]}
    </div>
  );
}

function fmtCurrency(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function getDefault(cid: string, mid: string, monthIdx: number): number {
  return (GOALS as Record<string, Record<string, number[]>>)[cid]?.[mid]?.[monthIdx] ?? 0;
}

export default function GoalsEditorPage() {
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [selectedContributor, setSelectedContributor] = useState<string>(CONTRIBUTORS[0].id);

  useEffect(() => {
    fetch("/api/db/contribution/goals")
      .then((r) => r.json())
      .then((data: Record<string, number>) => {
        setGoals(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const goalKey = (cid: string, mid: string, month: string) => `${cid}::${mid}::${month}`;

  const updateGoal = (cid: string, mid: string, month: string, value: number) => {
    const key = goalKey(cid, mid, month);
    setGoals((prev) => ({ ...prev, [key]: value }));
    setDirty((prev) => new Set(prev).add(key));
  };

  const saveGoal = useCallback(async (cid: string, mid: string, month: string) => {
    const key = goalKey(cid, mid, month);
    const value = goals[key] ?? 0;
    setSaving(key);
    try {
      await fetch("/api/db/contribution/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contributorId: cid, metricId: mid, month, value }),
      });
      setDirty((prev) => { const s = new Set(prev); s.delete(key); return s; });
    } catch (err) {
      console.error("Save failed:", err);
    }
    setSaving(null);
  }, [goals]);

  const resetToDefault = (cid: string, mid: string, month: string, monthIdx: number) => {
    const def = getDefault(cid, mid, monthIdx);
    updateGoal(cid, mid, month, def);
  };

  const saveAll = async () => {
    const keys = Array.from(dirty);
    for (const key of keys) {
      const [cid, mid, month] = key.split("::");
      await saveGoal(cid, mid, month);
    }
  };

  const contributor = CONTRIBUTORS.find((c) => c.id === selectedContributor)!;
  const style = TEAM_STYLES[contributor.color];

  if (!loaded) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals Editor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit monthly goal targets for each contributor. Changes are saved per cell.
          </p>
        </div>
        {dirty.size > 0 && (
          <button onClick={saveAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Save size={14} /> Save All ({dirty.size})
          </button>
        )}
      </div>

      {/* Contributor selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {CONTRIBUTORS.map((c) => {
          const cs = TEAM_STYLES[c.color];
          const isActive = c.id === selectedContributor;
          return (
            <button key={c.id} onClick={() => setSelectedContributor(c.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive ? `${cs.badge} ring-2 ring-offset-1 ring-gray-400` : `${cs.badge} opacity-60 hover:opacity-100`
              }`}>
              <Avatar contributor={c as ContributorInfo} size={22} />
              {c.name} ({c.team})
            </button>
          );
        })}
      </div>

      {/* Goals table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className={`px-5 py-3 border-b border-gray-100 ${style.row}`}>
          <div className="flex items-center gap-2">
            <Avatar contributor={contributor as ContributorInfo} size={28} />
            <h2 className="text-sm font-bold text-gray-800">{contributor.name} — Monthly Goal Targets</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 sticky left-0 bg-gray-50 w-48">
                  Metric
                </th>
                {CONTRIBUTION_MONTH_LABELS.map((lbl) => (
                  <th key={lbl} className="text-center px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-28">
                    {lbl}
                  </th>
                ))}
                <th className="text-center px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50/50 w-28">
                  Annual
                </th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((metric, mi) => {
                const isCurrency = metric.format === "currency";
                let annualTotal = 0;

                return (
                  <tr key={metric.id} className={`border-b border-gray-100 ${mi % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className={`px-4 py-3 sticky left-0 ${mi % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                      <div className="font-semibold text-gray-800 text-sm">{metric.label}</div>
                      <div className="text-[10px] text-gray-400">{metric.description}</div>
                    </td>
                    {CONTRIBUTION_MONTHS.map((month, monthIdx) => {
                      const key = goalKey(selectedContributor, metric.id, month);
                      const value = goals[key] ?? getDefault(selectedContributor, metric.id, monthIdx);
                      const defaultVal = getDefault(selectedContributor, metric.id, monthIdx);
                      const isModified = dirty.has(key);
                      const isSaving = saving === key;
                      annualTotal += value;

                      return (
                        <td key={month} className="px-1 py-2 text-center">
                          <div className="relative">
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => updateGoal(selectedContributor, metric.id, month, Number(e.target.value))}
                              onBlur={() => { if (dirty.has(key)) saveGoal(selectedContributor, metric.id, month); }}
                              onKeyDown={(e) => { if (e.key === "Enter" && dirty.has(key)) saveGoal(selectedContributor, metric.id, month); }}
                              className={`w-full text-center text-xs font-medium border rounded px-1.5 py-1.5 outline-none transition-colors ${
                                isSaving ? "border-blue-400 bg-blue-50" :
                                isModified ? "border-amber-400 bg-amber-50" :
                                "border-gray-200 bg-white hover:border-gray-300 focus:border-blue-400"
                              }`}
                            />
                            {value !== defaultVal && (
                              <button onClick={() => resetToDefault(selectedContributor, metric.id, month, monthIdx)}
                                title={`Reset to default: ${isCurrency ? fmtCurrency(defaultVal) : defaultVal}`}
                                className="absolute -top-1 -right-1 p-0.5 bg-gray-200 rounded-full hover:bg-gray-300">
                                <RotateCcw size={8} className="text-gray-500" />
                              </button>
                            )}
                          </div>
                          <div className="text-[9px] text-gray-400 mt-0.5">
                            {isCurrency ? fmtCurrency(value) : value}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center bg-blue-50/50">
                      <div className="text-sm font-bold text-blue-700">
                        {isCurrency ? fmtCurrency(annualTotal) : annualTotal}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Edit a value and press Tab, Enter, or click away to save. Amber cells have unsaved changes. Use the reset button to revert to default.
      </p>
    </div>
  );
}
