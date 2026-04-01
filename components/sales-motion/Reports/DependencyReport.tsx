'use client';

import { useMemo } from 'react';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { DEPENDENCY_OPTIONS } from '@/lib/sales-motion/types';
import type { DependencyArea, Status } from '@/lib/sales-motion/types';
import { Download, AlertCircle } from 'lucide-react';

interface DependencyItem {
  motionId: string;
  motionName: string;
  userId: string;
  categoryName: string;
  activityText: string;
  status: Status;
  dueDate: string;
  revenueTarget: string;
  dep: DependencyArea;
}

const STATUS_PILL: Record<Status, string> = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Complete':    'bg-green-100 text-green-700',
  'Blocked':     'bg-red-100 text-red-700',
  'At Risk':     'bg-amber-100 text-amber-700',
};

const DEP_COLOR: Record<string, string> = {
  'Marketing':          'bg-purple-500',
  'Sales':              'bg-blue-500',
  'Ops':                'bg-orange-500',
  'Pre Sales':          'bg-teal-500',
  'Product/Engineering':'bg-indigo-500',
};

function formatRevenue(val: string): string {
  if (!val) return '—';
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return val;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function getPortalLink(motionId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/sales-motion/motion/${motionId}`;
  }
  return `/sales-motion/motion/${motionId}`;
}

function downloadGroupCSV(dep: string, items: DependencyItem[]) {
  const header = ['Campaign', 'Category', 'Activity', 'Status', 'Due Date', 'Revenue Impact', 'Portal Link'];
  const rows = items.map((i) => [
    i.motionName,
    i.categoryName,
    i.activityText,
    i.status,
    i.dueDate || '—',
    i.revenueTarget ? formatRevenue(i.revenueTarget) : '—',
    getPortalLink(i.motionId),
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dependency-${dep.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DependencyReport() {
  const { fullState, parentMotions } = useTracker();

  const grouped = useMemo(() => {
    const validDeps = new Set<string>(
      DEPENDENCY_OPTIONS.filter((d) => d !== '' && d !== 'None')
    );

    const map: Record<string, DependencyItem[]> = {};
    DEPENDENCY_OPTIONS.filter((d) => d !== '' && d !== 'None').forEach((d) => {
      map[d] = [];
    });

    Object.entries(fullState.users).forEach(([userId, appState]) => {
      appState.motions.forEach((motion) => {
        const parent = parentMotions.find((p) => p.id === motion.parentMotionId || p.name === motion.name);
        const revenueTarget = parent?.contributionGoal ?? '';

        motion.categories.forEach((cat) => {
          cat.tasks.forEach((task) => {
            const dep = task.keyDependency;
            if (!dep || !validDeps.has(dep)) return;

            map[dep].push({
              motionId: motion.id,
              motionName: motion.name,
              userId,
              categoryName: cat.name,
              activityText: task.activityText,
              status: task.status,
              dueDate: task.dueDate,
              revenueTarget,
              dep: dep as DependencyArea,
            });
          });
        });
      });
    });

    return map;
  }, [fullState, parentMotions]);

  const totalItems = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
        <AlertCircle size={40} className="opacity-40" />
        <p className="text-sm">No dependency assignments found yet.</p>
        <p className="text-xs text-gray-400">Open a campaign, expand activities, and assign a Dependency to each task.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {DEPENDENCY_OPTIONS.filter((d) => d !== '' && d !== 'None').map((dep) => {
        const items = grouped[dep] ?? [];
        const outstanding = items.filter((i) => i.status !== 'Complete');

        return (
          <div key={dep} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Group header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${DEP_COLOR[dep] ?? 'bg-gray-400'}`} />
                <h2 className="font-semibold text-gray-900 text-base">{dep}</h2>
                <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
                {outstanding.length > 0 && (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                    {outstanding.length} outstanding
                  </span>
                )}
              </div>
              <button
                onClick={() => downloadGroupCSV(dep, items)}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-1.5 transition-colors"
              >
                <Download size={13} />
                Download CSV
              </button>
            </div>

            {items.length === 0 ? (
              <div className="px-5 py-6 text-sm text-gray-400 italic">No tasks assigned to this group.</div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide text-[10px]">
                    <th className="px-5 py-2.5 text-left font-medium">Campaign</th>
                    <th className="px-3 py-2.5 text-left font-medium">Category</th>
                    <th className="px-3 py-2.5 text-left font-medium">Activity</th>
                    <th className="px-3 py-2.5 text-left font-medium">Status</th>
                    <th className="px-3 py-2.5 text-left font-medium">Due Date</th>
                    <th className="px-3 py-2.5 text-right font-medium">Revenue Impact</th>
                    <th className="px-5 py-2.5 text-right font-medium">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item, idx) => (
                    <tr key={idx} className={`hover:bg-gray-50/60 transition-colors ${item.status === 'Complete' ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{item.motionName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{item.categoryName}</td>
                      <td className="px-3 py-2.5 text-gray-700 max-w-[280px]">
                        <span className="line-clamp-2">{item.activityText || '—'}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                        {item.dueDate
                          ? new Date(item.dueDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-gray-700">
                        {formatRevenue(item.revenueTarget)}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <a
                          href={`/sales-motion/motion/${item.motionId}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}
