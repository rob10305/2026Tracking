"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  CONTRIBUTORS,
  METRICS,
  GOALS,
  CONTRIBUTION_MONTHS,
  CONTRIBUTION_MONTH_LABELS,
  getAnnualGoal,
  actualKey,
  type MetricId,
} from "@/lib/contribution/data";
import { Edit2 } from "lucide-react";

const TEAM_STYLES: Record<string, { row: string; rowAlt: string; badge: string; text: string }> = {
  cs:      { row: "bg-teal-50",    rowAlt: "bg-teal-50/60",   badge: "bg-teal-100 text-teal-800 border border-teal-200",    text: "text-teal-900" },
  sales:   { row: "bg-orange-50",  rowAlt: "bg-orange-50/60", badge: "bg-orange-100 text-orange-800 border border-orange-200", text: "text-orange-900" },
  partner: { row: "bg-emerald-50", rowAlt: "bg-emerald-50/60",badge: "bg-emerald-100 text-emerald-800 border border-emerald-200", text: "text-emerald-900" },
};

const SECTION_ACCENT: Record<string, string> = {
  beta_customer:       "border-l-4 border-l-violet-400",
  pipeline_value:      "border-l-4 border-l-blue-400",
  pipeline_opps:       "border-l-4 border-l-blue-300",
  new_logo_value:      "border-l-4 border-l-indigo-400",
  reference_customers: "border-l-4 border-l-amber-400",
  multi_year:          "border-l-4 border-l-emerald-400",
};

function fmtCurrency(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtVal(n: number, format: "number" | "currency"): string {
  if (format === "currency") return fmtCurrency(n);
  return String(Math.round(n));
}

function pct(actual: number, goal: number): number {
  if (goal === 0) return actual === 0 ? 100 : 0;
  return Math.round((actual / goal) * 100);
}

function AttainmentBadge({ actual, goal, format }: { actual: number; goal: number; format: "number" | "currency" }) {
  const p = pct(actual, goal);
  const color = p >= 100 ? "text-emerald-600" : p >= 75 ? "text-amber-600" : "text-red-500";
  return (
    <div className="text-center leading-tight">
      <div className="text-[12px] font-semibold text-gray-800">{fmtVal(actual, format)}</div>
      <div className={`text-[10px] font-semibold ${color}`}>{p}%</div>
    </div>
  );
}

export default function ContributionPage() {
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/db/contribution")
      .then((r) => r.json())
      .then((data) => { setActuals(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const totals = useMemo(() => {
    const result: Record<string, Record<string, { goal: number; actual: number }>> = {};
    for (const metric of METRICS) {
      result[metric.id] = {};
      for (const month of CONTRIBUTION_MONTHS) {
        let goalSum = 0;
        let actualSum = 0;
        for (const c of CONTRIBUTORS) {
          const mi = CONTRIBUTION_MONTHS.indexOf(month);
          goalSum += GOALS[c.id]?.[metric.id as MetricId]?.[mi] ?? 0;
          actualSum += actuals[actualKey(c.id, metric.id, month)] ?? 0;
        }
        result[metric.id][month] = { goal: goalSum, actual: actualSum };
      }
      const annualGoal = Object.values(result[metric.id]).reduce((s, v) => s + v.goal, 0);
      const annualActual = Object.values(result[metric.id]).reduce((s, v) => s + v.actual, 0);
      result[metric.id]["annual"] = { goal: annualGoal, actual: annualActual };
    }
    return result;
  }, [actuals]);

  const hasAnyActuals = Object.keys(actuals).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 max-w-[1600px] mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">2026 Individual Goals Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">April to December · Goals vs Attainment</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {CONTRIBUTORS.map((c) => {
              const style = TEAM_STYLES[c.color];
              return (
                <Link
                  key={c.id}
                  href={`/contribution/edit/${c.id}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 ${style.badge}`}
                >
                  <Edit2 className="w-3 h-3" />
                  {c.name} ({c.team})
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          {METRICS.map((metric) => (
            <div key={metric.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${SECTION_ACCENT[metric.id]}`}>
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-700">{metric.label}</span>
                  <span className="text-xs text-gray-400">— {metric.description}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-36 sticky left-0 bg-gray-50">Individual</th>
                      <th className="text-center px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-20">Team</th>
                      {CONTRIBUTION_MONTH_LABELS.map((lbl) => (
                        <th key={lbl} className="text-center px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-24">{lbl}</th>
                      ))}
                      <th className="text-center px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-blue-600 w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONTRIBUTORS.map((c) => {
                      const style = TEAM_STYLES[c.color];
                      const annualGoal = getAnnualGoal(c.id, metric.id as MetricId);
                      const annualActual = CONTRIBUTION_MONTHS.reduce((s, m) => s + (actuals[actualKey(c.id, metric.id, m)] ?? 0), 0);
                      return (
                        <tr
                          key={c.id}
                          className={`${style.row} border-b border-gray-100 hover:brightness-[0.97] transition-all`}
                        >
                          <td className={`px-5 py-2.5 font-semibold text-sm sticky left-0 ${style.row} ${style.text}`}>
                            {c.name}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${style.badge}`}>
                              {c.team}
                            </span>
                          </td>
                          {CONTRIBUTION_MONTHS.map((month, mi) => {
                            const goal = GOALS[c.id]?.[metric.id as MetricId]?.[mi] ?? 0;
                            const actual = actuals[actualKey(c.id, metric.id, month)] ?? null;
                            return (
                              <td key={month} className="px-3 py-2.5 text-center w-24">
                                {actual !== null && hasAnyActuals ? (
                                  <AttainmentBadge actual={actual} goal={goal} format={metric.format} />
                                ) : (
                                  <span className={`text-[12px] font-medium ${style.text}`}>
                                    {fmtVal(goal, metric.format)}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2.5 text-center font-bold">
                            {hasAnyActuals && annualActual > 0 ? (
                              <AttainmentBadge actual={annualActual} goal={annualGoal} format={metric.format} />
                            ) : (
                              <span className={`text-[12px] font-semibold ${style.text}`}>
                                {fmtVal(annualGoal, metric.format)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td className="px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-600 sticky left-0 bg-gray-50">Total</td>
                      <td />
                      {CONTRIBUTION_MONTHS.map((month) => {
                        const { goal, actual } = totals[metric.id]?.[month] ?? { goal: 0, actual: 0 };
                        return (
                          <td key={month} className="px-3 py-2.5 text-center">
                            {hasAnyActuals && actual > 0 ? (
                              <AttainmentBadge actual={actual} goal={goal} format={metric.format} />
                            ) : (
                              <span className="text-[12px] font-bold text-gray-800">
                                {fmtVal(goal, metric.format)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center">
                        {(() => {
                          const { goal, actual } = totals[metric.id]?.["annual"] ?? { goal: 0, actual: 0 };
                          return hasAnyActuals && actual > 0 ? (
                            <AttainmentBadge actual={actual} goal={goal} format={metric.format} />
                          ) : (
                            <span className="text-[12px] font-bold text-blue-700">
                              {fmtVal(goal, metric.format)}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Goal values shown. When actuals are entered via the edit links above, attainment % appears below each value.
        </p>
      </div>
    </div>
  );
}
