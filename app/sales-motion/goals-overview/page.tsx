'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  CONTRIBUTORS,
  METRICS,
  GOALS,
  CONTRIBUTION_MONTHS,
  CONTRIBUTION_MONTH_LABELS,
  type ContributorInfo,
} from '@/lib/contribution/data';
import { Target } from 'lucide-react';

type QuarterKey = 'Q1' | 'Q2' | 'Q3' | 'Q4';

type Period =
  | { type: 'year' }
  | { type: 'quarter'; q: QuarterKey }
  | { type: 'month'; month: string };

const QUARTERS: Record<QuarterKey, { months: string[]; label: string }> = {
  Q1: { months: ['2026-01', '2026-02', '2026-03'], label: 'Jan – Mar' },
  Q2: { months: ['2026-04', '2026-05', '2026-06'], label: 'Apr – Jun' },
  Q3: { months: ['2026-07', '2026-08', '2026-09'], label: 'Jul – Sep' },
  Q4: { months: ['2026-10', '2026-11', '2026-12'], label: 'Oct – Dec' },
};

// Team → accent token (mirrors the dark theme elsewhere)
const TEAM_ACCENT: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  cs:      { text: 'text-accent-sky',     bg: 'bg-accent-sky/10',     border: 'border-accent-sky/30',     dot: 'bg-accent-sky' },
  sales:   { text: 'text-accent-emerald', bg: 'bg-accent-emerald/10', border: 'border-accent-emerald/30', dot: 'bg-accent-emerald' },
  partner: { text: 'text-accent-violet',  bg: 'bg-accent-violet/10',  border: 'border-accent-violet/30',  dot: 'bg-accent-violet' },
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

function fmtCurrency(n: number): string {
  if (n === 0) return '$0';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}

function fmtNumber(n: number): string {
  return Math.round(n).toLocaleString();
}

function fmtValue(n: number, format: 'number' | 'currency'): string {
  return format === 'currency' ? fmtCurrency(n) : fmtNumber(n);
}

function fmtVariance(n: number, format: 'number' | 'currency'): string {
  if (n === 0) return '0';
  const prefix = n > 0 ? '+' : '';
  return `${prefix}${fmtValue(n, format)}`;
}

function varianceColor(variance: number, target: number): string {
  if (target === 0 && variance === 0) return 'text-gray-500';
  if (variance >= 0) return 'text-accent-emerald';
  if (variance >= -target * 0.1) return 'text-accent-amber';
  return 'text-accent-rose';
}

