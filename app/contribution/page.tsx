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
  type ContributionMonth,
  type MetricId,
  type ContributorId,
  type ContributorInfo,
} from "@/lib/contribution/data";
import { Edit2, LayoutGrid, CalendarDays } from "lucide-react";
import Image from "next/image";

const TEAM_BG: Record<string, string> = {
  cs: "bg-teal-600", sales: "bg-orange-600", partner: "bg-emerald-600",
};

function Avatar({ contributor, size = 28 }: { contributor: ContributorInfo; size?: number }) {
  if (contributor.photo) {
    return (
      <Image
        src={contributor.photo}
        alt={contributor.name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`${TEAM_BG[contributor.color]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {contributor.name[0]}
    </div>
  );
}

const TEAM_STYLES: Record<string, { row: string; badge: string; text: string; header: string }> = {
  cs:      { row: "bg-teal-50",    badge: "bg-teal-100 text-teal-800 border border-teal-200",       text: "text-teal-900",    header: "bg-teal-50/80" },
  sales:   { row: "bg-orange-50",  badge: "bg-orange-100 text-orange-800 border border-orange-200",  text: "text-orange-900",  header: "bg-orange-50/80" },
  partner: { row: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-800 border border-emerald-200", text: "text-emerald-900", header: "bg-emerald-50/80" },
};

const SECTION_ACCENT: Record<string, string> = {
  beta_customer:       "border-l-4 border-l-violet-400",
  pipeline_value:      "border-l-4 border-l-blue-400",
  pipeline_opps:       "border-l-4 border-l-blue-300",
  new_logo_value:      "border-l-4 border-l-indigo-400",
  reference_customers: "border-l-4 border-l-amber-400",
  multi_year:          "border-l-4 border-l-emerald-400",
};

const METRIC_ACCENT_BG: Record<string, string> = {
  beta_customer:       "bg-violet-50",
  pipeline_value:      "bg-blue-50",
  pipeline_opps:       "bg-blue-50",
  new_logo_value:      "bg-indigo-50",
  reference_customers: "bg-amber-50",
  multi_year:          "bg-emerald-50",
};

function fmtCurrency(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtVal(n: number, format: "number" | "currency"): string {
  return format === "currency" ? fmtCurrency(n) : String(Math.round(n));
}

function calcPct(actual: number, goal: number): number {
  if (goal === 0) return actual === 0 ? 100 : 0;
  return Math.round((actual / goal) * 100);
}

function pctColor(p: number): string {
  if (p >= 100) return "text-emerald-600";
  if (p >= 75) return "text-amber-600";
  return "text-red-500";
}

function AttainmentBadge({ actual, goal, format }: { actual: number; goal: number; format: "number" | "currency" }) {
  const p = calcPct(actual, goal);
  return (
    <div className="text-center leading-tight">
      <div className="text-[12px] font-semibold text-gray-800">{fmtVal(actual, format)}</div>
      <div className={`text-[10px] font-semibold ${pctColor(p)}`}>{p}%</div>
    </div>
  );
}

type ViewMode = "summary" | "annual";

export default function ContributionPage() {
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("summary");

  const defaultMonthIdx = useMemo(() => {
    const now = new Date();
    const nowYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const idx = CONTRIBUTION_MONTHS.findIndex((m) => m >= nowYM);
    return Math.max(0, idx === -1 ? CONTRIBUTION_MONTHS.length - 1 : idx);
  }, []);

  const [selectedMonthIdx, setSelectedMonthIdx] = useState(defaultMonthIdx);
  const selectedMonth = CONTRIBUTION_MONTHS[selectedMonthIdx] as ContributionMonth;

  useEffect(() => {
    fetch("/api/db/contribution")
      .then((r) => r.json())
      .then((data: Record<string, number | string>) => {
        const nums: Record<string, number> = {};
        for (const [k, v] of Object.entries(data)) {
          if (typeof v === "number") nums[k] = v;
        }
        setActuals(nums);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const annualTotals = useMemo(() => {
    const result: Record<string, Record<string, { goal: number; actual: number }>> = {};
    for (const metric of METRICS) {
      result[metric.id] = {};
      for (const month of CONTRIBUTION_MONTHS) {
        let goalSum = 0; let actualSum = 0;
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

  const EditLinks = () => (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {CONTRIBUTORS.map((c) => {
        const style = TEAM_STYLES[c.color];
        return (
          <Link key={c.id} href={`/contribution/edit/${c.id}`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 ${style.badge}`}>
            <Avatar contributor={c} size={20} />
            {c.name} ({c.team})
          </Link>
        );
      })}
    </div>
  );

  const ToggleBar = () => (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
      <button
        onClick={() => setViewMode("summary")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          viewMode === "summary"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <CalendarDays className="w-3.5 h-3.5" />
        Summary
      </button>
      <button
        onClick={() => setViewMode("annual")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          viewMode === "annual"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Annual View
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 max-w-[1600px] mx-auto">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">2026 Individual Goals Tracker</h1>
            <p className="text-sm text-gray-500 mt-1">April to December · Goals vs Attainment</p>
          </div>
          <EditLinks />
        </div>

        <div className="flex items-center gap-3 mb-5">
          <ToggleBar />
          {viewMode === "summary" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Month</label>
              <select
                value={selectedMonthIdx}
                onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
                className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                {CONTRIBUTION_MONTHS.map((m, i) => (
                  <option key={m} value={i}>{CONTRIBUTION_MONTH_LABELS[i]} 2026</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── SUMMARY VIEW ── */}
        {viewMode === "summary" && (
          <SummaryView
            selectedMonth={selectedMonth}
            selectedMonthIdx={selectedMonthIdx}
            actuals={actuals}
            loaded={loaded}
          />
        )}

        {/* ── ANNUAL VIEW ── */}
        {viewMode === "annual" && (
          <AnnualView
            actuals={actuals}
            annualTotals={annualTotals}
            hasAnyActuals={hasAnyActuals}
            loaded={loaded}
          />
        )}

        <p className="text-xs text-gray-400 mt-6 text-center">
          Goal values shown. When actuals are entered via the edit links, attainment % appears below each value.
        </p>
      </div>
    </div>
  );
}

function SummaryView({
  selectedMonth,
  selectedMonthIdx,
  actuals,
  loaded,
}: {
  selectedMonth: string;
  selectedMonthIdx: number;
  actuals: Record<string, number>;
  loaded: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700">
          {CONTRIBUTION_MONTH_LABELS[selectedMonthIdx]} 2026 — Monthly Snapshot
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 sticky left-0 bg-white w-44">Goal</th>
              {CONTRIBUTORS.map((c) => {
                const style = TEAM_STYLES[c.color];
                return (
                  <th key={c.id} className={`text-center px-3 py-2.5 ${style.header}`}>
                    <div className="flex flex-col items-center gap-1">
                      <Avatar contributor={c} size={32} />
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-700">{c.name}</div>
                      <div className="text-[10px] font-normal text-gray-400">{c.team}</div>
                    </div>
                  </th>
                );
              })}
              <th className="text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50/50 w-28">
                Team Total
              </th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric, mi) => {
              const accentBg = METRIC_ACCENT_BG[metric.id];
              let teamGoalSum = 0;
              let teamActualSum = 0;

              const cells = CONTRIBUTORS.map((c) => {
                const idx = CONTRIBUTION_MONTHS.indexOf(selectedMonth);
                const goal = GOALS[c.id as ContributorId]?.[metric.id as MetricId]?.[idx] ?? 0;
                const actual = actuals[actualKey(c.id, metric.id, selectedMonth)] ?? null;
                teamGoalSum += goal;
                if (actual !== null) teamActualSum += actual;
                return { c, goal, actual };
              });

              const teamPct = calcPct(teamActualSum, teamGoalSum);
              const hasTeamActual = cells.some((x) => x.actual !== null);

              return (
                <tr key={metric.id} className={`border-b border-gray-100 ${mi % 2 === 0 ? "bg-white" : "bg-gray-50/20"}`}>
                  <td className={`px-5 py-3.5 sticky left-0 ${mi % 2 === 0 ? "bg-white" : "bg-gray-50/20"}`}>
                    <div className="relative group inline-block">
                      <div className="font-semibold text-gray-800 text-sm leading-tight cursor-default">{metric.label}</div>
                      <div className="pointer-events-none absolute left-0 top-full mt-1.5 z-50 hidden group-hover:block w-52 rounded-lg bg-gray-800 px-2.5 py-1.5 text-[11px] text-white shadow-lg">
                        {metric.description}
                      </div>
                    </div>
                  </td>
                  {cells.map(({ c, goal, actual }) => {
                    const style = TEAM_STYLES[c.color];
                    const p = actual !== null ? calcPct(actual, goal) : null;
                    return (
                      <td key={c.id} className={`px-3 py-3.5 text-center ${style.header}`}>
                        {actual !== null ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-semibold text-gray-800">{fmtVal(actual, metric.format)}</span>
                            <span className={`text-[11px] font-semibold ${pctColor(p!)}`}>{p}%</span>
                            <span className="text-[10px] text-gray-400">of {fmtVal(goal, metric.format)}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={`text-sm font-medium ${style.text}`}>{fmtVal(goal, metric.format)}</span>
                            <span className="text-[10px] text-gray-400">goal</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3.5 text-center bg-blue-50/50">
                    {hasTeamActual ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-bold text-gray-800">{fmtVal(teamActualSum, metric.format)}</span>
                        <span className={`text-[11px] font-bold ${pctColor(teamPct)}`}>{teamPct}%</span>
                        <span className="text-[10px] text-gray-400">of {fmtVal(teamGoalSum, metric.format)}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-bold text-blue-700">{fmtVal(teamGoalSum, metric.format)}</span>
                        <span className="text-[10px] text-gray-400">team goal</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnnualView({
  actuals,
  annualTotals,
  hasAnyActuals,
  loaded,
}: {
  actuals: Record<string, number>;
  annualTotals: Record<string, Record<string, { goal: number; actual: number }>>;
  hasAnyActuals: boolean;
  loaded: boolean;
}) {
  return (
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
                    <tr key={c.id} className={`${style.row} border-b border-gray-100 hover:brightness-[0.97] transition-all`}>
                      <td className={`px-5 py-2.5 font-semibold text-sm sticky left-0 ${style.row} ${style.text}`}>{c.name}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${style.badge}`}>{c.team}</span>
                      </td>
                      {CONTRIBUTION_MONTHS.map((month, mi) => {
                        const goal = GOALS[c.id]?.[metric.id as MetricId]?.[mi] ?? 0;
                        const actual = actuals[actualKey(c.id, metric.id, month)] ?? null;
                        return (
                          <td key={month} className="px-3 py-2.5 text-center w-24">
                            {actual !== null && hasAnyActuals
                              ? <AttainmentBadge actual={actual} goal={goal} format={metric.format} />
                              : <span className={`text-[12px] font-medium ${style.text}`}>{fmtVal(goal, metric.format)}</span>}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center font-bold">
                        {hasAnyActuals && annualActual > 0
                          ? <AttainmentBadge actual={annualActual} goal={annualGoal} format={metric.format} />
                          : <span className={`text-[12px] font-semibold ${style.text}`}>{fmtVal(annualGoal, metric.format)}</span>}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-600 sticky left-0 bg-gray-50">Total</td>
                  <td />
                  {CONTRIBUTION_MONTHS.map((month) => {
                    const { goal, actual } = annualTotals[metric.id]?.[month] ?? { goal: 0, actual: 0 };
                    return (
                      <td key={month} className="px-3 py-2.5 text-center">
                        {hasAnyActuals && actual > 0
                          ? <AttainmentBadge actual={actual} goal={goal} format={metric.format} />
                          : <span className="text-[12px] font-bold text-gray-800">{fmtVal(goal, metric.format)}</span>}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-center">
                    {(() => {
                      const { goal, actual } = annualTotals[metric.id]?.["annual"] ?? { goal: 0, actual: 0 };
                      return hasAnyActuals && actual > 0
                        ? <AttainmentBadge actual={actual} goal={goal} format={metric.format} />
                        : <span className="text-[12px] font-bold text-blue-700">{fmtVal(goal, metric.format)}</span>;
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
