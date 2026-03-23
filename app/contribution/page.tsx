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
  type ContributorId,
  type MetricId,
  type ContributionMonth,
} from "@/lib/contribution/data";
import { Edit2 } from "lucide-react";

const TEAM_STYLES: Record<string, { row: string; team: string; badge: string }> = {
  cs:      { row: "bg-teal-950/90 text-white",   team: "bg-teal-700 text-white",    badge: "bg-teal-600" },
  sales:   { row: "bg-orange-900/90 text-white",  team: "bg-orange-700 text-white",  badge: "bg-orange-600" },
  partner: { row: "bg-green-900/90 text-white",   team: "bg-green-700 text-white",   badge: "bg-green-600" },
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
  const color = p >= 100 ? "text-emerald-300" : p >= 75 ? "text-amber-300" : "text-red-300";
  return (
    <div className="text-center leading-tight">
      <div className="text-[11px] font-semibold text-white/90">{fmtVal(actual, format)}</div>
      <div className={`text-[10px] font-medium ${color}`}>{p}%</div>
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
    <div className="min-h-screen bg-gray-950">
      <div className="px-4 py-6 max-w-[1600px] mx-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-white">2026 Individual Goals Tracker</h1>
            <p className="text-sm text-gray-400 mt-0.5">April to December · Goals vs Attainment</p>
          </div>
          <div className="flex items-center gap-2">
            {CONTRIBUTORS.map((c) => (
              <Link
                key={c.id}
                href={`/contribution/edit/${c.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors border border-gray-700"
              >
                <Edit2 className="w-3 h-3" />
                {c.name} ({c.team})
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {METRICS.map((metric) => (
            <div key={metric.id} className="rounded-xl overflow-hidden border border-gray-800">
              <div className="bg-gray-800 px-4 py-2.5 flex items-baseline gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-200">{metric.label}</span>
                <span className="text-xs text-gray-500">— {metric.description}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-900/80">
                      <th className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 w-36 sticky left-0 bg-gray-900">Individual</th>
                      <th className="text-center px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 w-20">Team</th>
                      {CONTRIBUTION_MONTH_LABELS.map((lbl) => (
                        <th key={lbl} className="text-center px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 w-24">{lbl}</th>
                      ))}
                      <th className="text-center px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-amber-500 w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONTRIBUTORS.map((c, ci) => {
                      const style = TEAM_STYLES[c.color];
                      const annualGoal = getAnnualGoal(c.id, metric.id as MetricId);
                      const annualActual = CONTRIBUTION_MONTHS.reduce((s, m) => s + (actuals[actualKey(c.id, metric.id, m)] ?? 0), 0);
                      return (
                        <tr
                          key={c.id}
                          className={`${style.row} border-b border-black/20 hover:brightness-110 transition-all`}
                        >
                          <td className={`px-4 py-2.5 font-semibold text-sm sticky left-0 ${style.row}`}>
                            {c.name}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${style.team}`}>
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
                                  <span className="text-[12px] font-medium text-white/80">
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
                              <span className="text-[12px] font-semibold text-amber-400">
                                {fmtVal(annualGoal, metric.format)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-900 border-t-2 border-gray-600">
                      <td className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-300 sticky left-0 bg-gray-900">Total</td>
                      <td />
                      {CONTRIBUTION_MONTHS.map((month) => {
                        const { goal, actual } = totals[metric.id]?.[month] ?? { goal: 0, actual: 0 };
                        return (
                          <td key={month} className="px-3 py-2.5 text-center">
                            {hasAnyActuals && actual > 0 ? (
                              <AttainmentBadge actual={actual} goal={goal} format={metric.format} />
                            ) : (
                              <span className="text-[12px] font-bold text-emerald-400">
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
                            <span className="text-[12px] font-bold text-emerald-400">
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

        <p className="text-xs text-gray-600 mt-6 text-center">
          Goal values shown. When actuals are entered, attainment % appears below each value.
          Use the edit links above to log your numbers.
        </p>
      </div>
    </div>
  );
}
