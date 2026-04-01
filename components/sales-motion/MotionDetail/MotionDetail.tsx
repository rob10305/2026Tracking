'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { ActivityTracker } from './ActivityTracker';
import { ProgressBar } from '@/components/sales-motion/shared/ProgressBar';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { ArrowLeft, Link2, GitBranch, Lock, LockOpen, Target, Users, DollarSign } from 'lucide-react';
import { getParentMotion, isChildMotion, countChildren } from '@/lib/sales-motion/utils/inheritance';
import { OUTCOME_TYPE_OPTIONS } from '@/lib/sales-motion/types';
import type { OutcomeType } from '@/lib/sales-motion/types';

export function MotionDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch, fullState, parentMotions } = useTracker();
  const router = useRouter();
  const motion = state.motions.find((m) => m.id === id)
    ?? parentMotions.find((m) => m.id === id);
  const isParent = parentMotions.some((m) => m.id === id);

  const parentMotion = motion && !isParent ? getParentMotion(motion, fullState) : null;
  const childMotion = motion && !isParent ? isChildMotion(motion) : false;
  const childCount = motion ? countChildren(motion, fullState) : 0;

  if (!motion) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Motion not found</p>
          <button onClick={() => router.push('/sales-motion')} className="text-blue-600 text-sm mt-2">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const allTasks = motion.categories.flatMap((c) => c.tasks);
  const total = allTasks.length;
  const complete = allTasks.filter((t) => t.status === 'Complete').length;
  const inProgress = allTasks.filter((t) => t.status === 'In Progress').length;
  const blocked = allTasks.filter((t) => t.status === 'Blocked').length;
  const percent = total > 0 ? Math.round((complete / total) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <button onClick={() => router.push('/sales-motion')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 rounded" style={{ backgroundColor: motion.color }} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">{motion.name}</h1>
                  {childMotion && parentMotion && (
                    <button
                      onClick={() => router.push(`/sales-motion/motion/${parentMotion.id}`)}
                      title="Go to parent campaign"
                      className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200 transition-colors"
                    >
                      <Link2 size={10} /> Child of <span className="font-semibold">{parentMotion.name}</span> ↗
                    </button>
                  )}
                  {childMotion && !parentMotion && (
                    <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                      <Link2 size={10} /> Child Campaign
                    </span>
                  )}
                  {!childMotion && childCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <GitBranch size={10} /> Parent · {childCount} {childCount === 1 ? 'child' : 'children'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{motion.type}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-6 max-w-xl">{motion.description}</p>
            <div className="flex items-center gap-2 mt-2 ml-6">
              <span className="text-xs text-gray-500">Owner:</span>
              <EditableField
                value={motion.owner}
                onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'owner', value: v })}
                placeholder="Set owner"
                className="text-xs"
              />
            </div>

            {/* Expected Outcome + Pipeline Impact */}
            <div className="flex items-center gap-4 mt-3 ml-6 flex-wrap">

              {/* Expected Outcome */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <Target size={13} className="text-purple-500 shrink-0" />
                <span className="text-xs text-gray-500 whitespace-nowrap">Expected Outcome:</span>
                <select
                  value={motion.expectedOutcomeType ?? ''}
                  disabled={!!motion.locked}
                  onChange={(e) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'expectedOutcomeType', value: e.target.value as OutcomeType })}
                  className="text-xs font-medium text-gray-800 bg-transparent border-none outline-none cursor-pointer pr-1"
                >
                  {OUTCOME_TYPE_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o === '' ? 'Select…' : o}</option>
                  ))}
                </select>
                <span className="text-gray-300 mx-0.5">|</span>
                <input
                  type="number"
                  min={0}
                  value={motion.expectedOutcomeValue ?? ''}
                  disabled={!!motion.locked}
                  onChange={(e) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'expectedOutcomeValue', value: e.target.value })}
                  placeholder="Value"
                  className="text-xs font-medium text-gray-800 bg-transparent border-none outline-none w-16 placeholder-gray-400"
                />
              </div>

              {/* Pipeline Impact — Customers */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <Users size={13} className="text-blue-500 shrink-0" />
                <span className="text-xs text-gray-500 whitespace-nowrap">Pipeline Customers:</span>
                <input
                  type="number"
                  min={0}
                  value={motion.pipelineImpactCustomers ?? ''}
                  disabled={!!motion.locked}
                  onChange={(e) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'pipelineImpactCustomers', value: e.target.value })}
                  placeholder="0"
                  className="text-xs font-medium text-gray-800 bg-transparent border-none outline-none w-16 placeholder-gray-400"
                />
              </div>

              {/* Pipeline Impact — $ */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <DollarSign size={13} className="text-green-500 shrink-0" />
                <span className="text-xs text-gray-500 whitespace-nowrap">Pipeline Impact:</span>
                <span className="text-xs text-gray-400">$</span>
                <input
                  type="number"
                  min={0}
                  value={motion.pipelineImpactValue ?? ''}
                  disabled={!!motion.locked}
                  onChange={(e) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'pipelineImpactValue', value: e.target.value })}
                  placeholder="0"
                  className="text-xs font-medium text-gray-800 bg-transparent border-none outline-none w-24 placeholder-gray-400"
                />
              </div>

            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-center px-3 py-1 bg-gray-50 rounded">
              <div className="font-bold text-lg text-gray-800">{total}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div className="text-center px-3 py-1 bg-green-50 rounded">
              <div className="font-bold text-lg text-green-600">{complete}</div>
              <div className="text-gray-500">Complete</div>
            </div>
            <div className="text-center px-3 py-1 bg-amber-50 rounded">
              <div className="font-bold text-lg text-amber-600">{inProgress}</div>
              <div className="text-gray-500">In Progress</div>
            </div>
            <div className="text-center px-3 py-1 bg-red-50 rounded">
              <div className="font-bold text-lg text-red-600">{blocked}</div>
              <div className="text-gray-500">Blocked</div>
            </div>
            <div className="text-center px-3 py-1 rounded" style={{ backgroundColor: motion.color + '15' }}>
              <div className="font-bold text-lg" style={{ color: motion.color }}>{percent}%</div>
              <div className="text-gray-500">Complete</div>
            </div>
          </div>
        </div>

        <div className="mt-3 max-w-md">
          <ProgressBar percent={percent} color={motion.color} />
        </div>

        {motion.locked && (
          <div className="mt-3 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
            <Lock size={15} className="text-amber-600 shrink-0" />
            <span className="text-sm text-amber-800 font-medium">This motion is locked — editing and deletion are disabled.</span>
            <button
              onClick={() => { if (confirm('Unlock this motion? This will allow editing and deletion.')) dispatch({ type: 'TOGGLE_MOTION_LOCK', motionId: motion.id }); }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <LockOpen size={12} /> Unlock
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        <ActivityTracker motion={motion} locked={!!motion.locked} />
      </div>
    </div>
  );
}
