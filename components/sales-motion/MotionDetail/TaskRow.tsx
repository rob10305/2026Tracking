'use client';

import type { Task } from '@/lib/sales-motion/types';
import { DEPENDENCY_OPTIONS } from '@/lib/sales-motion/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { StatusSelect } from '@/components/sales-motion/shared/StatusSelect';
import { Trash2, Link2, Pencil, RotateCcw, Lock, CheckSquare, Square } from 'lucide-react';
import type { DependencyArea } from '@/lib/sales-motion/types';

const DEP_LABELS: Record<string, string> = {
  '': 'Select Dependency',
  'None': 'None',
  'Marketing': 'Marketing',
  'Sales': 'Sales',
  'Ops': 'Ops',
  'Pre Sales': 'Pre Sales',
  'Product/Engineering': 'Product/Engineering',
};

interface TaskRowProps {
  task: Task;
  effectiveTask: Task;
  index: number;
  isChildMotion: boolean;
  locked: boolean;
  onUpdate: (field: keyof Task, value: string) => void;
  onDelete: () => void;
  onResetOverride: () => void;
}

export function TaskRow({ task, effectiveTask, index, isChildMotion, locked, onUpdate, onDelete, onResetOverride }: TaskRowProps) {
  const isInherited = isChildMotion && !!task.parentTaskId && task.isOverridden === false;
  const isOverridden = isChildMotion && !!task.parentTaskId && task.isOverridden === true;
  const isComplete = task.status === 'Complete';

  const rowBg = isInherited
    ? 'bg-indigo-50/40'
    : isComplete
    ? 'bg-green-50/30'
    : '';

  const handleCompleteToggle = () => {
    if (locked) return;
    if (isComplete) {
      onUpdate('status', 'Not Started');
    } else {
      onUpdate('status', 'Complete');
    }
  };

  return (
    <tr className={`border-b border-gray-100 text-xs ${rowBg}`}>
      <td colSpan={8} className="py-0">
        <div className="flex items-center gap-3 pl-8 pr-2 py-1.5">
          {/* Row number + inheritance indicator */}
          <div className="flex flex-col items-center gap-0.5 text-[10px] text-gray-400 shrink-0 w-4 text-center">
            <span>{index + 1}</span>
            {isInherited && <span title="Inheriting from parent"><Link2 size={9} className="text-indigo-400" /></span>}
            {isOverridden && <span title="Override active"><Pencil size={9} className="text-amber-500" /></span>}
          </div>

          {/* Activity text */}
          <div className="flex-1 min-w-0">
            {locked
              ? <span className="text-xs text-gray-700">{task.activityText || '—'}</span>
              : <EditableField value={task.activityText} onSave={(v) => onUpdate('activityText', v)} className="text-xs" />}
          </div>

          {/* Due Date */}
          <div className="shrink-0">
            <input
              type="date"
              value={task.dueDate}
              disabled={locked}
              onChange={(e) => onUpdate('dueDate', e.target.value)}
              className={`border border-gray-300 rounded px-1.5 py-0.5 text-xs w-[120px] ${locked ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
            />
          </div>

          {/* Status */}
          <div className="shrink-0">
            {isInherited && !locked ? (
              <div className="flex items-center gap-1">
                <StatusSelect value={effectiveTask.status} onChange={() => {}} disabled />
                <button
                  onClick={() => onUpdate('status', effectiveTask.status)}
                  title="Take ownership"
                  className="text-indigo-400 hover:text-indigo-600 p-0.5"
                >
                  <Pencil size={11} />
                </button>
              </div>
            ) : (
              <StatusSelect
                value={task.status}
                onChange={(v) => onUpdate('status', v)}
                disabled={locked}
              />
            )}
          </div>

          {/* Dependency area */}
          <div className="shrink-0">
            {locked ? (
              <span className="text-xs text-gray-600">{task.keyDependency || '—'}</span>
            ) : (
              <select
                value={(task.keyDependency as DependencyArea) || ''}
                onChange={(e) => onUpdate('keyDependency', e.target.value)}
                className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white cursor-pointer outline-none focus:border-blue-400 w-[160px] text-gray-700"
              >
                {DEPENDENCY_OPTIONS.map((d) => (
                  <option key={d} value={d} disabled={d === ''}>
                    {DEP_LABELS[d]}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Notes */}
          <div className="flex-[0_0_140px] min-w-0">
            {locked
              ? <span className="text-xs text-gray-600 truncate block">{task.notes || '—'}</span>
              : <EditableField value={task.notes} onSave={(v) => onUpdate('notes', v)} placeholder="Notes…" className="text-xs" />}
          </div>

          {/* Complete checkbox */}
          <button
            onClick={handleCompleteToggle}
            disabled={locked}
            title={isComplete ? 'Mark incomplete' : 'Mark complete'}
            className={`shrink-0 transition-colors ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${isComplete ? 'text-green-600' : 'text-gray-300 hover:text-green-500'}`}
          >
            {isComplete ? <CheckSquare size={16} /> : <Square size={16} />}
          </button>

          {/* Actions */}
          {locked ? (
            <Lock size={12} className="text-amber-400 shrink-0" />
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              {isOverridden && (
                <button onClick={onResetOverride} title="Reset to parent status" className="text-indigo-400 hover:text-indigo-600 p-0.5">
                  <RotateCcw size={12} />
                </button>
              )}
              <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-0.5">
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
