'use client';

import { useRouter } from 'next/navigation';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { MONTHS } from '@/lib/sales-motion/types';
import { ArrowLeft } from 'lucide-react';

export function MonthlyKPIGrid() {
  const { state } = useTracker();
  const router = useRouter();

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <button onClick={() => router.push('/sales-motion')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <h1 className="text-xl font-bold text-gray-900">Monthly KPIs — All Motions</h1>
      </div>

      <div className="p-6 space-y-8">
        {state.motions.map((motion) => (
          <div key={motion.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200" style={{ backgroundColor: motion.color + '10' }}>
              <div className="w-2.5 h-6 rounded" style={{ backgroundColor: motion.color }} />
              <h2 className="text-sm font-semibold text-gray-800">{motion.name}</h2>
              <span className="text-xs text-gray-500">{motion.type}</span>
              <button
                onClick={() => router.push(`/sales-motion/motion/${motion.id}`)}
                className="ml-auto text-xs text-blue-600 hover:text-blue-800"
              >
                View details →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2 text-left sticky left-0 bg-gray-50 min-w-[160px]">KPI / Metric</th>
                    <th className="px-3 py-2 text-left min-w-[100px]">Annual Target</th>
                    {MONTHS.map((m) => (
                      <th key={m} className="px-3 py-2 text-center min-w-[60px]">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {motion.kpiRows.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-3 py-4 text-center text-gray-400 italic">No KPIs configured</td>
                    </tr>
                  ) : (
                    motion.kpiRows.map((kpi) => (
                      <tr key={kpi.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700 sticky left-0 bg-white">{kpi.metric || '—'}</td>
                        <td className="px-3 py-2 text-gray-600">{kpi.annualTarget || '—'}</td>
                        {MONTHS.map((m) => (
                          <td key={m} className="px-3 py-2 text-center text-gray-600">{kpi.monthly[m] || '—'}</td>
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
