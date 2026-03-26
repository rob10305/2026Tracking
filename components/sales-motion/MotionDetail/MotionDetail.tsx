'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { ActivityTracker } from './ActivityTracker';
import { KPITab } from './KPITab';
import { ProgressBar } from '@/components/sales-motion/shared/ProgressBar';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { ArrowLeft, ListTodo, BarChart3 } from 'lucide-react';

export function MotionDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useTracker();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'activities' | 'kpis'>('activities');

  const motion = state.motions.find((m) => m.id === id);
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
                <h1 className="text-xl font-bold text-gray-900">{motion.name}</h1>
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
      </div>

      <div className="px-6 py-2 border-b border-gray-200 bg-white flex gap-1">
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${activeTab === 'activities' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <ListTodo size={16} /> Activity Tracker
        </button>
        <button
          onClick={() => setActiveTab('kpis')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${activeTab === 'kpis' ? 'border-blue-600 text-blue-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <BarChart3 size={16} /> KPI Targets (Monthly)
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'activities' ? <ActivityTracker motion={motion} /> : <KPITab motion={motion} />}
      </div>
    </div>
  );
}
