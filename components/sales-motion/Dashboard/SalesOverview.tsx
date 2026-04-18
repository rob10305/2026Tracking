'use client';

import { useMemo } from 'react';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { USERS } from '@/lib/sales-motion/types';
import { parseCurrency, formatCurrency } from '@/lib/sales-motion/utils/currency';
import { Trophy, Hash, DollarSign, TrendingUp, PlusCircle } from 'lucide-react';

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return formatCurrency(n);
}

type Accent = 'sky' | 'emerald' | 'amber' | 'violet' | 'rose';

const ACCENT: Record<Accent, { text: string; border: string; glow: string }> = {
  sky:     { text: 'text-accent-sky',     border: 'border-l-accent-sky',     glow: 'glow-sky' },
  emerald: { text: 'text-accent-emerald', border: 'border-l-accent-emerald', glow: 'glow-emerald' },
  amber:   { text: 'text-accent-amber',   border: 'border-l-accent-amber',   glow: 'glow-amber' },
  violet:  { text: 'text-accent-violet',  border: 'border-l-accent-violet',  glow: 'glow-violet' },
  rose:    { text: 'text-accent-rose',    border: 'border-l-accent-rose',    glow: 'bg-accent-rose/12' },
};

export function SalesOverview() {
  const { fullState, parentMotions, isLoading } = useTracker();

  const metrics = useMemo(() => {
    let closedWon = 0;
    let totalLeads = 0;
    let pipelineDeals = 0;
    let pipelineInYear = 0;
    let pipelineTotal = 0;
    let totalMotions = 0;
    let totalRevenue = 0;

    for (const user of USERS) {
      const motions = fullState.users[user.id]?.motions ?? [];
      for (const m of motions) {
        totalMotions++;
        closedWon += parseInt(m.wins || '0', 10) || 0;
        totalLeads += parseInt(m.leads || '0', 10) || 0;
        totalRevenue += parseCurrency(m.actual);
        pipelineInYear += parseCurrency(m.contributionGoal);
        pipelineTotal += parseCurrency(m.pipelineImpactValue || '');
        if (parseCurrency(m.pipelineImpactValue || '') > 0 || parseCurrency(m.contributionGoal) > 0) {
          pipelineDeals += parseInt(m.pipelineImpactCustomers || '0', 10) || 0;
        }
      }
    }

    return { closedWon, totalLeads, pipelineDeals, pipelineInYear, pipelineTotal, totalMotions, totalRevenue, parentCount: parentMotions.length };
  }, [fullState, parentMotions]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-accent-sky" />
          <p className="mt-3 text-sm text-gray-400">Loading sales data...</p>
        </div>
      </div>
    );
  }

  const kpis: {
    label: string;
    value: string;
    icon: typeof Trophy;
    accent: Accent;
  }[] = [
    { label: 'Closed / Won Deals',        value: metrics.closedWon.toLocaleString(),                                    icon: Trophy,     accent: 'emerald' },
    { label: 'Pipeline # of Deals',       value: metrics.pipelineDeals.toLocaleString(),                                icon: Hash,       accent: 'sky' },
    { label: 'Pipeline $$$ In-Year',      value: metrics.pipelineInYear > 0 ? fmtCompact(metrics.pipelineInYear) : '$0', icon: DollarSign, accent: 'violet' },
    { label: 'Pipeline $$$ Total',        value: metrics.pipelineTotal > 0 ? fmtCompact(metrics.pipelineTotal) : '$0',  icon: TrendingUp, accent: 'rose' },
    { label: 'Total Leads Generated',     value: metrics.totalLeads.toLocaleString(),                                   icon: PlusCircle, accent: 'amber' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-canvas">
      <div className="px-8 py-6 border-b border-white/5 bg-canvas-raised/40">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-emerald">
          FY2026
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white tracking-tight">Sales Overview</h1>
        <p className="text-sm text-gray-400 mt-1">
          Key pipeline and revenue metrics across all reps and campaigns.
        </p>
      </div>

      <div className="p-8 space-y-8">
        {/* KPI Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const a = ACCENT[kpi.accent];
            return (
              <div
                key={kpi.label}
                className={`relative overflow-hidden bg-canvas-raised border border-white/5 ${a.border} border-l-4 rounded-xl p-5`}
              >
                <div
                  aria-hidden
                  className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${a.glow} blur-3xl pointer-events-none`}
                />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${a.text}`}
                       style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <Icon size={20} />
                  </div>
                  <div className={`mt-4 text-3xl font-bold ${a.text}`}>{kpi.value}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mt-2">
                    {kpi.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-canvas-raised border border-white/5 rounded-xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">Active Campaigns</div>
            <div className="text-2xl font-bold text-white mt-2">{metrics.totalMotions}</div>
            <div className="text-xs text-gray-500 mt-1">Across {USERS.length} reps</div>
          </div>
          <div className="bg-canvas-raised border border-white/5 rounded-xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">Parent Campaigns</div>
            <div className="text-2xl font-bold text-white mt-2">{metrics.parentCount}</div>
            <div className="text-xs text-gray-500 mt-1">Templates for reps to clone</div>
          </div>
          <div className="bg-canvas-raised border border-white/5 rounded-xl p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">Actual Revenue Booked</div>
            <div className="text-2xl font-bold text-white mt-2">
              {metrics.totalRevenue > 0 ? fmtCompact(metrics.totalRevenue) : '$0'}
            </div>
            <div className="text-xs text-gray-500 mt-1">From reported actuals</div>
          </div>
        </div>

        {/* Per-rep summary */}
        <div className="bg-canvas-raised border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white tracking-tight">Rep Summary</h2>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
              FY2026
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02] text-left">
                <th className="px-5 py-2.5 font-semibold text-[10px] uppercase tracking-[0.2em] text-gray-500">Rep</th>
                <th className="px-5 py-2.5 font-semibold text-[10px] uppercase tracking-[0.2em] text-gray-500 text-right">Campaigns</th>
                <th className="px-5 py-2.5 font-semibold text-[10px] uppercase tracking-[0.2em] text-gray-500 text-right">Leads</th>
                <th className="px-5 py-2.5 font-semibold text-[10px] uppercase tracking-[0.2em] text-gray-500 text-right">Wins</th>
                <th className="px-5 py-2.5 font-semibold text-[10px] uppercase tracking-[0.2em] text-gray-500 text-right">Revenue Target</th>
                <th className="px-5 py-2.5 font-semibold text-[10px] uppercase tracking-[0.2em] text-gray-500 text-right">Actual</th>
              </tr>
            </thead>
            <tbody>
              {USERS.map((user) => {
                const motions = fullState.users[user.id]?.motions ?? [];
                const leads = motions.reduce((s, m) => s + (parseInt(m.leads || '0', 10) || 0), 0);
                const wins = motions.reduce((s, m) => s + (parseInt(m.wins || '0', 10) || 0), 0);
                const target = motions.reduce((s, m) => s + parseCurrency(m.contributionGoal), 0);
                const actual = motions.reduce((s, m) => s + parseCurrency(m.actual), 0);
                return (
                  <tr key={user.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5 font-medium text-white">{user.displayName}</td>
                    <td className="px-5 py-2.5 text-right text-gray-300">{motions.length}</td>
                    <td className="px-5 py-2.5 text-right text-gray-300">{leads}</td>
                    <td className="px-5 py-2.5 text-right text-accent-emerald font-medium">{wins}</td>
                    <td className="px-5 py-2.5 text-right text-gray-300">{target > 0 ? fmtCompact(target) : '—'}</td>
                    <td className="px-5 py-2.5 text-right text-gray-300">{actual > 0 ? fmtCompact(actual) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
