'use client';

import { useState } from 'react';
import type { Category, Task, Status, Priority, RAG } from '@/lib/sales-motion/types';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, RAG_OPTIONS } from '@/lib/sales-motion/types';
import { TaskRow } from './TaskRow';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/sales-motion/shared/Toast';

interface CategorySectionProps {
  category: Category;
  showDetail: boolean;
  onUpdateTask: (categoryId: string, taskId: string, field: keyof Task, value: string) => void;
  onDeleteTask: (categoryId: string, taskId: string) => void;
  onAddTask: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateCategoryName: (categoryId: string, name: string) => void;
  onUpdateCategoryField: (categoryId: string, field: string, value: string) => void;
}

export function CategorySection({ category, showDetail, onUpdateTask, onDeleteTask, onAddTask, onDeleteCategory, onUpdateCategoryName, onUpdateCategoryField }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const { toast } = useToast();

  const handleDeleteCategory = () => {
    if (confirm(`Delete category "${category.name}" and all its tasks?`)) {
      onDeleteCategory(category.id);
      toast(`Category "${category.name}" deleted`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
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
          <EditableField value={category.name} onSave={(name) => onUpdateCategoryName(category.id, name)} className="font-semibold text-sm text-gray-800" />
          <span className="text-[10px] text-gray-400 font-normal ml-1">({category.tasks.length})</span>
        </td>
        <td className="px-2 py-2">
          <EditableField value={category.assignedTo} onSave={(v) => onUpdateCategoryField(category.id, 'assignedTo', v)} placeholder="—" className="text-xs" />
        </td>
        <td className="px-2 py-2">
          <SelectDropdown<Status> value={category.status} options={STATUS_OPTIONS} onChange={(v) => onUpdateCategoryField(category.id, 'status', v)} />
        </td>
        <td className="px-2 py-2">
          <SelectDropdown<Priority> value={category.priority} options={PRIORITY_OPTIONS} onChange={(v) => onUpdateCategoryField(category.id, 'priority', v)} />
        </td>
        <td className="px-2 py-2">
          <input type="date" value={category.dueDate} onChange={(e) => onUpdateCategoryField(category.id, 'dueDate', e.target.value)} className="border border-gray-300 rounded px-1 py-0.5 text-xs" />
        </td>
        <td className="px-2 py-2">
          <input type="date" value={category.completedDate} onChange={(e) => onUpdateCategoryField(category.id, 'completedDate', e.target.value)} className="border border-gray-300 rounded px-1 py-0.5 text-xs" />
        </td>
        <td className="px-2 py-2">
          <EditableField value={category.target} onSave={(v) => onUpdateCategoryField(category.id, 'target', v)} placeholder="—" className="text-xs" />
        </td>
        <td className="px-2 py-2">
          <SelectDropdown<RAG> value={category.rag} options={RAG_OPTIONS} onChange={(v) => onUpdateCategoryField(category.id, 'rag', v)} />
        </td>
        <td className="px-2 py-2">
          <EditableField value={category.notes} onSave={(v) => onUpdateCategoryField(category.id, 'notes', v)} placeholder="—" className="text-xs" />
        </td>
        <td className="px-2 py-2 w-8 text-center">
          <button onClick={handleDeleteCategory} className="text-gray-400 hover:text-red-500" title="Delete category"><Trash2 size={14} /></button>
        </td>
      </tr>

      {showDetail && expanded && category.tasks.map((task, idx) => (
        <TaskRow
          key={task.id}
          task={task}
          index={idx}
          onUpdate={(field, value) => onUpdateTask(category.id, task.id, field, value)}
          onDelete={() => handleDeleteTask(task.id)}
        />
      ))}

      {showDetail && expanded && (
        <tr className="border-b border-gray-100">
          <td colSpan={11} className="px-2 py-1">
            <button onClick={() => onAddTask(category.id)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 pl-4">
              <Plus size={13} /> Add task
            </button>
          </td>
        </tr>
      )}
    </>
  );
}
