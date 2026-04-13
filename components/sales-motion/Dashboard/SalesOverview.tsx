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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="mt-3 text-sm text-gray-500">Loading sales data...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Closed / Won Deals',
      value: metrics.closedWon.toLocaleString(),
      icon: Trophy,
      color: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100 text-green-600',
      valueColor: 'text-green-700',
    },
    {
      label: 'Pipeline # of Deals',
      value: metrics.pipelineDeals.toLocaleString(),
      icon: Hash,
      color: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
      valueColor: 'text-blue-700',
    },
    {
      label: 'Pipeline $$$ In-Year Value',
      value: metrics.pipelineInYear > 0 ? fmtCompact(metrics.pipelineInYear) : '$0',
      icon: DollarSign,
      color: 'bg-indigo-50 border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-600',
      valueColor: 'text-indigo-700',
    },
    {
      label: 'Pipeline $$$ Total Value',
      value: metrics.pipelineTotal > 0 ? fmtCompact(metrics.pipelineTotal) : '$0',
      icon: TrendingUp,
      color: 'bg-purple-50 border-purple-200',
      iconBg: 'bg-purple-100 text-purple-600',
      valueColor: 'text-purple-700',
    },
    {
      label: 'Total Leads Generated',
      value: metrics.totalLeads.toLocaleString(),
      icon: PlusCircle,
      color: 'bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-600',
      valueColor: 'text-amber-700',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Sales Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Key pipeline and revenue metrics across all reps and campaigns.</p>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className={`rounded-2xl border p-5 ${kpi.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className={`text-3xl font-bold ${kpi.valueColor}`}>{kpi.value}</div>
                <div className="text-sm text-gray-600 mt-1">{kpi.label}</div>
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm font-medium text-gray-500 mb-1">Active Campaigns</div>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalMotions}</div>
            <div className="text-xs text-gray-400 mt-1">Across {USERS.length} reps</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm font-medium text-gray-500 mb-1">Parent Campaigns</div>
            <div className="text-2xl font-bold text-gray-900">{metrics.parentCount}</div>
            <div className="text-xs text-gray-400 mt-1">Templates for reps to clone</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm font-medium text-gray-500 mb-1">Actual Revenue Booked</div>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalRevenue > 0 ? fmtCompact(metrics.totalRevenue) : '$0'}</div>
            <div className="text-xs text-gray-400 mt-1">From reported actuals</div>
          </div>
        </div>

        {/* Per-rep summary */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Rep Summary</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-2.5 font-medium text-gray-500">Rep</th>
                <th className="px-5 py-2.5 font-medium text-gray-500 text-right">Campaigns</th>
                <th className="px-5 py-2.5 font-medium text-gray-500 text-right">Leads</th>
                <th className="px-5 py-2.5 font-medium text-gray-500 text-right">Wins</th>
                <th className="px-5 py-2.5 font-medium text-gray-500 text-right">Revenue Target</th>
                <th className="px-5 py-2.5 font-medium text-gray-500 text-right">Actual</th>
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
                  <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="px-5 py-2.5 font-medium text-gray-800">{user.displayName}</td>
                    <td className="px-5 py-2.5 text-right text-gray-700">{motions.length}</td>
                    <td className="px-5 py-2.5 text-right text-gray-700">{leads}</td>
                    <td className="px-5 py-2.5 text-right text-green-700 font-medium">{wins}</td>
                    <td className="px-5 py-2.5 text-right text-gray-700">{target > 0 ? fmtCompact(target) : '—'}</td>
                    <td className="px-5 py-2.5 text-right text-gray-700">{actual > 0 ? fmtCompact(actual) : '—'}</td>
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
