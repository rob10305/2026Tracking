'use client';

import { useRouter } from 'next/navigation';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { MONTHS } from '@/lib/sales-motion/types';
import { ArrowLeft } from 'lucide-react';

export function MonthlyKPIGrid() {
  const { state } = useTracker();
  const router = useRouter();

  return (
    <div className="flex-1 overflow-auto bg-canvas">
      <div className="px-8 py-6 border-b border-white/5 bg-canvas-raised/40">
        <button onClick={() => router.push('/sales-motion')} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 hover:text-white mb-3 transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-emerald">FY2026</p>
        <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">Monthly KPIs — All Motions</h1>
      </div>

      <div className="p-8 space-y-6">
        {state.motions.map((motion) => (
          <div key={motion.id} className="bg-canvas-raised rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5" style={{ backgroundColor: motion.color + '15' }}>
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: motion.color }} />
              <h2 className="text-sm font-semibold text-white">{motion.name}</h2>
              <span className="text-[11px] text-gray-400">{motion.type}</span>
              <button
                onClick={() => router.push(`/sales-motion/motion/${motion.id}`)}
                className="ml-auto text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-sky hover:text-white transition-colors"
              >
                View details →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/[0.02] text-gray-500 uppercase tracking-[0.2em]">
                    <th className="px-3 py-2.5 text-left sticky left-0 bg-canvas-raised min-w-[160px] font-semibold text-[10px]">KPI / Metric</th>
                    <th className="px-3 py-2.5 text-left min-w-[100px] font-semibold text-[10px]">Annual Target</th>
                    {MONTHS.map((m) => (
                      <th key={m} className="px-3 py-2.5 text-center min-w-[60px] font-semibold text-[10px]">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {motion.kpiRows.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-3 py-4 text-center text-gray-500 italic">No KPIs configured</td>
                    </tr>
                  ) : (
                    motion.kpiRows.map((kpi) => (
                      <tr key={kpi.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="px-3 py-2 font-medium text-gray-200 sticky left-0 bg-canvas-raised">{kpi.metric || '—'}</td>
                        <td className="px-3 py-2 text-gray-300">{kpi.annualTarget || '—'}</td>
                        {MONTHS.map((m) => (
                          <td key={m} className="px-3 py-2 text-center text-gray-300">{kpi.monthly[m] || '—'}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
