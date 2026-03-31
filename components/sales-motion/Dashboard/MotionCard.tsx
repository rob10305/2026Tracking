'use client';

import { useRouter } from 'next/navigation';
import type { Motion } from '@/lib/sales-motion/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { ChevronRight, Users, TrendingUp, Target, Trophy, Trash2, Link2 } from 'lucide-react';
import { formatCurrency, parseCurrency } from '@/lib/sales-motion/utils/currency';
import { isChildMotion } from '@/lib/sales-motion/utils/inheritance';

function StatBox({
  icon,
  label,
  value,
  accent,
  editable,
  onSave,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  editable?: boolean;
  onSave?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 px-5 py-3 rounded-xl border ${accent} min-w-[130px]`}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium opacity-70">
        {icon}
        {label}
      </div>
      {editable && onSave ? (
        <EditableField
          value={value}
          onSave={onSave}
          placeholder={placeholder ?? '—'}
          className="text-xl font-bold"
        />
      ) : (
        <div className="text-xl font-bold">{value || '—'}</div>
      )}
    </div>
  );
}

export function MotionCard({ motion }: { motion: Motion }) {
  const router = useRouter();
  const { dispatch } = useTracker();

  const revenue = parseCurrency(motion.contributionGoal);
  const revenueDisplay = revenue > 0 ? formatCurrency(revenue) : motion.contributionGoal || '';
  const childMotion = isChildMotion(motion);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
      onClick={() => router.push(`/sales-motion/motion/${motion.id}`)}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: motion.color }} />

      <div className="ml-4 mr-3 py-4 flex items-center gap-4 flex-wrap">
        {/* Motion name / type */}
        <div className="min-w-[160px] shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">{motion.name}</h3>
            {childMotion && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                <Link2 size={9} /> Child
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">{motion.type}</p>
          <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] text-gray-400">Owner:</span>
            <EditableField
              value={motion.owner}
              onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'owner', value: v })}
              placeholder="Set owner"
              className="text-xs"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <StatBox
            icon={<Users size={11} />}
            label="Sellers"
            value="1"
            accent="border-gray-200 bg-gray-50 text-gray-700"
          />
          <StatBox
            icon={<TrendingUp size={11} />}
            label="Revenue Expected"
            value={revenueDisplay}
            accent="border-green-200 bg-green-50 text-green-800"
            editable
            onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'contributionGoal', value: v })}
            placeholder="$0"
          />
          <StatBox
            icon={<Target size={11} />}
            label="Leads"
            value={motion.leads}
            accent="border-blue-200 bg-blue-50 text-blue-800"
            editable
            onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'leads', value: v })}
            placeholder="0"
          />
          <StatBox
            icon={<Trophy size={11} />}
            label="Wins"
            value={motion.wins}
            accent="border-amber-200 bg-amber-50 text-amber-800"
            editable
            onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'wins', value: v })}
            placeholder="0"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              if (confirm(`Remove "${motion.name}" from your motions? This cannot be undone.`)) {
                dispatch({ type: 'DELETE_MOTION', motionId: motion.id });
              }
            }}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove motion"
          >
            <Trash2 size={15} />
          </button>
          <ChevronRight size={18} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
