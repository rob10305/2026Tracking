'use client';

import { useRouter } from 'next/navigation';
import type { Motion } from '@/lib/sales-motion/types';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { Lock, LockOpen, Trash2, ChevronRight, Users, TrendingUp, Target, Trophy } from 'lucide-react';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { formatCurrency, parseCurrency } from '@/lib/sales-motion/utils/currency';
import { USERS } from '@/lib/sales-motion/types';
import type { UserId } from '@/lib/sales-motion/types';

function StatBox({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className={`flex flex-col gap-0.5 px-4 py-2.5 rounded-xl border ${accent} min-w-[110px]`}>
      <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-60">{icon}{label}</div>
      <div className="text-lg font-bold">{value || '—'}</div>
    </div>
  );
}

interface Props {
  motion: Motion;
  childrenByUser: { userId: UserId; motion: Motion }[];
}

export function ParentMotionCard({ motion, childrenByUser }: Props) {
  const router = useRouter();
  const { dispatch } = useTracker();

  const repCount = childrenByUser.length;
  const repNames = childrenByUser.map((c) => USERS.find((u) => u.id === c.userId)?.displayName ?? c.userId);
  const revenueTotal = childrenByUser.reduce((s, c) => s + parseCurrency(c.motion.contributionGoal), 0);
  const leadsTotal = childrenByUser.reduce((s, c) => s + (parseInt(c.motion.leads) || 0), 0);
  const winsTotal = childrenByUser.reduce((s, c) => s + (parseInt(c.motion.wins) || 0), 0);

  return (
    <div className={`bg-white rounded-xl shadow-sm border relative overflow-hidden ${motion.locked ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200'}`}>
      <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-xl" style={{ backgroundColor: motion.locked ? '#f59e0b' : motion.color }} />

      {motion.locked && (
        <div className="absolute top-2 right-12 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
          <Lock size={9} /> Locked
        </div>
      )}

      <div className="ml-4 mr-3 py-3 flex items-center gap-4 flex-wrap">
        {/* Name + meta */}
        <div className="min-w-[200px] shrink-0">
          <div className="flex items-center gap-2">
            <EditableField
              value={motion.name}
              onSave={(v) => !motion.locked && dispatch({ type: 'UPDATE_PARENT_MOTION_FIELD', motionId: motion.id, field: 'name', value: v })}
              placeholder="Campaign name"
              className="text-base font-semibold text-gray-900"
            />
          </div>
          <EditableField
            value={motion.type}
            onSave={(v) => !motion.locked && dispatch({ type: 'UPDATE_PARENT_MOTION_FIELD', motionId: motion.id, field: 'type', value: v })}
            placeholder="Campaign type"
            className="text-[11px] text-gray-500 mt-0.5"
          />
          {repCount > 0 && (
            <p className="text-[10px] text-gray-400 mt-0.5">{repNames.join(', ')}</p>
          )}
        </div>

        {/* Aggregate stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatBox icon={<Users size={10} />} label="Reps" value={repCount > 0 ? String(repCount) : 'None'} accent="border-gray-200 bg-gray-50 text-gray-700" />
          <StatBox icon={<TrendingUp size={10} />} label="Revenue" value={revenueTotal > 0 ? formatCurrency(revenueTotal) : ''} accent="border-green-200 bg-green-50 text-green-800" />
          <StatBox icon={<Target size={10} />} label="Leads" value={leadsTotal > 0 ? String(leadsTotal) : ''} accent="border-blue-200 bg-blue-50 text-blue-800" />
          <StatBox icon={<Trophy size={10} />} label="Wins" value={winsTotal > 0 ? String(winsTotal) : ''} accent="border-amber-200 bg-amber-50 text-amber-800" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PARENT_MOTION_LOCK', motionId: motion.id })}
            title={motion.locked ? 'Unlock' : 'Lock'}
            className={`p-1.5 rounded-lg transition-colors ${motion.locked ? 'text-amber-500 hover:text-amber-600 bg-amber-50' : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50'}`}
          >
            {motion.locked ? <Lock size={15} /> : <LockOpen size={15} />}
          </button>
          <button
            onClick={() => {
              if (motion.locked) return;
              if (confirm(`Delete parent campaign "${motion.name}"?\n\nReps' child campaigns linked to this will still exist but lose their parent link.`)) {
                dispatch({ type: 'DELETE_PARENT_MOTION', motionId: motion.id });
              }
            }}
            disabled={!!motion.locked}
            className={`p-1.5 rounded-lg transition-colors ${motion.locked ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => router.push(`/sales-motion/motion/${motion.id}`)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