export default function GoalsOverviewPage() {
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [actuals, setActuals] = useState<Record<string, number | string>>({});
  const [loaded, setLoaded] = useState(false);
  const [period, setPeriod] = useState<Period>({ type: 'year' });

  useEffect(() => {
    Promise.all([
      fetch('/api/db/contribution/goals').then((r) => r.json()),
      fetch('/api/db/contribution').then((r) => r.json()),
    ]).then(([g, a]) => {
      setGoals(g);
      setActuals(a);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const selectedMonths: string[] = useMemo(() => {
    if (period.type === 'year') return [...CONTRIBUTION_MONTHS];
    if (period.type === 'quarter') return QUARTERS[period.q].months;
    return [period.month];
  }, [period]);

  const periodLabel = useMemo(() => {
    if (period.type === 'year') return 'Full Year (Apr – Dec 2026)';
    if (period.type === 'quarter') {
      return `${period.q} 2026 (${QUARTERS[period.q].label})`;
    }
    const idx = (CONTRIBUTION_MONTHS as readonly string[]).indexOf(period.month);
    const label = idx >= 0 ? CONTRIBUTION_MONTH_LABELS[idx] : period.month;
    return `${label} 2026`;
  }, [period]);

  const getGoalFor = (cid: string, mid: string, month: string): number => {
    const key = `${cid}::${mid}::${month}`;
    if (goals[key] !== undefined) return goals[key];
    const mi = (CONTRIBUTION_MONTHS as readonly string[]).indexOf(month);
    if (mi === -1) return 0;
    return (GOALS as Record<string, Record<string, number[]>>)[cid]?.[mid]?.[mi] ?? 0;
  };

  const getActualFor = (cid: string, mid: string, month: string): number => {
    const key = `${cid}::${mid}::${month}`;
    const v = actuals[key];
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return parseFloat(v) || 0;
    return 0;
  };

  const cellData = (cid: string, mid: string) => {
    let target = 0;
    let actual = 0;
    for (const month of selectedMonths) {
      target += getGoalFor(cid, mid, month);
      actual += getActualFor(cid, mid, month);
    }
    return { target, actual, variance: actual - target };
  };

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
    <div className="flex-1 overflow-y-auto bg-canvas">
      <div className="px-8 py-6 border-b border-white/5 bg-canvas-raised/40 flex items-center gap-4 flex-wrap">
        <div className="w-11 h-11 rounded-xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center">
          <Target size={20} className="text-accent-violet" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-violet">FY2026</p>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">Goals vs Actuals</h1>
          <p className="text-sm text-gray-400 mt-0.5">{periodLabel}</p>
        </div>
      </div>

      <div className="p-8 space-y-5">
        {/* Period Selector */}
        <div className="bg-canvas-raised rounded-xl border border-white/5 p-3 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mr-2">Period</span>

          <button
            onClick={() => setPeriod({ type: 'year' })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors border ${
              period.type === 'year'
                ? 'bg-accent-violet/15 text-accent-violet border-accent-violet/40'
                : 'bg-white/[0.02] text-gray-300 border-white/10 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            Full Year
          </button>

          <div className="h-5 w-px bg-white/10 mx-1" />

          {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => {
            const active = period.type === 'quarter' && period.q === q;
            return (
              <button
                key={q}
                onClick={() => setPeriod({ type: 'quarter', q })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors border ${
                  active
                    ? 'bg-accent-violet/15 text-accent-violet border-accent-violet/40'
                    : 'bg-white/[0.02] text-gray-300 border-white/10 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {q}
              </button>
            );
          })}

          <div className="h-5 w-px bg-white/10 mx-1" />

          <select
            value={period.type === 'month' ? period.month : ''}
            onChange={(e) => {
              if (e.target.value) setPeriod({ type: 'month', month: e.target.value });
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-white/10 bg-canvas text-gray-200 focus:outline-none focus:border-accent-violet/50"
          >
            <option value="">Select month…</option>
            {CONTRIBUTION_MONTHS.map((m, i) => (
              <option key={m} value={m}>{CONTRIBUTION_MONTH_LABELS[i]} 2026</option>
            ))}
          </select>
        </div>

        {/* Main matrix table */}
        <div className="bg-canvas-raised rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em] border-b border-r border-white/5 sticky left-0 bg-canvas-raised w-[220px]">
                    Metric
                  </th>
                  {CONTRIBUTORS.map((c) => {
                    const accent = TEAM_ACCENT[c.color] ?? TEAM_ACCENT.cs;
                    return (
                      <th key={c.id} className="px-3 py-3 border-b border-white/5 border-r last:border-r-0 min-w-[170px]">
                        <div className="flex flex-col items-center gap-2">
                          <Avatar contributor={c as ContributorInfo} size={56} />
                          <div className="text-center">
                            <div className="text-sm font-semibold text-white">{c.name}</div>
                            <span className={`inline-block mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full border ${accent.bg} ${accent.border} ${accent.text}`}>
                              {c.team}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
                <tr className="bg-white/[0.02] text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">
                  <th className="px-4 py-1.5 text-left border-b border-r border-white/5 sticky left-0 bg-canvas-raised"></th>
                  {CONTRIBUTORS.map((c) => (
                    <th key={c.id} className="px-2 py-1.5 border-b border-white/5 border-r last:border-r-0">
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <span>Target</span>
                        <span>Actual</span>
                        <span>Var</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((metric, mi) => (
                  <tr
                    key={metric.id}
                    className={mi % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'}
                  >
                    <td className={`px-4 py-3 border-b border-r border-white/5 sticky left-0 ${mi % 2 === 0 ? 'bg-canvas-raised' : 'bg-canvas-elevated'}`}>
                      <div className="font-semibold text-white text-sm">{metric.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{metric.description}</div>
                    </td>
                    {CONTRIBUTORS.map((c) => {
                      const { target, actual, variance } = cellData(c.id, metric.id);
                      return (
                        <td key={c.id} className="px-2 py-3 border-b border-white/5 border-r last:border-r-0">
                          <div className="grid grid-cols-3 gap-1 text-center text-xs">
                            <div>
                              <div className="font-semibold text-gray-400">{fmtValue(target, metric.format)}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-white">{fmtValue(actual, metric.format)}</div>
                            </div>
                            <div>
                              <div className={`font-bold ${varianceColor(variance, target)}`}>
                                {fmtVariance(variance, metric.format)}
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center max-w-3xl mx-auto leading-relaxed">
          Target values come from Settings → Goals Editor. Actuals are updated by each contributor on the contribution page.
          <span className="inline-block mx-2 text-gray-600">•</span>
          <span className="text-accent-emerald font-semibold">Green</span> = on or above target,
          <span className="text-accent-amber font-semibold"> Amber</span> = within 10%,
          <span className="text-accent-rose font-semibold"> Red</span> = more than 10% under.
        </p>
      </div>
    </div>
  );
}
