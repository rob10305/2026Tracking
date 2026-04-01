'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { MotionCard } from './MotionCard';
import { AggregateMotionCard } from './AggregateMotionCard';
import { StatusLegend } from './StatusLegend';
import { exportJSON, importJSON } from '@/lib/sales-motion/utils/exportImport';
import { useToast } from '@/components/sales-motion/shared/Toast';
import { Download, Upload, RotateCcw, Plus, Users, FileDown, Copy, GitBranch, Link2 } from 'lucide-react';
import { isChildMotion } from '@/lib/sales-motion/utils/inheritance';
import { MonthMultiSelect } from '@/components/sales-motion/shared/MonthMultiSelect';
import { USERS } from '@/lib/sales-motion/types';
import type { UserId } from '@/lib/sales-motion/types';
import { parseCurrency } from '@/lib/sales-motion/utils/currency';

const MOTION_COLORS = ['#1A56DB', '#137333', '#6A0DAD', '#C0392B', '#37474F', '#E67E22', '#2980B9', '#8E44AD', '#16A085', '#D35400'];

export function Dashboard() {
  const { state, fullState, dispatch, sharedMotionLibrary, activeUser, viewAll } = useTracker();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showAddMotion, setShowAddMotion] = useState(false);
  const [newMotionName, setNewMotionName] = useState('');
  const [newMotionColor, setNewMotionColor] = useState(MOTION_COLORS[5]);
  const [selectedCloneKey, setSelectedCloneKey] = useState('');
  const [showChildMotions, setShowChildMotions] = useState(false);

  useEffect(() => {
    setShowChildMotions(false);
  }, [activeUser, viewAll]);

  const handleExport = () => {
    exportJSON(fullState);
    toast('Data exported successfully');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importJSON(file);
      dispatch({ type: 'IMPORT_STATE', state: data });
      toast('Data imported successfully');
    } catch {
      toast('Failed to import data', 'error');
    }
    e.target.value = '';
  };

  const topLineMotions = state.motions.filter((m) => !isChildMotion(m));
  const childMotionsList = state.motions.filter((m) => isChildMotion(m));
  const visibleMotions = showChildMotions ? state.motions : topLineMotions;

  const myMotionNames = new Set(state.motions.map((m) => m.name.toLowerCase()));
  const availableSharedMotions = sharedMotionLibrary.filter(
    (e) => e.createdBy !== activeUser && !myMotionNames.has(e.name.toLowerCase()),
  );

  const cloneableMotions = useMemo(() => {
    if (viewAll) return [];
    const myNames = new Set(fullState.users[activeUser].motions.map((m) => m.name.toLowerCase()));
    const seen = new Set<string>();
    const result: { key: string; label: string; ownerName: string; motion: import('@/lib/sales-motion/types').Motion }[] = [];
    for (const user of USERS) {
      if (user.id === activeUser) continue;
      for (const motion of fullState.users[user.id].motions) {
        const nameKey = motion.name.toLowerCase();
        if (myNames.has(nameKey) || seen.has(nameKey)) continue;
        seen.add(nameKey);
        result.push({ key: `${user.id}::${motion.id}`, label: motion.name, ownerName: user.displayName, motion });
      }
    }
    return result;
  }, [viewAll, fullState, activeUser]);

  const { aggregateMotions, childAggregates } = useMemo(() => {
    if (!viewAll) return { aggregateMotions: [], childAggregates: [] };
    const parentMap = new Map<string, { color: string; revenueTotal: number; leadsTotal: number; winsTotal: number; reps: Set<UserId>; motionIdByUser: Map<UserId, string> }>();
    const parentOrder: string[] = [];
    const childList: { userId: UserId; displayName: string; motion: import('@/lib/sales-motion/types').Motion }[] = [];

    for (const user of USERS) {
      for (const motion of fullState.users[user.id].motions) {
        if (isChildMotion(motion)) {
          childList.push({ userId: user.id, displayName: user.displayName, motion });
          continue;
        }
        const key = motion.name;
        if (!parentMap.has(key)) {
          parentMap.set(key, { color: motion.color, revenueTotal: 0, leadsTotal: 0, winsTotal: 0, reps: new Set(), motionIdByUser: new Map() });
          parentOrder.push(key);
        }
        const entry = parentMap.get(key)!;
        entry.revenueTotal += parseCurrency(motion.contributionGoal);
        entry.leadsTotal += parseCurrency(motion.leads);
        entry.winsTotal += parseCurrency(motion.wins);
        entry.reps.add(user.id);
        entry.motionIdByUser.set(user.id, motion.id);
      }
    }
    const aggregateMotions = parentOrder.map((name) => {
      const entry = parentMap.get(name)!;
      const repNames = USERS.filter((u) => entry.reps.has(u.id)).map((u) => u.displayName);
      const motionId = entry.motionIdByUser.get(fullState.activeUser) ?? [...entry.motionIdByUser.values()][0] ?? '';
      const shared = fullState.sharedMotionLibrary.find((s) => s.name === name);
      return { name, color: entry.color, revenueTotal: entry.revenueTotal, leadsTotal: entry.leadsTotal, winsTotal: entry.winsTotal, repCount: entry.reps.size, repNames, motionId, revenueTarget: shared?.revenueTarget, leadsTarget: shared?.leadsTarget, winsTarget: shared?.winsTarget };
    });
    return { aggregateMotions, childAggregates: childList };
  }, [viewAll, fullState]);

  const handleReset = () => {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      dispatch({ type: 'RESET_STATE' });
      toast('Data reset to defaults');
    }
  };

  const activeDisplayName = USERS.find((u) => u.id === activeUser)?.displayName ?? '';

  const handleAddMotion = () => {
    if (!newMotionName.trim()) return;
    dispatch({ type: 'ADD_MOTION', name: newMotionName.trim(), color: newMotionColor, seller: activeDisplayName });
    dispatch({ type: 'ADD_SHARED_MOTION', name: newMotionName.trim(), color: newMotionColor });
    toast(`Motion "${newMotionName.trim()}" added`);
    setNewMotionName('');
    setShowAddMotion(false);
  };

  const handleAddSharedMotion = (name: string, color: string) => {
    dispatch({ type: 'ADD_MOTION', name, color, seller: activeDisplayName });
    toast(`Motion "${name}" added from library`);
  };

  const handleCloneMotion = () => {
    const entry = cloneableMotions.find((m) => m.key === selectedCloneKey);
    if (!entry) return;
    const sourceUserId = entry.key.split('::')[0];
    dispatch({ type: 'CLONE_MOTION', source: entry.motion, sourceUserId, cloningSeller: activeDisplayName });
    toast(`"${entry.label}" cloned from ${entry.ownerName}`);
    setSelectedCloneKey('');
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sales Motion Monthly Impact Tracker</h1>
        </div>
        <div className="flex items-center gap-3">
          {!viewAll && (
            <>
              <label className="text-sm text-gray-500">Reporting Month:</label>
              <MonthMultiSelect
                selected={state.reportingMonths}
                onToggle={(m) => dispatch({ type: 'TOGGLE_REPORTING_MONTH', month: m })}
              />
            </>
          )}
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload size={14} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {!viewAll && (
        <div className="px-6 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <button
            onClick={() => setShowChildMotions(false)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium transition-colors ${!showChildMotions ? 'bg-white border border-gray-300 text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <GitBranch size={12} /> Top-line Campaigns
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${!showChildMotions ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {topLineMotions.length}
            </span>
          </button>
          <button
            onClick={() => setShowChildMotions(true)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium transition-colors ${showChildMotions ? 'bg-white border border-gray-300 text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Link2 size={12} /> All Campaigns
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${showChildMotions ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {state.motions.length}
            </span>
          </button>
          {childMotionsList.length > 0 && !showChildMotions && (
            <span className="text-[11px] text-gray-400 ml-1">
              + {childMotionsList.length} child {childMotionsList.length === 1 ? 'campaign' : 'campaigns'} hidden
            </span>
          )}
        </div>
      )}

      <div className="p-6 space-y-3">
        {viewAll ? (
          <>
            {aggregateMotions.map((m) => (
              <AggregateMotionCard
                key={m.name}
                {...m}
                onUpdateTarget={(field, value) =>
                  dispatch({ type: 'UPDATE_SHARED_MOTION', name: m.name, field, value })
                }
              />
            ))}
            {childAggregates.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3 pt-2 border-t border-gray-200">
                  <Link2 size={14} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Child Campaigns in Play</span>
                  <span className="text-[11px] text-gray-400">— cloned from other reps' motions</span>
                </div>
                <div className="space-y-2">
                  {childAggregates.map(({ motion, displayName, userId }) => {
                    const rev = parseCurrency(motion.contributionGoal);
                    return (
                      <div key={motion.id} className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden flex items-center gap-4 px-4 py-3">
                        <div className="w-1.5 h-10 rounded shrink-0" style={{ backgroundColor: motion.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{motion.name}</span>
                            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                              <Link2 size={9} /> Child Campaign
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">{motion.type}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="text-center">
                            <div className="font-semibold text-gray-800">{displayName}</div>
                            <div className="text-[10px] text-gray-400">Rep</div>
                          </div>
                          {rev > 0 && (
                            <div className="text-center">
                              <div className="font-semibold text-green-700">{motion.contributionGoal}</div>
                              <div className="text-[10px] text-gray-400">Revenue</div>
                            </div>
                          )}
                          {motion.leads && (
                            <div className="text-center">
                              <div className="font-semibold text-blue-700">{motion.leads}</div>
                              <div className="text-[10px] text-gray-400">Leads</div>
                            </div>
                          )}
                          {motion.wins && (
                            <div className="text-center">
                              <div className="font-semibold text-amber-700">{motion.wins}</div>
                              <div className="text-[10px] text-gray-400">Wins</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          visibleMotions.map((m) => <MotionCard key={m.id} motion={m} />)
        )}

        {!viewAll && (
          <>
            {cloneableMotions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 flex-wrap">
                <Copy size={15} className="text-gray-400 shrink-0" />
                <span className="text-sm font-medium text-gray-700 shrink-0">Clone Existing Motion</span>
                <select
                  value={selectedCloneKey}
                  onChange={(e) => setSelectedCloneKey(e.target.value)}
                  className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 bg-white"
                >
                  <option value="">Select a motion to clone…</option>
                  {cloneableMotions.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label} — from {m.ownerName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleCloneMotion}
                  disabled={!selectedCloneKey}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  Clone
                </button>
              </div>
            )}

            {showAddMotion ? (
              <div className="bg-white rounded-xl border border-dashed border-blue-300 p-4 flex items-center gap-3">
                <input
                  type="text"
                  value={newMotionName}
                  onChange={(e) => setNewMotionName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddMotion(); if (e.key === 'Escape') setShowAddMotion(false); }}
                  placeholder="Motion name…"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                  autoFocus
                />
                <div className="flex gap-1">
                  {MOTION_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewMotionColor(c)}
                      className={`w-5 h-5 rounded-full border-2 ${newMotionColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button onClick={handleAddMotion} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Add</button>
                <button onClick={() => setShowAddMotion(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowAddMotion(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors">
                <Plus size={16} /> Add Sales Motion
              </button>
            )}

            {availableSharedMotions.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Motion Library (from other reps)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSharedMotions.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => handleAddSharedMotion(m.name, m.color)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 shadow-sm"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.name}
                      <FileDown size={13} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <StatusLegend />
    </div>
  );
}
