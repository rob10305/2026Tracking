'use client';

import type { Motion } from '@/lib/sales-motion/types';
import { MONTHS } from '@/lib/sales-motion/types';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { useToast } from '@/components/sales-motion/shared/Toast';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { Trash2, Plus } from 'lucide-react';

export function KPITab({ motion }: { motion: Motion }) {
  const { dispatch } = useTracker();
  const { toast } = useToast();

  const handleUpdate = (kpiId: string, field: string, value: string) => {
    dispatch({ type: 'UPDATE_KPI_ROW', motionId: motion.id, kpiId, field, value });
  };

  const handleDelete = (kpiId: string) => {
    dispatch({ type: 'DELETE_KPI_ROW', motionId: motion.id, kpiId });
    toast('KPI row deleted');
  };

  const handleAdd = () => {
    dispatch({ type: 'ADD_KPI_ROW', motionId: motion.id });
    toast('New KPI row added');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
            <th className="px-3 py-2 sticky left-0 bg-gray-50 min-w-[160px]">KPI / Metric</th>
            <th className="px-3 py-2 min-w-[100px]">Annual Target</th>
            {MONTHS.map((m) => (
              <th key={m} className="px-3 py-2 text-center min-w-[70px]">{m}</th>
            ))}
            <th className="px-2 py-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {motion.kpiRows.map((kpi) => (
            <tr key={kpi.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 sticky left-0 bg-white">
                <EditableField value={kpi.metric} onSave={(v) => handleUpdate(kpi.id, 'metric', v)} className="text-xs font-medium" />
              </td>
              <td className="px-3 py-2">
                <EditableField value={kpi.annualTarget} onSave={(v) => handleUpdate(kpi.id, 'annualTarget', v)} placeholder="—" className="text-xs" />
              </td>
              {MONTHS.map((m) => (
                <td key={m} className="px-3 py-2 text-center">
                  <EditableField value={kpi.monthly[m] || ''} onSave={(v) => handleUpdate(kpi.id, m, v)} placeholder="—" className="text-xs text-center" />
                </td>
              ))}
              <td className="px-2 py-2">
                <button onClick={() => handleDelete(kpi.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAdd} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-3 py-2 mt-1">
        <Plus size={14} /> Add KPI row
      </button>
    </div>
  );
}
