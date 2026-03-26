'use client';

import type { Task, Status, Priority, RAG } from '@/lib/sales-motion/types';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, RAG_OPTIONS } from '@/lib/sales-motion/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { Trash2 } from 'lucide-react';

interface TaskRowProps {
  task: Task;
  index: number;
  onUpdate: (field: keyof Task, value: string) => void;
  onDelete: () => void;
}

export function TaskRow({ task, index, onUpdate, onDelete }: TaskRowProps) {
  const isBlocked = task.status === 'Blocked';

  return (
    <tr className={`border-b border-gray-100 hover:bg-blue-50/30 text-xs ${isBlocked ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}`}>
      <td className="px-2 py-1.5 text-gray-400 text-center text-[11px]">{index + 1}</td>
      <td className="px-2 py-1.5 pl-6">
        <EditableField value={task.activityText} onSave={(v) => onUpdate('activityText', v)} className="text-xs" />
      </td>
      <td className="px-2 py-1.5">
        <EditableField value={task.assignedTo} onSave={(v) => onUpdate('assignedTo', v)} placeholder="—" className="text-xs" />
      </td>
      <td className="px-2 py-1.5">
        <SelectDropdown<Status> value={task.status} options={STATUS_OPTIONS} onChange={(v) => onUpdate('status', v)} />
      </td>
      <td className="px-2 py-1.5">
        <SelectDropdown<Priority> value={task.priority} options={PRIORITY_OPTIONS} onChange={(v) => onUpdate('priority', v)} />
      </td>
      <td className="px-2 py-1.5">
        <input type="date" value={task.dueDate} onChange={(e) => onUpdate('dueDate', e.target.value)} className="border border-gray-300 rounded px-1 py-0.5 text-xs" />
      </td>
      <td className="px-2 py-1.5">
        <input type="date" value={task.completedDate} onChange={(e) => onUpdate('completedDate', e.target.value)} className="border border-gray-300 rounded px-1 py-0.5 text-xs" />
      </td>
      <td className="px-2 py-1.5">
        <EditableField value={task.target} onSave={(v) => onUpdate('target', v)} placeholder="—" className="text-xs" />
      </td>
      <td className="px-2 py-1.5">
        <SelectDropdown<RAG> value={task.rag} options={RAG_OPTIONS} onChange={(v) => onUpdate('rag', v)} />
      </td>
      <td className="px-2 py-1.5">
        <EditableField value={task.notes} onSave={(v) => onUpdate('notes', v)} placeholder="—" className="text-xs" />
      </td>
      <td className="px-2 py-1.5 text-center">
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-0.5"><Trash2 size={13} /></button>
      </td>
    </tr>
  );
}
