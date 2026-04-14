'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CONTRIBUTORS,
  METRICS,
  GOALS,
  CONTRIBUTION_MONTHS,
  CONTRIBUTION_MONTH_LABELS,
  type ContributorInfo,
  type ContributionMonth,
} from '@/lib/contribution/data';
import { Pencil, Target } from 'lucide-react';

type Period =
  | { type: 'year' }
  | { type: 'quarter'; q: 'Q2' | 'Q3' | 'Q4' }
  | { type: 'month'; month: ContributionMonth };

const QUARTERS: Record<'Q2' | 'Q3' | 'Q4', ContributionMonth[]> = {
  Q2: ['2026-04', '2026-05', '2026-06'],
  Q3: ['2026-07', '2026-08', '2026-09'],
  Q4: ['2026-10', '2026-11', '2026-12'],
};

const TEAM_BG: Record<string, string> = {
  cs: 'bg-teal-600',
  sales: 'bg-orange-600',
  partner: 'bg-emerald-600',
};

const TEAM_BADGE: Record<string, string> = {
  cs: 'bg-teal-100 text-teal-800 border-teal-200',
  sales: 'bg-orange-100 text-orange-800 border-orange-200',
  partner: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
  if (target === 0 && variance === 0) return 'text-gray-400';
  if (variance >= 0) return 'text-emerald-600';
  if (variance >= -target * 0.1) return 'text-amber-600';
  return 'text-red-600';
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
    if (period.type === 'quarter') return QUARTERS[period.q];
    return [period.month];
  }, [period]);

  const periodLabel = useMemo(() => {
    if (period.type === 'year') return 'Full Year (Apr – Dec 2026)';
    if (period.type === 'quarter') {
      const months = QUARTERS[period.q];
      const first = CONTRIBUTION_MONTH_LABELS[CONTRIBUTION_MONTHS.indexOf(months[0])];
      const last = CONTRIBUTION_MONTH_LABELS[CONTRIBUTION_MONTHS.indexOf(months[months.length - 1])];
      return `${period.q} 2026 (${first} – ${last})`;
    }
    return CONTRIBUTION_MONTH_LABELS[CONTRIBUTION_MONTHS.indexOf(period.month)] + ' 2026';
  }, [period]);

  const getGoalFor = (cid: string, mid: string, month: string): number => {
    const key = `${cid}::${mid}::${month}`;
    if (goals[key] !== undefined) return goals[key];
    const mi = CONTRIBUTION_MONTHS.indexOf(month as typeof CONTRIBUTION_MONTHS[number]);
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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600">
          <Target size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Goals vs Actuals</h1>
          <p className="text-sm text-gray-500 mt-0.5">{periodLabel}</p>
        </div>
        <Link
          href="/settings/goals"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          <Pencil size={14} /> Edit Goals
        </Link>
      </div>

      <div className="p-6 space-y-4">
        {/* Period Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 mr-2">Period:</span>

          <button
            onClick={() => setPeriod({ type: 'year' })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              period.type === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Full Year
          </button>

          <div className="h-5 w-px bg-gray-200 mx-1" />

          {(['Q2', 'Q3', 'Q4'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setPeriod({ type: 'quarter', q })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                period.type === 'quarter' && period.q === q
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {q}
            </button>
          ))}

          <div className="h-5 w-px bg-gray-200 mx-1" />

          <select
            value={period.type === 'month' ? period.month : ''}
            onChange={(e) => {
              if (e.target.value) setPeriod({ type: 'month', month: e.target.value as ContributionMonth });
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:border-indigo-400"
          >
            <option value="">Select month…</option>
            {CONTRIBUTION_MONTHS.map((m, i) => (
              <option key={m} value={m}>{CONTRIBUTION_MONTH_LABELS[i]} 2026</option>
            ))}
          </select>
        </div>

        {/* Main matrix table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 sticky left-0 bg-gray-50 w-[220px]">
                    Metric
                  </th>
                  {CONTRIBUTORS.map((c) => (
                    <th key={c.id} className="px-3 py-3 border-b border-gray-200 border-r last:border-r-0 min-w-[170px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <Avatar contributor={c as ContributorInfo} size={64} />
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-800">{c.name}</div>
                          <span className={`inline-block text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded border ${TEAM_BADGE[c.color]}`}>
                            {c.team}
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
                <tr className="bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-1.5 text-left border-b border-r border-gray-200 sticky left-0 bg-gray-50"></th>
                  {CONTRIBUTORS.map((c) => (
                    <th key={c.id} className="px-2 py-1.5 border-b border-gray-200 border-r last:border-r-0">
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
                  <tr key={metric.id} className={mi % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                    <td className={`px-4 py-3 border-b border-r border-gray-200 sticky left-0 ${mi % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                      <div className="font-semibold text-gray-800 text-sm">{metric.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{metric.description}</div>
                    </td>
                    {CONTRIBUTORS.map((c) => {
                      const { target, actual, variance } = cellData(c.id, metric.id);
                      return (
                        <td key={c.id} className="px-2 py-3 border-b border-gray-200 border-r last:border-r-0">
                          <div className="grid grid-cols-3 gap-1 text-center text-xs">
                            <div>
                              <div className="font-semibold text-gray-700">{fmtValue(target, metric.format)}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{fmtValue(actual, metric.format)}</div>
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

        <p className="text-xs text-gray-400 text-center">
          Target values come from Settings → Goals Editor. Actuals are updated by each contributor on the contribution page.
          <span className="inline-block mx-2">•</span>
          <span className="text-emerald-600 font-semibold">Green</span> = on or above target,
          <span className="text-amber-600 font-semibold"> Amber</span> = within 10%,
          <span className="text-red-600 font-semibold"> Red</span> = more than 10% under.
        </p>
      </div>
    </div>
  );
}
