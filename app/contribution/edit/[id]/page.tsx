"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CONTRIBUTORS,
  METRICS,
  GOALS,
  CONTRIBUTION_MONTHS,
  CONTRIBUTION_MONTH_LABELS,
  actualKey,
  type ContributorId,
  type MetricId,
} from "@/lib/contribution/data";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

const TEAM_ACCENT: Record<string, string> = {
  cs:      "bg-teal-600",
  sales:   "bg-orange-600",
  partner: "bg-green-600",
};

function fmtCurrency(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export default function EditContributionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const contributor = CONTRIBUTORS.find((c) => c.id === id);

  const [actuals, setActuals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!contributor) return;
    fetch("/api/db/contribution")
      .then((r) => r.json())
      .then((data: Record<string, number>) => {
        const init: Record<string, string> = {};
        for (const metric of METRICS) {
          for (const month of CONTRIBUTION_MONTHS) {
            const key = actualKey(id, metric.id, month);
            if (data[key] !== undefined) {
              init[key] = String(data[key]);
            }
          }
        }
        setActuals(init);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [id, contributor]);

  const saveActual = useCallback(async (metricId: string, month: string, rawValue: string) => {
    const key = actualKey(id, metricId, month);
    const value = parseFloat(rawValue.replace(/[^0-9.]/g, "")) || 0;
    setSaving((p) => ({ ...p, [key]: true }));
    try {
      await fetch("/api/db/contribution", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contributorId: id, metricId, month, value }),
      });
      setSaved((p) => ({ ...p, [key]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [key]: false })), 2000);
    } finally {
      setSaving((p) => ({ ...p, [key]: false }));
    }
  }, [id]);

  if (!contributor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Contributor not found.</p>
          <Link href="/contribution" className="text-blue-600 hover:underline">Back to tracker</Link>
        </div>
      </div>
    );
  }

  const accent = TEAM_ACCENT[contributor.color];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/contribution" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${accent} flex items-center justify-center text-white font-bold text-sm`}>
              {contributor.name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{contributor.name}</h1>
              <p className="text-sm text-gray-500">{contributor.team} · Monthly Attainment Entry</p>
            </div>
          </div>
        </div>

        {!loaded ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="space-y-6">
            {METRICS.map((metric) => {
              const annualGoal = GOALS[contributor.id as ContributorId]?.[metric.id as MetricId]?.reduce((s, v) => s + v, 0) ?? 0;
              return (
                <div key={metric.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-sm font-bold text-gray-900">{metric.label}</h3>
                      <span className="text-xs text-gray-500">{metric.description}</span>
                      <span className="ml-auto text-xs font-medium text-gray-500">
                        Annual goal:{" "}
                        <span className="text-gray-800 font-semibold">
                          {metric.format === "currency" ? fmtCurrency(annualGoal) : annualGoal}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-28">Month</th>
                          <th className="text-right px-5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Goal</th>
                          <th className="text-right px-5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actual</th>
                          <th className="text-right px-5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-20">%</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {CONTRIBUTION_MONTHS.map((month, mi) => {
                          const goal = GOALS[contributor.id as ContributorId]?.[metric.id as MetricId]?.[mi] ?? 0;
                          const key = actualKey(id, metric.id, month);
                          const rawActual = actuals[key] ?? "";
                          const numActual = parseFloat(rawActual) || 0;
                          const attainPct = goal === 0 ? (numActual === 0 ? 100 : 0) : Math.round((numActual / goal) * 100);
                          const pctColor = attainPct >= 100 ? "text-emerald-600" : attainPct >= 75 ? "text-amber-600" : rawActual ? "text-red-500" : "text-gray-300";

                          return (
                            <tr key={month} className="border-b border-gray-50 hover:bg-gray-50/50">
                              <td className="px-5 py-2.5 font-medium text-gray-700">
                                {CONTRIBUTION_MONTH_LABELS[mi]} 2026
                              </td>
                              <td className="px-5 py-2.5 text-right text-gray-500 tabular-nums">
                                {metric.format === "currency" ? fmtCurrency(goal) : goal}
                              </td>
                              <td className="px-5 py-2.5 text-right">
                                <input
                                  type="number"
                                  min={0}
                                  step={metric.format === "currency" ? 100 : 1}
                                  value={rawActual}
                                  placeholder={metric.format === "currency" ? "0" : "0"}
                                  onChange={(e) =>
                                    setActuals((prev) => ({ ...prev, [key]: e.target.value }))
                                  }
                                  onBlur={() => {
                                    if (rawActual !== "") saveActual(metric.id, month, rawActual);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveActual(metric.id, month, rawActual);
                                  }}
                                  className="w-28 text-right text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </td>
                              <td className={`px-5 py-2.5 text-right font-semibold tabular-nums text-sm ${pctColor}`}>
                                {rawActual ? `${attainPct}%` : "—"}
                              </td>
                              <td className="px-2 py-2.5 w-10 text-center">
                                {saving[key] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 inline-block" />
                                ) : saved[key] ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500 inline-block" />
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                          <td className="px-5 py-2.5 font-bold text-gray-700 text-xs uppercase tracking-wide">Total</td>
                          <td className="px-5 py-2.5 text-right font-semibold text-gray-700 tabular-nums text-sm">
                            {metric.format === "currency" ? fmtCurrency(annualGoal) : annualGoal}
                          </td>
                          <td className="px-5 py-2.5 text-right font-semibold text-gray-800 tabular-nums text-sm">
                            {(() => {
                              const total = CONTRIBUTION_MONTHS.reduce((s, m) => {
                                const k = actualKey(id, metric.id, m);
                                return s + (parseFloat(actuals[k] ?? "0") || 0);
                              }, 0);
                              return total > 0
                                ? metric.format === "currency" ? fmtCurrency(total) : total
                                : "—";
                            })()}
                          </td>
                          <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-sm text-gray-500">
                            {(() => {
                              const total = CONTRIBUTION_MONTHS.reduce((s, m) => {
                                const k = actualKey(id, metric.id, m);
                                return s + (parseFloat(actuals[k] ?? "0") || 0);
                              }, 0);
                              if (total === 0) return "—";
                              const p = annualGoal === 0 ? 0 : Math.round((total / annualGoal) * 100);
                              const c = p >= 100 ? "text-emerald-600" : p >= 75 ? "text-amber-600" : "text-red-500";
                              return <span className={c}>{p}%</span>;
                            })()}
                          </td>
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            <p className="text-xs text-gray-400 text-center pb-4">
              Changes are saved automatically when you move between fields or press Enter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
