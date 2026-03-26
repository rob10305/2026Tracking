'use client';

import { useRouter } from 'next/navigation';
import type { Motion, RAG } from '@/lib/sales-motion/types';
import { RAG_OPTIONS } from '@/lib/sales-motion/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { ChevronRight } from 'lucide-react';
import { parseCurrency, formatCurrency } from '@/lib/sales-motion/utils/currency';

export function MotionCard({ motion }: { motion: Motion }) {
  const router = useRouter();
  const { dispatch } = useTracker();

  const goal = parseCurrency(motion.contributionGoal);
  const actual = parseCurrency(motion.actual);
  const variance = actual - goal;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
      onClick={() => router.push(`/sales-motion/motion/${motion.id}`)}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: motion.color }} />
      <div className="ml-4 mr-3 py-4 flex items-center gap-6">
        <div className="min-w-[160px] shrink-0">
          <h3 className="text-base font-semibold text-gray-900">{motion.name}</h3>
          <p className="text-[11px] text-gray-500 leading-tight">{motion.type}</p>
          <div className="flex items-center gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] text-gray-400">Owner:</span>
            <EditableField
              value={motion.owner}
              onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'owner', value: v })}
              placeholder="Set owner"
              className="text-xs"
            />
          </div>
        </div>

        <div className="min-w-[130px] shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] text-gray-400 block mb-0.5">Contribution to Revenue Goal</span>
          <EditableField
            value={motion.contributionGoal}
            onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'contributionGoal', value: v })}
            placeholder="$0"
            className="text-sm font-semibold text-gray-900"
          />
        </div>

        <div className="min-w-[130px] shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] text-gray-400 block mb-0.5">Actual</span>
          <EditableField
            value={motion.actual}
            onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'actual', value: v })}
            placeholder="$0"
            className="text-sm font-semibold text-gray-900"
          />
        </div>

        <div className="min-w-[130px] shrink-0">
          <span className="text-[11px] text-gray-400 block mb-0.5">Variance</span>
          <span className={`text-sm font-semibold ${
            goal === 0 && actual === 0 ? 'text-gray-400' : variance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {goal === 0 && actual === 0 ? '—' : formatCurrency(variance)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] text-gray-400">RAG:</span>
          <SelectDropdown<RAG>
            value={motion.ragStatus}
            options={RAG_OPTIONS}
            onChange={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'ragStatus', value: v })}
          />
        </div>

        <div className="flex-1 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] text-gray-400 block mb-0.5">Focus / Key Actions</span>
          <EditableField
            value={motion.focusNote}
            onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'focusNote', value: v })}
            placeholder="Add focus note…"
            className="text-xs text-gray-700"
            multiline
          />
        </div>

        <ChevronRight size={18} className="text-gray-400 shrink-0" />
      </div>
    </div>
  );
}
