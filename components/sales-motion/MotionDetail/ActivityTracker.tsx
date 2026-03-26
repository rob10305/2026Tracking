'use client';

import type { Motion, Task } from '@/lib/sales-motion/types';
import { CategorySection } from './CategorySection';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { useToast } from '@/components/sales-motion/shared/Toast';
import { Plus, List } from 'lucide-react';
import { useState } from 'react';

export function ActivityTracker({ motion }: { motion: Motion }) {
  const { dispatch } = useTracker();
  const { toast } = useToast();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleUpdateTask = (categoryId: string, taskId: string, field: keyof Task, value: string) => {
    dispatch({ type: 'UPDATE_TASK', motionId: motion.id, categoryId, taskId, field, value });
  };
  const handleDeleteTask = (categoryId: string, taskId: string) => {
    dispatch({ type: 'DELETE_TASK', motionId: motion.id, categoryId, taskId });
  };
  const handleAddTask = (categoryId: string) => {
    dispatch({ type: 'ADD_TASK', motionId: motion.id, categoryId });
    toast('New task added');
  };
  const handleDeleteCategory = (categoryId: string) => {
    dispatch({ type: 'DELETE_CATEGORY', motionId: motion.id, categoryId });
  };
  const handleUpdateCategoryName = (categoryId: string, name: string) => {
    dispatch({ type: 'UPDATE_CATEGORY_NAME', motionId: motion.id, categoryId, name });
  };
  const handleUpdateCategoryField = (categoryId: string, field: string, value: string) => {
    dispatch({ type: 'UPDATE_CATEGORY_FIELD', motionId: motion.id, categoryId, field, value });
  };
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    dispatch({ type: 'ADD_CATEGORY', motionId: motion.id, name: newCategoryName.trim() });
    setNewCategoryName('');
    setShowNewCategory(false);
    toast(`Category "${newCategoryName.trim()}" added`);
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setShowDetail(!showDetail)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-colors ${showDetail ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          <List size={14} />
          Show Detail Activities
          <span className={`ml-1 w-8 h-4 rounded-full relative inline-flex items-center transition-colors ${showDetail ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <span className={`absolute w-3 h-3 bg-white rounded-full transition-transform ${showDetail ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </span>
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <colgroup>
            <col style={{ width: '40px' }} /><col style={{ width: '25%' }} /><col style={{ width: '10%' }} />
            <col style={{ width: '110px' }} /><col style={{ width: '85px' }} /><col style={{ width: '120px' }} />
            <col style={{ width: '120px' }} /><col style={{ width: '8%' }} /><col style={{ width: '110px' }} />
            <col /><col style={{ width: '36px' }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-100 text-[10px] text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <th className="px-2 py-2"></th>
              <th className="px-2 py-2">Category / Activity</th>
              <th className="px-2 py-2">Assigned To</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Priority</th>
              <th className="px-2 py-2">Due Date</th>
              <th className="px-2 py-2">Completed</th>
              <th className="px-2 py-2">Target</th>
              <th className="px-2 py-2">RAG</th>
              <th className="px-2 py-2">Notes</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {motion.categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                showDetail={showDetail}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
                onDeleteCategory={handleDeleteCategory}
                onUpdateCategoryName={handleUpdateCategoryName}
                onUpdateCategoryField={handleUpdateCategoryField}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        {showNewCategory ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') setShowNewCategory(false); }}
              placeholder="Category name…"
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400"
              autoFocus
            />
            <button onClick={handleAddCategory} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Add</button>
            <button onClick={() => setShowNewCategory(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowNewCategory(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1">
            <Plus size={14} /> Add category
          </button>
        )}
      </div>
    </div>
  );
}
