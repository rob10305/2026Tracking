'use client';

import { useMemo, useState } from 'react';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { USERS } from '@/lib/sales-motion/types';
import type { Status, UserId } from '@/lib/sales-motion/types';
import { AlertCircle, Calendar, Download, ChevronDown, ChevronRight, Clock } from 'lucide-react';

interface UpcomingItem {
  motionId: string;
  motionName: string;
  motionColor: string;
  userId: string;
  userName: string;
  categoryName: string;
  activityText: string;
  assignedTo: string;
  status: Status;
  priority: string;
  dueDate: string;
  dueDateObj: Date;
  dependency: string;
  isParent: boolean;
}

const STATUS_PILL: Record<Status, string> = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Complete':    'bg-green-100 text-green-700',
  'Blocked':     'bg-red-100 text-red-700',
  'At Risk':     'bg-amber-100 text-amber-700',
};

const PRIORITY_PILL: Record<string, string> = {
  'High':   'bg-red-50 text-red-700 border-red-200',
  'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
  'Low':    'bg-gray-50 text-gray-500 border-gray-200',
};

interface TimeBucket {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  lightBg: string;
  filter: (d: Date, now: Date) => boolean;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function endOfWeek(d: Date): Date {
  // End of current week (Sunday)
  const day = d.getDay();
  const diff = 7 - day;
  return addDays(startOfDay(d), diff);
}

const BUCKETS: TimeBucket[] = [
  {
    label: 'Overdue',
    color: 'text-red-700',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-200',
    lightBg: 'bg-red-50',
    filter: (d, now) => d < startOfDay(now),
  },
  {
    label: 'This Week',
    color: 'text-orange-700',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-200',
    lightBg: 'bg-orange-50',
    filter: (d, now) => d >= startOfDay(now) && d < endOfWeek(now),
  },
  {
    label: 'Next 2 Weeks',
    color: 'text-amber-700',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-200',
    lightBg: 'bg-amber-50',
    filter: (d, now) => d >= endOfWeek(now) && d < addDays(endOfWeek(now), 14),
  },
  {
    label: 'Next Month',
    color: 'text-blue-700',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
    lightBg: 'bg-blue-50',
    filter: (d, now) => {
      const twoWeeksOut = addDays(endOfWeek(now), 14);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return d >= twoWeeksOut && d <= nextMonth;
    },
  },
  {
    label: 'Later',
    color: 'text-gray-600',
    bgColor: 'bg-gray-400',
    borderColor: 'border-gray-200',
    lightBg: 'bg-gray-50',
    filter: (d, now) => {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return d > nextMonth;
    },
  },
];

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(d: Date, now: Date): number {
  return Math.ceil((d.getTime() - startOfDay(now).getTime()) / (1000 * 60 * 60 * 24));
}

function downloadCSV(label: string, items: UpcomingItem[]) {
  const header = ['Rep', 'Campaign', 'Category', 'Activity', 'Assigned To', 'Status', 'Priority', 'Due Date', 'Dependency'];
  const rows = items.map((i) => [
    i.userName,
    i.motionName,
    i.categoryName,
    i.activityText,
    i.assignedTo,
    i.status,
    i.priority,
    i.dueDate,
    i.dependency,
  ]);

  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `upcoming-${label.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function UpcomingReport() {
  const { fullState, parentMotions } = useTracker();
  const [collapsedBuckets, setCollapsedBuckets] = useState<Set<string>>(new Set());
  const [filterUser, setFilterUser] = useState<string>('all');

  const toggleCollapse = (label: string) => {
    setCollapsedBuckets((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const now = new Date();

  const allItems = useMemo(() => {
    const items: UpcomingItem[] = [];

    // User motions
    Object.entries(fullState.users).forEach(([userId, appState]) => {
      const user = USERS.find((u) => u.id === userId);
      const userName = user?.displayName ?? userId;

      appState.motions.forEach((motion) => {
        motion.categories.forEach((cat) => {
          cat.tasks.forEach((task) => {
            if (!task.dueDate || task.status === 'Complete') return;
            const d = new Date(task.dueDate + 'T00:00:00');
            if (isNaN(d.getTime())) return;

            items.push({
              motionId: motion.id,
              motionName: motion.name,
              motionColor: motion.color,
              userId,
              userName,
              categoryName: cat.name,
              activityText: task.activityText,
              assignedTo: task.assignedTo,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              dueDateObj: d,
              dependency: task.keyDependency || '',
              isParent: false,
            });
          });
        });
      });
    });

    // Parent motions
    parentMotions.forEach((motion) => {
      motion.categories.forEach((cat) => {
        cat.tasks.forEach((task) => {
          if (!task.dueDate || task.status === 'Complete') return;
          const d = new Date(task.dueDate + 'T00:00:00');
          if (isNaN(d.getTime())) return;

          items.push({
            motionId: motion.id,
            motionName: motion.name,
            motionColor: motion.color,
            userId: '',
            userName: '(Parent)',
            categoryName: cat.name,
            activityText: task.activityText,
            assignedTo: task.assignedTo,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            dueDateObj: d,
            dependency: task.keyDependency || '',
            isParent: true,
          });
        });
      });
    });

    // Sort by due date ascending
    items.sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());
    return items;
  }, [fullState, parentMotions]);

  const filtered = filterUser === 'all' ? allItems : allItems.filter((i) => i.userId === filterUser || (filterUser === 'parent' && i.isParent));

  const bucketed = BUCKETS.map((bucket) => ({
    ...bucket,
    items: filtered.filter((i) => bucket.filter(i.dueDateObj, now)),
  }));

  const totalItems = filtered.length;

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
        <AlertCircle size={40} className="opacity-40" />
        <p className="text-sm">No upcoming deliverables found.</p>
        <p className="text-xs text-gray-400">Add due dates to activities in your campaigns to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Summary cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {bucketed.map((bucket) => (
          <button
            key={bucket.label}
            onClick={() => {
              const el = document.getElementById(`bucket-${bucket.label.replace(/\s+/g, '-')}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`${bucket.lightBg} ${bucket.borderColor} border rounded-xl p-4 text-left hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${bucket.bgColor}`} />
              <span className={`text-sm font-semibold ${bucket.color}`}>{bucket.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{bucket.items.length}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 mt-0.5">
              {bucket.items.length === 1 ? 'item' : 'items'}
            </div>
          </button>
        ))}
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{totalItems}</span> deliverables with due dates
          {bucketed[0].items.length > 0 && (
            <span className="text-red-600 font-medium"> · {bucketed[0].items.length} overdue</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Filter:</label>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-blue-400"
          >
            <option value="all">All Reps</option>
            {USERS.map((u) => (
              <option key={u.id} value={u.id}>{u.displayName}</option>
            ))}
            <option value="parent">Parent Campaigns</option>
          </select>
        </div>
      </div>

      {/* ── Time-bucketed sections ──────────────────────────────────────────── */}
      {bucketed.map((bucket) => {
        const isCollapsed = collapsedBuckets.has(bucket.label);

        return (
          <div
            key={bucket.label}
            id={`bucket-${bucket.label.replace(/\s+/g, '-')}`}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => toggleCollapse(bucket.label)}
              className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isCollapsed ? <ChevronRight size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                <span className={`w-3 h-3 rounded-full ${bucket.bgColor}`} />
                <h2 className="font-semibold text-gray-900 text-base">{bucket.label}</h2>
                <span className={`text-xs font-medium ${bucket.color} ${bucket.lightBg} ${bucket.borderColor} border rounded-full px-2 py-0.5`}>
                  {bucket.items.length} {bucket.items.length === 1 ? 'item' : 'items'}
                </span>
                {bucket.label === 'Overdue' && bucket.items.length > 0 && (
                  <span className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 font-medium">
                    Action required
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {bucket.items.length > 0 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); downloadCSV(bucket.label, bucket.items); }}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Download size={13} />
                    CSV
                  </span>
                )}
              </div>
            </button>

            {!isCollapsed && (
              bucket.items.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-400 italic">No items in this time range.</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide text-[10px]">
                      <th className="px-5 py-2.5 text-left font-medium">Due</th>
                      <th className="px-3 py-2.5 text-left font-medium">Rep</th>
                      <th className="px-3 py-2.5 text-left font-medium">Campaign</th>
                      <th className="px-3 py-2.5 text-left font-medium">Category</th>
                      <th className="px-3 py-2.5 text-left font-medium">Activity</th>
                      <th className="px-3 py-2.5 text-left font-medium">Assigned To</th>
                      <th className="px-3 py-2.5 text-left font-medium">Status</th>
                      <th className="px-3 py-2.5 text-left font-medium">Priority</th>
                      <th className="px-5 py-2.5 text-right font-medium">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bucket.items.map((item, idx) => {
                      const days = daysUntil(item.dueDateObj, now);
                      const dueLabel = days < 0
                        ? `${Math.abs(days)}d overdue`
                        : days === 0
                          ? 'Today'
                          : days === 1
                            ? 'Tomorrow'
                            : `${days}d`;

                      return (
                        <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} className={days < 0 ? 'text-red-500' : days <= 2 ? 'text-orange-500' : 'text-gray-400'} />
                              <div>
                                <div className={`font-medium ${days < 0 ? 'text-red-600' : days <= 2 ? 'text-orange-600' : 'text-gray-700'}`}>
                                  {dueLabel}
                                </div>
                                <div className="text-[10px] text-gray-400">{formatDate(item.dueDateObj)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">
                            {item.isParent ? (
                              <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">Parent</span>
                            ) : item.userName}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.motionColor }} />
                              <span className="font-medium text-gray-800">{item.motionName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">{item.categoryName}</td>
                          <td className="px-3 py-2.5 text-gray-700 max-w-[200px]">
                            <span className="line-clamp-2">{item.activityText || '—'}</span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.assignedTo || '—'}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[item.status]}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium border ${PRIORITY_PILL[item.priority] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <a
                              href={`/sales-motion/motion/${item.motionId}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              View →
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
