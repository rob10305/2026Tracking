'use client';

import { useRef, useState, useMemo } from 'react';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { MotionCard } from './MotionCard';
import { AggregateMotionCard } from './AggregateMotionCard';
import { StatusLegend } from './StatusLegend';
import { exportJSON, importJSON } from '@/lib/sales-motion/utils/exportImport';
import { useToast } from '@/components/sales-motion/shared/Toast';
import { Download, Upload, RotateCcw, Plus, Users, FileDown } from 'lucide-react';
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

  const myMotionNames = new Set(state.motions.map((m) => m.name.toLowerCase()));
  const availableSharedMotions = sharedMotionLibrary.filter(
    (e) => e.createdBy !== activeUser && !myMotionNames.has(e.name.toLowerCase()),
  );

  const aggregateMotions = useMemo(() => {
    if (!viewAll) return [];
    const map = new Map<string, { color: string; goalTotal: number; actualTotal: number; reps: Set<UserId> }>();
    const insertionOrder: string[] = [];
    for (const user of USERS) {
      for (const motion of fullState.users[user.id].motions) {
        const key = motion.name;
        if (!map.has(key)) {
          map.set(key, { color: motion.color, goalTotal: 0, actualTotal: 0, reps: new Set() });
          insertionOrder.push(key);
        }
        const entry = map.get(key)!;
        entry.goalTotal += parseCurrency(motion.contributionGoal);
        entry.actualTotal += parseCurrency(motion.actual);
        entry.reps.add(user.id);
      }
    }
    return insertionOrder.map((name) => {
      const entry = map.get(name)!;
      const repNames = USERS.filter((u) => entry.reps.has(u.id)).map((u) => u.displayName);
      const uniqueRep = entry.reps.size === 1
        ? USERS.find((u) => u.id === [...entry.reps][0])?.displayName
        : undefined;
      return { name, color: entry.color, goalTotal: entry.goalTotal, actualTotal: entry.actualTotal, repCount: entry.reps.size, repNames, uniqueRep };
    });
  }, [viewAll, fullState]);

  const handleReset = () => {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      dispatch({ type: 'RESET_STATE' });
      toast('Data reset to defaults');
    }
  };

  const handleAddMotion = () => {
    if (!newMotionName.trim()) return;
    dispatch({ type: 'ADD_MOTION', name: newMotionName.trim(), color: newMotionColor });
    dispatch({ type: 'ADD_SHARED_MOTION', name: newMotionName.trim(), color: newMotionColor });
    toast(`Motion "${newMotionName.trim()}" added`);
    setNewMotionName('');
    setShowAddMotion(false);
  };

  const handleAddSharedMotion = (name: string, color: string) => {
    dispatch({ type: 'ADD_MOTION', name, color });
    toast(`Motion "${name}" added from library`);
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

      <div className="p-6 space-y-3">
        {viewAll ? (
          aggregateMotions.map((m) => (
            <AggregateMotionCard key={m.name} {...m} />
          ))
        ) : (
          state.motions.map((m) => <MotionCard key={m.id} motion={m} />)
        )}

        {!viewAll && (
          <>
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
