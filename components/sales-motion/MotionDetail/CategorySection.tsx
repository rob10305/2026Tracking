'use client';

import { useState } from 'react';
import type { Category, Task, Motion } from '@/lib/sales-motion/types';
import { TaskRow } from './TaskRow';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { StatusSelect } from '@/components/sales-motion/shared/StatusSelect';
import { ChevronDown, ChevronRight, Plus, Trash2, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/sales-motion/shared/Toast';
import { resolveEffectiveTask } from '@/lib/sales-motion/utils/inheritance';

interface CategorySectionProps {
  category: Category;
  showDetail: boolean;
  parentMotion: Motion | null;
  isChildMotion: boolean;
  locked: boolean;
  onUpdateTask: (categoryId: string, taskId: string, field: keyof Task, value: string) => void;
  onDeleteTask: (categoryId: string, taskId: string) => void;
  onAddTask: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateCategoryName: (categoryId: string, name: string) => void;
  onUpdateCategoryField: (categoryId: string, field: string, value: string) => void;
  onResetTaskOverride: (categoryId: string, taskId: string) => void;
}

export function CategorySection({
  category, showDetail, parentMotion, isChildMotion, locked,
  onUpdateTask, onDeleteTask, onAddTask, onDeleteCategory,
  onUpdateCategoryName, onUpdateCategoryField, onResetTaskOverride,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const { toast } = useToast();

  const outstandingDeps = category.tasks.filter(
    (t) => t.keyDependency && t.keyDependency.trim() !== '' && t.dependencyStatus !== 'Complete',
  ).length;

  const handleDeleteCategory = () => {
    if (locked) return;
    if (confirm(`Delete category "${category.name}" and all its tasks?`)) {
      onDeleteCategory(category.id);
      toast(`Category "${category.name}" deleted`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (locked) return;
    if (confirm('Delete this task?')) {
      onDeleteTask(category.id, taskId);
      toast('Task deleted');
    }
  };

  return (
    <>
      <tr className="bg-gray-50 border-b border-gray-200 hover:bg-gray-100/70">
        <td className="px-2 py-2 w-8 text-center">
          <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-700">
            {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        </td>
        <td className="px-2 py-2 font-semibold text-sm text-gray-800">
          {locked
            ? <span className="font-semibold text-sm text-gray-800">{category.name}</span>
            : <EditableField value={category.name} onSave={(name) => onUpdateCategoryName(category.id, name)} className="font-semibold text-sm text-gray-800" />}
          <span className="text-[10px] text-gray-400 font-normal ml-1">({category.tasks.length})</span>
        </td>
        <td className="px-2 py-2">
          {locked
            ? <span className="text-xs text-gray-600">{category.assignedTo || '—'}</span>
            : <EditableField value={category.assignedTo} onSave={(v) => onUpdateCategoryField(category.id, 'assignedTo', v)} placeholder="—" className="text-xs" />}
        </td>
        <td className="px-2 py-2">
          <StatusSelect
            value={category.status}
            onChange={(v) => onUpdateCategoryField(category.id, 'status', v)}
            disabled={locked}
          />
        </td>
        <td className="px-2 py-2">
          <input
            type="date"
            value={category.dueDate}
            disabled={locked}
            onChange={(e) => onUpdateCategoryField(category.id, 'dueDate', e.target.value)}
            className={`border border-gray-300 rounded px-1 py-0.5 text-xs ${locked ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
          />
        </td>
        <td className="px-2 py-2 text-center">
          {outstandingDeps > 0 ? (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200"
              title={`${outstandingDeps} outstanding dependenc${outstandingDeps === 1 ? 'y' : 'ies'}`}
            >
              <AlertCircle size={10} /> {outstandingDeps}
            </span>
          ) : (
            <span className="text-[10px] text-gray-300">—</span>
          )}
        </td>
        <td className="px-2 py-2">
          {locked
            ? <span className="text-xs text-gray-600">{category.notes || '—'}</span>
            : <EditableField value={category.notes} onSave={(v) => onUpdateCategoryField(category.id, 'notes', v)} placeholder="—" className="text-xs" />}
        </td>
        <td className="px-2 py-2 w-8 text-center">
          {locked
            ? <Lock size={12} className="text-amber-400 mx-auto" />
            : <button onClick={handleDeleteCategory} className="text-gray-400 hover:text-red-500" title="Delete category"><Trash2 size={14} /></button>}
        </td>
      </tr>

      {showDetail && expanded && category.tasks.map((task, idx) => (
        <TaskRow
          key={task.id}
          task={task}
          effectiveTask={resolveEffectiveTask(task, parentMotion)}
          index={idx}
          isChildMotion={isChildMotion}
          locked={locked}
          onUpdate={(field, value) => onUpdateTask(category.id, task.id, field, value)}
          onDelete={() => handleDeleteTask(task.id)}
          onResetOverride={() => onResetTaskOverride(category.id, task.id)}
        />
      ))}

      {showDetail && expanded && !locked && (
        <tr className="border-b border-gray-100">
          <td colSpan={8} className="px-2 py-1">
            <button onClick={() => onAddTask(category.id)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 pl-4">
              <Plus size={13} /> Add task
            </button>
          </td>
        </tr>
      )}
    </>
  );
}
