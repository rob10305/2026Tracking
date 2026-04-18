"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CONTRIBUTORS,
  METRICS,
  GOALS,
  CONTRIBUTION_MONTHS,
  CONTRIBUTION_MONTH_LABELS,
  actualKey,
  type ContributionMonth,
  type MetricId,
  type ContributorId,
  type ContributorInfo,
} from "@/lib/contribution/data";
import { LayoutGrid, CalendarDays, Target } from "lucide-react";
import Image from "next/image";

// Team → accent token mapping (dark theme)
const TEAM_ACCENT: Record<
  string,
  { text: string; bg: string; border: string; dot: string; rowBg: string; headerBg: string }
> = {
  cs: {
    text: "text-accent-sky",
    bg: "bg-accent-sky/10",
    border: "border-accent-sky/30",
    dot: "bg-accent-sky",
    rowBg: "bg-accent-sky/[0.06]",
    headerBg: "bg-accent-sky/[0.08]",
  },
  sales: {
    text: "text-accent-emerald",
    bg: "bg-accent-emerald/10",
    border: "border-accent-emerald/30",
    dot: "bg-accent-emerald",
    rowBg: "bg-accent-emerald/[0.06]",
    headerBg: "bg-accent-emerald/[0.08]",
  },
  partner: {
    text: "text-accent-violet",
    bg: "bg-accent-violet/10",
    border: "border-accent-violet/30",
    dot: "bg-accent-violet",
    rowBg: "bg-accent-violet/[0.06]",
    headerBg: "bg-accent-violet/[0.08]",
  },
};

