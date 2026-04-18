'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { ActivityTracker } from './ActivityTracker';
import { ProgressBar } from '@/components/sales-motion/shared/ProgressBar';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { ArrowLeft, Link2, GitBranch, Lock, LockOpen, Users, DollarSign } from 'lucide-react';
import { getParentMotion, isChildMotion, countChildren } from '@/lib/sales-motion/utils/inheritance';

export function MotionDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch, fullState, parentMotions, isLoading } = useTracker();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-accent-sky" />
          <p className="mt-3 text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  const motion = state.motions.find((m) => m.id === id)
    ?? parentMotions.find((m) => m.id === id);
  const isParent = parentMotions.some((m) => m.id === id);

  const parentMotion = motion && !isParent ? getParentMotion(motion, fullState) : null;
  const childMotion = motion && !isParent ? isChildMotion(motion) : false;
  const childCount = motion ? countChildren(motion, fullState) : 0;

  if (!motion) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-center">
          <p className="text-gray-400">Motion not found</p>
          <button onClick={() => router.push('/sales-motion')} className="text-accent-sky text-sm mt-2 hover:underline">Back to Dashboard</button>
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
    <div className="flex-1 overflow-auto bg-canvas">
      <div className="px-8 py-6 border-b border-white/5 bg-canvas-raised/40">
        <button onClick={() => router.push('/sales-motion')} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-10 rounded-full" style={{ backgroundColor: motion.color }} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{motion.name}</h1>
                  {childMotion && parentMotion && (
                    <button
                      onClick={() => router.push(`/sales-motion/motion/${parentMotion.id}`)}
                      title="Go to parent campaign"
                      className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet border border-accent-violet/30 hover:bg-accent-violet/20 transition-colors"
                    >
                      <Link2 size={10} /> Child of <span className="font-semibold">{parentMotion.name}</span> ↗
                    </button>
                  )}
                  {childMotion && !parentMotion && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet border border-accent-violet/30">
                      <Link2 size={10} /> Child Campaign
                    </span>
                  )}
                  {!childMotion && childCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
                      <GitBranch size={10} /> Parent · {childCount} {childCount === 1 ? 'child' : 'children'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{motion.type}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-4 max-w-xl">{motion.description}</p>
            <div className="flex items-center gap-2 mt-3 ml-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Owner</span>
              <EditableField
                value={motion.owner}
                onSave={(v) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'owner', value: v })}
                placeholder="Set owner"
                className="text-xs text-gray-300"
              />
            </div>

            {/* Pipeline Impact */}
            <div className="flex items-center gap-3 mt-3 ml-4 flex-wrap">

              {/* Pipeline Impact — Customers */}
              <div className="flex items-center gap-1.5 bg-canvas border border-white/10 rounded-md px-3 py-1.5">
                <Users size={13} className="text-accent-sky shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap">Pipeline Customers</span>
                <input
                  type="number"
                  min={0}
                  value={motion.pipelineImpactCustomers ?? ''}
                  disabled={!!motion.locked}
                  onChange={(e) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'pipelineImpactCustomers', value: e.target.value })}
                  placeholder="0"
                  className="text-xs font-medium text-white bg-transparent border-none outline-none w-16 placeholder-gray-600"
                />
              </div>

              {/* Pipeline Impact — $ */}
              <div className="flex items-center gap-1.5 bg-canvas border border-white/10 rounded-md px-3 py-1.5">
                <DollarSign size={13} className="text-accent-emerald shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap">Pipeline Impact</span>
                <span className="text-xs text-gray-500">$</span>
                <input
                  type="number"
                  min={0}
                  value={motion.pipelineImpactValue ?? ''}
                  disabled={!!motion.locked}
                  onChange={(e) => dispatch({ type: 'UPDATE_MOTION_FIELD', motionId: motion.id, field: 'pipelineImpactValue', value: e.target.value })}
                  placeholder="0"
                  className="text-xs font-medium text-white bg-transparent border-none outline-none w-24 placeholder-gray-600"
                />
              </div>

            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="text-center px-3 py-1.5 rounded-md border border-white/10 bg-white/[0.03]">
              <div className="font-bold text-lg text-white">{total}</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">Total</div>
            </div>
            <div className="text-center px-3 py-1.5 rounded-md border border-accent-emerald/30 bg-accent-emerald/10">
              <div className="font-bold text-lg text-accent-emerald">{complete}</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">Complete</div>
            </div>
            <div className="text-center px-3 py-1.5 rounded-md border border-accent-amber/30 bg-accent-amber/10">
              <div className="font-bold text-lg text-accent-amber">{inProgress}</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">In Progress</div>
            </div>
            <div className="text-center px-3 py-1.5 rounded-md border border-accent-rose/30 bg-accent-rose/10">
              <div className="font-bold text-lg text-accent-rose">{blocked}</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">Blocked</div>
            </div>
            <div className="text-center px-3 py-1.5 rounded-md border" style={{ backgroundColor: motion.color + '15', borderColor: motion.color + '55' }}>
              <div className="font-bold text-lg" style={{ color: motion.color }}>{percent}%</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">Complete</div>
            </div>
          </div>
        </div>

        <div className="mt-4 max-w-md">
          <ProgressBar percent={percent} color={motion.color} />
        </div>

        {motion.locked && (
          <div className="mt-4 flex items-center gap-3 bg-accent-amber/10 border border-accent-amber/30 rounded-lg px-4 py-2.5">
            <Lock size={15} className="text-accent-amber shrink-0" />
            <span className="text-sm text-accent-amber font-medium">This motion is locked — editing and deletion are disabled.</span>
            <button
              onClick={() => { if (confirm('Unlock this motion? This will allow editing and deletion.')) dispatch({ type: 'TOGGLE_MOTION_LOCK', motionId: motion.id }); }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-accent-amber border border-accent-amber/40 rounded-md hover:bg-accent-amber/15 transition-colors"
            >
              <LockOpen size={12} /> Unlock
            </button>
          </div>
        )}
      </div>

      <div className="p-8">
        <ActivityTracker motion={motion} locked={!!motion.locked} />
      </div>
    </div>
  );
}
