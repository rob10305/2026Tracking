'use client';

import { useMemo, useState } from 'react';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { DEPENDENCY_OPTIONS, USERS } from '@/lib/sales-motion/types';
import type { DependencyArea, Status, UserId } from '@/lib/sales-motion/types';
import { Download, AlertCircle, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';

interface DependencyItem {
  motionId: string;
  motionName: string;
  userId: string;
  userName: string;
  categoryName: string;
  activityText: string;
  assignedTo: string;
  status: Status;
  priority: string;
  dueDate: string;
  revenueTarget: string;
  dep: DependencyArea;
  isParent: boolean;
}

const STATUS_PILL: Record<Status, string> = {
  'Not Started': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Complete':    'bg-green-100 text-green-700',
  'Blocked':     'bg-red-100 text-red-700',
  'At Risk':     'bg-amber-100 text-amber-700',
};

const DEP_COLOR: Record<string, { bg: string; text: string; border: string; light: string }> = {
  'Marketing':           { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-200', light: 'bg-purple-50' },
  'Sales':               { bg: 'bg-blue-500',   text: 'text-blue-700',   border: 'border-blue-200',   light: 'bg-blue-50' },
  'Ops':                 { bg: 'bg-orange-500',  text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' },
  'Pre Sales':           { bg: 'bg-teal-500',    text: 'text-teal-700',   border: 'border-teal-200',   light: 'bg-teal-50' },
  'Product/Engineering': { bg: 'bg-indigo-500',  text: 'text-indigo-700', border: 'border-indigo-200', light: 'bg-indigo-50' },
};

const VALID_DEPS = DEPENDENCY_OPTIONS.filter((d) => d !== '' && d !== 'None');

function formatRevenue(val: string): string {
  if (!val) return '—';
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return val;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function downloadGroupCSV(dep: string, items: DependencyItem[]) {
  const header = ['Rep', 'Campaign', 'Category', 'Activity', 'Assigned To', 'Status', 'Priority', 'Due Date', 'Revenue Impact', 'Portal Link'];
  const rows = items.map((i) => [
    i.userName,
    i.motionName,
    i.categoryName,
    i.activityText,
    i.assignedTo,
    i.status,
    i.priority,
    i.dueDate || '—',
    i.revenueTarget ? formatRevenue(i.revenueTarget) : '—',
    `/sales-motion/motion/${i.motionId}`,
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
  const [showCompleted, setShowCompleted] = useState(false);
  const [collapsedDeps, setCollapsedDeps] = useState<Set<string>>(new Set());

  const toggleCollapse = (dep: string) => {
    setCollapsedDeps((prev) => {
      const next = new Set(prev);
      if (next.has(dep)) next.delete(dep);
      else next.add(dep);
      return next;
    });
  };

  const grouped = useMemo(() => {
    const validDeps = new Set<string>(VALID_DEPS);
    const map: Record<string, DependencyItem[]> = {};
    VALID_DEPS.forEach((d) => { map[d] = []; });

    // Scan user motions
    Object.entries(fullState.users).forEach(([userId, appState]) => {
      const user = USERS.find((u) => u.id === userId);
      const userName = user?.displayName ?? userId;

      appState.motions.forEach((motion) => {
        const parent = parentMotions.find((p) => p.id === motion.parentMotionId || p.name === motion.name);
        const revenueTarget = parent?.contributionGoal ?? motion.contributionGoal ?? '';

        motion.categories.forEach((cat) => {
          cat.tasks.forEach((task) => {
            const dep = task.keyDependency;
            if (!dep || !validDeps.has(dep)) return;
            map[dep].push({
              motionId: motion.id,
              motionName: motion.name,
              userId,
              userName,
              categoryName: cat.name,
              activityText: task.activityText,
              assignedTo: task.assignedTo,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              revenueTarget,
              dep: dep as DependencyArea,
              isParent: false,
            });
          });
        });
      });
    });

    // Scan parent motions
    parentMotions.forEach((motion) => {
      motion.categories.forEach((cat) => {
        cat.tasks.forEach((task) => {
          const dep = task.keyDependency;
          if (!dep || !validDeps.has(dep)) return;
          map[dep].push({
            motionId: motion.id,
            motionName: motion.name,
            userId: '',
            userName: '(Parent)',
            categoryName: cat.name,
            activityText: task.activityText,
            assignedTo: task.assignedTo,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            revenueTarget: motion.contributionGoal ?? '',
            dep: dep as DependencyArea,
            isParent: true,
          });
        });
      });
    });

    return map;
  }, [fullState, parentMotions]);

  const totalItems = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);
  const totalOutstanding = Object.values(grouped).reduce((s, arr) => s + arr.filter((i) => i.status !== 'Complete').length, 0);

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
    <div className="space-y-6">
      {/* ── Summary cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {VALID_DEPS.map((dep) => {
          const items = grouped[dep] ?? [];
          const outstanding = items.filter((i) => i.status !== 'Complete');
          const blocked = items.filter((i) => i.status === 'Blocked');
          const colors = DEP_COLOR[dep] ?? { bg: 'bg-gray-500', text: 'text-gray-700', border: 'border-gray-200', light: 'bg-gray-50' };

          return (
            <button
              key={dep}
              onClick={() => {
                const el = document.getElementById(`dep-${dep.replace(/\//g, '-').replace(/\s+/g, '-')}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`${colors.light} ${colors.border} border rounded-xl p-4 text-left hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />
                <span className={`text-sm font-semibold ${colors.text}`}>{dep}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{outstanding.length}</div>
              <div className="text-[10px] uppercase tracking-wide text-gray-500 mt-0.5">outstanding</div>
              {blocked.length > 0 && (
                <div className="mt-1.5 text-[10px] font-medium text-red-600">{blocked.length} blocked</div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{totalOutstanding}</span> outstanding across all departments
          {totalItems > totalOutstanding && (
            <span className="text-gray-400"> · {totalItems - totalOutstanding} completed</span>
          )}
        </p>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
        >
          {showCompleted ? <EyeOff size={13} /> : <Eye size={13} />}
          {showCompleted ? 'Hide completed' : 'Show completed'}
        </button>
      </div>

      {/* ── Department sections ──────────────────────────────────────────────── */}
      {VALID_DEPS.map((dep) => {
        const allItems = grouped[dep] ?? [];
        const outstanding = allItems.filter((i) => i.status !== 'Complete');
        const items = showCompleted ? allItems : outstanding;
        const blocked = outstanding.filter((i) => i.status === 'Blocked');
        const inProgress = outstanding.filter((i) => i.status === 'In Progress');
        const notStarted = outstanding.filter((i) => i.status === 'Not Started');
        const atRisk = outstanding.filter((i) => i.status === 'At Risk');
        const colors = DEP_COLOR[dep] ?? { bg: 'bg-gray-500', text: 'text-gray-700', border: 'border-gray-200', light: 'bg-gray-50' };
        const isCollapsed = collapsedDeps.has(dep);

        // Sort: Blocked first, then At Risk, In Progress, Not Started, Complete
        const statusOrder: Record<Status, number> = { 'Blocked': 0, 'At Risk': 1, 'In Progress': 2, 'Not Started': 3, 'Complete': 4 };
        const sorted = [...items].sort((a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5));

        return (
          <div
            key={dep}
            id={`dep-${dep.replace(/\//g, '-').replace(/\s+/g, '-')}`}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Group header */}
            <button
              onClick={() => toggleCollapse(dep)}
              className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isCollapsed ? <ChevronRight size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                <span className={`w-3 h-3 rounded-full ${colors.bg}`} />
                <h2 className="font-semibold text-gray-900 text-base">{dep}</h2>
                {outstanding.length > 0 && (
                  <span className={`text-xs font-medium ${colors.text} ${colors.light} ${colors.border} border rounded-full px-2 py-0.5`}>
                    {outstanding.length} outstanding
                  </span>
                )}
                {blocked.length > 0 && (
                  <span className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                    {blocked.length} blocked
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {outstanding.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    {notStarted.length > 0 && <span>{notStarted.length} not started</span>}
                    {inProgress.length > 0 && <span>· {inProgress.length} in progress</span>}
                    {atRisk.length > 0 && <span>· {atRisk.length} at risk</span>}
                  </div>
                )}
                <span
                  onClick={(e) => { e.stopPropagation(); downloadGroupCSV(dep, showCompleted ? allItems : outstanding); }}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Download size={13} />
                  CSV
                </span>
              </div>
            </button>

            {!isCollapsed && (
              items.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-400 italic">
                  {showCompleted ? 'No tasks assigned to this department.' : 'No outstanding tasks — all complete! ✓'}
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide text-[10px]">
                      <th className="px-5 py-2.5 text-left font-medium">Rep</th>
                      <th className="px-3 py-2.5 text-left font-medium">Campaign</th>
                      <th className="px-3 py-2.5 text-left font-medium">Category</th>
                      <th className="px-3 py-2.5 text-left font-medium">Activity</th>
                      <th className="px-3 py-2.5 text-left font-medium">Assigned To</th>
                      <th className="px-3 py-2.5 text-left font-medium">Status</th>
                      <th className="px-3 py-2.5 text-left font-medium">Priority</th>
                      <th className="px-3 py-2.5 text-left font-medium">Due Date</th>
                      <th className="px-5 py-2.5 text-right font-medium">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sorted.map((item, idx) => (
                      <tr key={idx} className={`hover:bg-gray-50/60 transition-colors ${item.status === 'Complete' ? 'opacity-40' : ''}`}>
                        <td className="px-5 py-2.5 text-gray-600 whitespace-nowrap">
                          {item.isParent ? (
                            <span className="text-[10px] font-medium bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">Parent</span>
                          ) : item.userName}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-medium text-gray-800">{item.motionName}</span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-600">{item.categoryName}</td>
                        <td className="px-3 py-2.5 text-gray-700 max-w-[220px]">
                          <span className="line-clamp-2">{item.activityText || '—'}</span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.assignedTo || '—'}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{item.priority}</td>
                        <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                          {item.dueDate
                            ? new Date(item.dueDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
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
                    ))}
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