function Avatar({ contributor, size = 28 }: { contributor: ContributorInfo; size?: number }) {
  if (contributor.photo) {
    return (
      <Image
        src={contributor.photo}
        alt={contributor.name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
        style={{ width: size, height: size }}
      />
    );
  }
  const accent = TEAM_ACCENT[contributor.color] ?? TEAM_ACCENT.cs;
  return (
    <div
      className={`${accent.dot} rounded-full flex items-center justify-center text-[#050914] font-bold flex-shrink-0 ring-1 ring-white/10`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {contributor.name[0]}
    </div>
  );
}

// Left-border accent per metric, all on accent palette
const SECTION_ACCENT: Record<string, string> = {
  beta_customer:       "border-l-4 border-l-accent-violet",
  pipeline_value:      "border-l-4 border-l-accent-sky",
  pipeline_opps:       "border-l-4 border-l-accent-sky",
  new_logo_value:      "border-l-4 border-l-accent-violet",
  reference_customers: "border-l-4 border-l-accent-amber",
  multi_year:          "border-l-4 border-l-accent-emerald",
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
  if (p >= 100) return "text-accent-emerald";
  if (p >= 75) return "text-accent-amber";
  return "text-accent-rose";
}

function AttainmentBadge({
  actual,
  goal,
  format,
}: {
  actual: number;
  goal: number;
  format: "number" | "currency";
}) {
  const p = calcPct(actual, goal);
  return (
    <div className="text-center leading-tight">
      <div className="text-[12px] font-semibold text-white">{fmtVal(actual, format)}</div>
      <div className={`text-[10px] font-bold ${pctColor(p)}`}>{p}%</div>
    </div>
  );
}

type ViewMode = "summary" | "annual";

export default function ContributionPage() {
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [goalsMap, setGoalsMap] = useState<Record<string, number>>({});
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

  // Helper to get a goal value: DB-loaded map first, hardcoded fallback
  const getGoalValue = useCallback(
    (cid: string, mid: string, month: string): number => {
      const key = `${cid}::${mid}::${month}`;
      if (key in goalsMap) return goalsMap[key];
      const mi = CONTRIBUTION_MONTHS.indexOf(month as ContributionMonth);
      return GOALS[cid as ContributorId]?.[mid as MetricId]?.[mi] ?? 0;
    },
    [goalsMap],
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/db/contribution").then((r) => r.json()),
      fetch("/api/db/contribution/goals").then((r) => r.json()).catch(() => ({})),
    ]).then(([actualsData, goalsData]) => {
      const nums: Record<string, number> = {};
      for (const [k, v] of Object.entries(actualsData as Record<string, number | string>)) {
        if (typeof v === "number") nums[k] = v;
      }
      setActuals(nums);
      setGoalsMap(goalsData as Record<string, number>);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const annualTotals = useMemo(() => {
    const result: Record<string, Record<string, { goal: number; actual: number }>> = {};
    for (const metric of METRICS) {
      result[metric.id] = {};
      for (const month of CONTRIBUTION_MONTHS) {
        let goalSum = 0;
        let actualSum = 0;
        for (const c of CONTRIBUTORS) {
          goalSum += getGoalValue(c.id, metric.id, month);
          actualSum += actuals[actualKey(c.id, metric.id, month)] ?? 0;
        }
        result[metric.id][month] = { goal: goalSum, actual: actualSum };
      }
      const annualGoal = Object.values(result[metric.id]).reduce((s, v) => s + v.goal, 0);
      const annualActual = Object.values(result[metric.id]).reduce((s, v) => s + v.actual, 0);
      result[metric.id]["annual"] = { goal: annualGoal, actual: annualActual };
    }
    return result;
  }, [actuals, getGoalValue]);

  const hasAnyActuals = Object.keys(actuals).length > 0;

  const EditLinks = () => (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {CONTRIBUTORS.map((c) => {
        const accent = TEAM_ACCENT[c.color] ?? TEAM_ACCENT.cs;
        return (
          <Link
            key={c.id}
            href={`/contribution/edit/${c.id}`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border ${accent.bg} ${accent.border} ${accent.text} hover:brightness-125`}
          >
            <Avatar contributor={c} size={20} />
            {c.name} <span className="opacity-70">· {c.team}</span>
          </Link>
        );
      })}
    </div>
  );

  const ToggleBar = () => (
    <div className="inline-flex items-center bg-canvas-raised border border-white/5 rounded-lg p-1 gap-0.5">
      <button
        onClick={() => setViewMode("summary")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
          viewMode === "summary"
            ? "bg-accent-sky/15 text-accent-sky"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <CalendarDays className="w-3.5 h-3.5" />
        Summary
      </button>
      <button
        onClick={() => setViewMode("annual")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
          viewMode === "annual"
            ? "bg-accent-sky/15 text-accent-sky"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Annual View
      </button>
    </div>
  );

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-accent-sky/10 rounded-full border border-accent-sky/30" />
          <div className="h-3 w-24 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-canvas min-h-0">
      <div className="px-8 py-8 max-w-[1600px] mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent-sky/10 border border-accent-sky/30 flex items-center justify-center">
              <Target size={20} className="text-accent-sky" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-sky">
                FY2026
              </p>
              <h1 className="mt-1 text-3xl font-bold text-white tracking-tight">
                Individual Goals Tracker
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                April to December · Goals vs Attainment
              </p>
            </div>
          </div>
          <EditLinks />
        </div>

        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <ToggleBar />
          {viewMode === "summary" && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                Month
              </label>
              <select
                value={selectedMonthIdx}
                onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
                className="text-sm font-semibold border border-white/10 rounded-md px-3 py-1.5 bg-canvas-raised text-white focus:outline-none focus:border-accent-sky/50"
              >
                {CONTRIBUTION_MONTHS.map((m, i) => (
                  <option key={m} value={i}>
                    {CONTRIBUTION_MONTH_LABELS[i]} 2026
                  </option>
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
            getGoalValue={getGoalValue}
          />
        )}

        {/* ── ANNUAL VIEW ── */}
        {viewMode === "annual" && (
          <AnnualView
            actuals={actuals}
            annualTotals={annualTotals}
            hasAnyActuals={hasAnyActuals}
            getGoalValue={getGoalValue}
          />
        )}

        <div className="mt-6 bg-canvas-raised rounded-xl border border-white/5 px-5 py-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3">
            Edit Goals
          </h3>
          <EditLinks />
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
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
  getGoalValue,
}: {
  selectedMonth: ContributionMonth;
  selectedMonthIdx: number;
  actuals: Record<string, number>;
  getGoalValue: (cid: string, mid: string, month: string) => number;
}) {
  return (
    <div className="bg-canvas-raised rounded-xl border border-white/5 overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-300">
          {CONTRIBUTION_MONTH_LABELS[selectedMonthIdx]} 2026 — Monthly Snapshot
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 sticky left-0 bg-canvas-raised w-44">
                Goal
              </th>
              {CONTRIBUTORS.map((c) => {
                const accent = TEAM_ACCENT[c.color] ?? TEAM_ACCENT.cs;
                return (
                  <th key={c.id} className={`text-center px-3 py-2.5 ${accent.headerBg}`}>
                    <div className="flex flex-col items-center gap-1.5">
                      <Avatar contributor={c} size={32} />
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-gray-500">{c.team}</div>
                    </div>
                  </th>
                );
              })}
              <th className="text-center px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-sky bg-accent-sky/[0.08] w-28">
                Team Total
              </th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric, mi) => {
              let teamGoalSum = 0;
              let teamActualSum = 0;

              const cells = CONTRIBUTORS.map((c) => {
                const goal = getGoalValue(c.id, metric.id, selectedMonth);
                const actual = actuals[actualKey(c.id, metric.id, selectedMonth)] ?? null;
                teamGoalSum += goal;
                if (actual !== null) teamActualSum += actual;
                return { c, goal, actual };
              });

              const teamPct = calcPct(teamActualSum, teamGoalSum);
              const hasTeamActual = cells.some((x) => x.actual !== null);

              return (
                <tr
                  key={metric.id}
                  className={`border-b border-white/5 ${mi % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"}`}
                >
                  <td
                    className={`px-5 py-3.5 sticky left-0 ${mi % 2 === 0 ? "bg-canvas-raised" : "bg-canvas-elevated"}`}
                  >
                    <div className="relative group inline-block">
                      <div className="font-semibold text-white text-sm leading-tight cursor-default">
                        {metric.label}
                      </div>
                      <div className="pointer-events-none absolute left-0 top-full mt-1.5 z-50 hidden group-hover:block w-52 rounded-md bg-canvas-elevated border border-white/10 px-2.5 py-1.5 text-[11px] text-gray-200 shadow-soft-dark">
                        {metric.description}
                      </div>
                    </div>
                  </td>
                  {cells.map(({ c, goal, actual }) => {
                    const accent = TEAM_ACCENT[c.color] ?? TEAM_ACCENT.cs;
                    const p = actual !== null ? calcPct(actual, goal) : null;
                    return (
                      <td key={c.id} className={`px-3 py-3.5 text-center ${accent.headerBg}`}>
                        {actual !== null ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-semibold text-white">
                              {fmtVal(actual, metric.format)}
                            </span>
                            <span className={`text-[11px] font-bold ${pctColor(p!)}`}>{p}%</span>
                            <span className="text-[10px] text-gray-500">
                              of {fmtVal(goal, metric.format)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={`text-sm font-semibold ${accent.text}`}>
                              {fmtVal(goal, metric.format)}
                            </span>
                            <span className="text-[10px] text-gray-500">goal</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3.5 text-center bg-accent-sky/[0.08]">
                    {hasTeamActual ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-bold text-white">
                          {fmtVal(teamActualSum, metric.format)}
                        </span>
                        <span className={`text-[11px] font-bold ${pctColor(teamPct)}`}>
                          {teamPct}%
                        </span>
                        <span className="text-[10px] text-gray-500">
                          of {fmtVal(teamGoalSum, metric.format)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-bold text-accent-sky">
                          {fmtVal(teamGoalSum, metric.format)}
                        </span>
                        <span className="text-[10px] text-gray-500">team goal</span>
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
  getGoalValue,
}: {
  actuals: Record<string, number>;
  annualTotals: Record<string, Record<string, { goal: number; actual: number }>>;
  hasAnyActuals: boolean;
  getGoalValue: (cid: string, mid: string, month: string) => number;
}) {
  return (
    <div className="space-y-5">
      {METRICS.map((metric) => (
        <div
          key={metric.id}
          className={`bg-canvas-raised rounded-xl border border-white/5 overflow-hidden ${SECTION_ACCENT[metric.id]}`}
        >
          <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white">
                {metric.label}
              </span>
              <span className="text-xs text-gray-500">— {metric.description}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="text-left px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 w-36 sticky left-0 bg-canvas-raised">
                    Individual
                  </th>
                  <th className="text-center px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 w-20">
                    Team
                  </th>
                  {CONTRIBUTION_MONTH_LABELS.map((lbl) => (
                    <th
                      key={lbl}
                      className="text-center px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 w-24"
                    >
                      {lbl}
                    </th>
                  ))}
                  <th className="text-center px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-sky w-28">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {CONTRIBUTORS.map((c) => {
                  const accent = TEAM_ACCENT[c.color] ?? TEAM_ACCENT.cs;
                  const annualGoal = CONTRIBUTION_MONTHS.reduce(
                    (s, m) => s + getGoalValue(c.id, metric.id, m),
                    0,
                  );
                  const annualActual = CONTRIBUTION_MONTHS.reduce(
                    (s, m) => s + (actuals[actualKey(c.id, metric.id, m)] ?? 0),
                    0,
                  );
                  return (
                    <tr
                      key={c.id}
                      className={`${accent.rowBg} border-b border-white/5 hover:bg-canvas-elevated transition-colors`}
                    >
                      <td
                        className={`px-5 py-2.5 font-semibold text-sm sticky left-0 ${accent.rowBg} text-white`}
                      >
                        {c.name}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border ${accent.bg} ${accent.border} ${accent.text}`}
                        >
                          {c.team}
                        </span>
                      </td>
                      {CONTRIBUTION_MONTHS.map((month) => {
                        const goal = getGoalValue(c.id, metric.id, month);
                        const actual = actuals[actualKey(c.id, metric.id, month)] ?? null;
                        return (
                          <td key={month} className="px-3 py-2.5 text-center w-24">
                            {actual !== null && hasAnyActuals ? (
                              <AttainmentBadge
                                actual={actual}
                                goal={goal}
                                format={metric.format}
                              />
                            ) : (
                              <span className={`text-[12px] font-medium ${accent.text}`}>
                                {fmtVal(goal, metric.format)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center font-bold">
                        {hasAnyActuals && annualActual > 0 ? (
                          <AttainmentBadge
                            actual={annualActual}
                            goal={annualGoal}
                            format={metric.format}
                          />
                        ) : (
                          <span className={`text-[12px] font-semibold ${accent.text}`}>
                            {fmtVal(annualGoal, metric.format)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-white/[0.03] border-t border-white/10">
                  <td className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 sticky left-0 bg-canvas-elevated">
                    Total
                  </td>
                  <td />
                  {CONTRIBUTION_MONTHS.map((month) => {
                    const { goal, actual } = annualTotals[metric.id]?.[month] ?? { goal: 0, actual: 0 };
                    return (
                      <td key={month} className="px-3 py-2.5 text-center">
                        {hasAnyActuals && actual > 0 ? (
                          <AttainmentBadge actual={actual} goal={goal} format={metric.format} />
                        ) : (
                          <span className="text-[12px] font-bold text-white">
                            {fmtVal(goal, metric.format)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-center">
                    {(() => {
                      const { goal, actual } = annualTotals[metric.id]?.["annual"] ?? {
                        goal: 0,
                        actual: 0,
                      };
                      return hasAnyActuals && actual > 0 ? (
                        <AttainmentBadge actual={actual} goal={goal} format={metric.format} />
                      ) : (
                        <span className="text-[12px] font-bold text-accent-sky">
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
  );
}
