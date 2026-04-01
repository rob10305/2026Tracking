'use client';

import type { Task, Status } from '@/lib/sales-motion/types';
import { STATUS_OPTIONS } from '@/lib/sales-motion/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { StatusSelect } from '@/components/sales-motion/shared/StatusSelect';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { Trash2, Link2, Pencil, RotateCcw, Lock } from 'lucide-react';

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

const DEP_STATUS_COLOURS: Record<string, string> = {
  Complete: 'bg-green-100 text-green-700 border-green-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Blocked: 'bg-red-100 text-red-700 border-red-200',
  'At Risk': 'bg-orange-100 text-orange-700 border-orange-200',
  'Not Started': 'bg-gray-100 text-gray-600 border-gray-200',
};

export function TaskRow({ task, effectiveTask, index, isChildMotion, locked, onUpdate, onDelete, onResetOverride }: TaskRowProps) {
  const isInherited = isChildMotion && !!task.parentTaskId && task.isOverridden === false;
  const isOverridden = isChildMotion && !!task.parentTaskId && task.isOverridden === true;
  const isBlocked = effectiveTask.status === 'Blocked';
  const hasDep = task.keyDependency && task.keyDependency.trim() !== '';

  const rowClass = isInherited
    ? `border-b border-gray-100 text-xs bg-indigo-50/40`
    : `border-b border-gray-100 hover:bg-blue-50/30 text-xs ${isBlocked ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}`;

  return (
    <tr className={rowClass}>
      <td className="px-2 py-1.5 text-gray-400 text-center text-[11px]">
        <div className="flex flex-col items-center gap-0.5">
          <span>{index + 1}</span>
          {isInherited && (
            <span title="Inheriting status from parent" className="text-indigo-400"><Link2 size={10} /></span>
          )}
          {isOverridden && (
            <span title="Overriding parent" className="text-amber-500"><Pencil size={10} /></span>
          )}
        </div>
      </td>
      <td className="px-2 py-1.5 pl-6">
        {locked
          ? <span className="text-xs text-gray-700">{task.activityText || '—'}</span>
          : <EditableField value={task.activityText} onSave={(v) => onUpdate('activityText', v)} className="text-xs" />}
      </td>
      <td className="px-2 py-1.5">
        {locked
          ? <span className="text-xs text-gray-600">{task.assignedTo || '—'}</span>
          : <EditableField value={task.assignedTo} onSave={(v) => onUpdate('assignedTo', v)} placeholder="—" className="text-xs" />}
      </td>
      <td className="px-2 py-1.5">
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
      </td>
      <td className="px-2 py-1.5">
        <input
          type="date"
          value={task.dueDate}
          disabled={locked}
          onChange={(e) => onUpdate('dueDate', e.target.value)}
          className={`border border-gray-300 rounded px-1 py-0.5 text-xs ${locked ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        />
      </td>
      <td className="px-2 py-1.5">
        {hasDep ? (
          <div className="flex flex-col gap-1 min-w-[100px]">
            <span className="text-[10px] text-gray-500 leading-tight truncate max-w-[120px]" title={task.keyDependency}>
              {task.keyDependency}
            </span>
            {locked ? (
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border ${DEP_STATUS_COLOURS[task.dependencyStatus] ?? DEP_STATUS_COLOURS['Not Started']}`}>
                {task.dependencyStatus}
              </span>
            ) : (
              <SelectDropdown<Status>
                value={task.dependencyStatus}
                options={STATUS_OPTIONS}
                onChange={(v) => onUpdate('dependencyStatus', v)}
              />
            )}
          </div>
        ) : (
          <span className="text-[10px] text-gray-300">—</span>
        )}
      </td>
      <td className="px-2 py-1.5">
        {locked
          ? <span className="text-xs text-gray-600">{task.notes || '—'}</span>
          : <EditableField value={task.notes} onSave={(v) => onUpdate('notes', v)} placeholder="—" className="text-xs" />}
      </td>
      <td className="px-2 py-1.5 text-center">
        {locked ? (
          <Lock size={12} className="text-amber-400 mx-auto" />
        ) : (
          <div className="flex items-center justify-center gap-1">
            {isOverridden && (
              <button onClick={onResetOverride} title="Reset to parent status" className="text-indigo-400 hover:text-indigo-600 p-0.5">
                <RotateCcw size={12} />
              </button>
            )}
            <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-0.5"><Trash2 size={13} /></button>
          </div>
        )}
      </td>
    </tr>
  );
}
