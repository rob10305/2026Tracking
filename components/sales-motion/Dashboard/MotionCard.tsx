'use client';

import { useRouter } from 'next/navigation';
import type { Motion } from '@/lib/sales-motion/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { ChevronRight, Users, TrendingUp, Target, Trophy, Trash2, Link2, GitBranch, Lock, LockOpen } from 'lucide-react';
import { formatCurrency, parseCurrency } from '@/lib/sales-motion/utils/currency';
import { isChildMotion, countChildren } from '@/lib/sales-motion/utils/inheritance';

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
  const { dispatch, fullState } = useTracker();

  const revenue = parseCurrency(motion.contributionGoal);
  const revenueDisplay = revenue > 0 ? formatCurrency(revenue) : motion.contributionGoal || '';
  const childMotion = isChildMotion(motion);
  const childCount = countChildren(motion, fullState);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-shadow cursor-pointer relative overflow-hidden hover:shadow-md ${motion.locked ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200'}`}
      onClick={() => router.push(`/sales-motion/motion/${motion.id}`)}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: motion.locked ? '#f59e0b' : motion.color }} />
      {motion.locked && (
        <div className="absolute top-2 right-12 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
          <Lock size={9} /> Locked
        </div>
      )}

      <div className="ml-4 mr-3 py-4 flex items-center gap-4 flex-wrap">
        {/* Motion name / type */}
        <div className="min-w-[160px] shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">{motion.name}</h3>
            {childMotion && motion.parentMotionId && (
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/sales-motion/motion/${motion.parentMotionId}`); }}
                title="Go to parent campaign"
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 transition-colors"
              >
                <Link2 size={9} /> Child Campaign ↗
              </button>
            )}
            {!childMotion && childCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                <GitBranch size={9} /> Parent · {childCount} {childCount === 1 ? 'child' : 'children'}
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

        <div className="flex items-center gap-1 shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              if (motion.locked) {
                if (confirm(`Unlock "${motion.name}"? This will allow editing and deletion.`)) {
                  dispatch({ type: 'TOGGLE_MOTION_LOCK', motionId: motion.id });
                }
              } else {
                dispatch({ type: 'TOGGLE_MOTION_LOCK', motionId: motion.id });
              }
            }}
            title={motion.locked ? 'Unlock motion' : 'Lock motion'}
            className={`p-1.5 rounded-lg transition-colors ${motion.locked ? 'text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'}`}
          >
            {motion.locked ? <Lock size={15} /> : <LockOpen size={15} />}
          </button>
          <button
            onClick={() => {
              if (motion.locked) return;
              if (confirm(`Remove "${motion.name}" from your motions? This cannot be undone.`)) {
                dispatch({ type: 'DELETE_MOTION', motionId: motion.id });
              }
            }}
            disabled={!!motion.locked}
            className={`p-1.5 rounded-lg transition-colors ${motion.locked ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
            title={motion.locked ? 'Unlock motion to delete' : 'Remove motion'}
          >
            <Trash2 size={15} />
          </button>
          <ChevronRight size={18} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
