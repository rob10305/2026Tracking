'use client';

import { useRef, useState, useMemo } from 'react';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { MotionCard } from './MotionCard';
import { ParentMotionCard } from './ParentMotionCard';
import { StatusLegend } from './StatusLegend';
import { exportJSON, importJSON } from '@/lib/sales-motion/utils/exportImport';
import { useToast } from '@/components/sales-motion/shared/Toast';
import { Download, Upload, RotateCcw, Plus, GitBranch, Link2, Copy, Sparkles } from 'lucide-react';
import { USERS } from '@/lib/sales-motion/types';
import type { UserId } from '@/lib/sales-motion/types';
import { parseCurrency } from '@/lib/sales-motion/utils/currency';

const MOTION_COLORS = ['#1A56DB', '#137333', '#6A0DAD', '#C0392B', '#37474F', '#E67E22', '#2980B9', '#8E44AD', '#16A085', '#D35400'];

export function Dashboard() {
  const { state, fullState, dispatch, parentMotions, activeUser, viewAll } = useTracker();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);


  // ── Parent campaign creation (All view) ────────────────────────────────────
  const [showAddParent, setShowAddParent] = useState(false);
  const [newParentName, setNewParentName] = useState('');
  const [newParentColor, setNewParentColor] = useState(MOTION_COLORS[0]);

  // ── Rep campaign actions (individual rep view) ─────────────────────────────
  const [selectedCloneId, setSelectedCloneId] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newMotionName, setNewMotionName] = useState('');
  const [newMotionColor, setNewMotionColor] = useState(MOTION_COLORS[5]);

  // ── Compute children map (parentMotionId → [{userId, motion}]) ────────────
  const childrenByParentId = useMemo(() => {
    const map = new Map<string, { userId: UserId; motion: typeof state.motions[0] }[]>();
    for (const user of USERS) {
      for (const m of fullState.users[user.id].motions) {
        if (m.parentMotionId) {
          if (!map.has(m.parentMotionId)) map.set(m.parentMotionId, []);
          map.get(m.parentMotionId)!.push({ userId: user.id, motion: m });
        }
      }
    }
    return map;
  }, [fullState]);

  // ── All reps' custom motions (no parent link) ─────────────────────────────
  const allRepMotions = useMemo(() => {
    const result: { userId: UserId; displayName: string; motion: typeof state.motions[0] }[] = [];
    for (const user of USERS) {
      for (const m of fullState.users[user.id].motions) {
        result.push({ userId: user.id, displayName: user.displayName, motion: m });
      }
    }
    return result;
  }, [fullState]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleExport = () => { exportJSON(fullState); toast('Data exported successfully'); };

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

  const handleReset = () => {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      dispatch({ type: 'RESET_STATE' });
      toast('Data reset to defaults');
    }
  };


  const handleAddParent = () => {
    if (!newParentName.trim()) return;
    dispatch({ type: 'ADD_PARENT_MOTION', name: newParentName.trim(), color: newParentColor });
    setNewParentName('');
    setNewParentColor(MOTION_COLORS[0]);
    setShowAddParent(false);
    toast(`Parent campaign "${newParentName.trim()}" created`);
  };

  const handleCloneParent = () => {
    const parent = parentMotions.find((m) => m.id === selectedCloneId);
    if (!parent) return;
    dispatch({ type: 'CLONE_MOTION', source: parent, sourceUserId: activeUser });
    setSelectedCloneId('');
    toast(`Cloned "${parent.name}" to your campaigns`);
  };

  const handleCreateNew = () => {
    if (!newMotionName.trim()) return;
    dispatch({ type: 'ADD_MOTION', name: newMotionName.trim(), color: newMotionColor });
    setNewMotionName('');
    setNewMotionColor(MOTION_COLORS[5]);
    setShowCreateNew(false);
    toast(`Campaign "${newMotionName.trim()}" created`);
  };

  // ── Shared header bar ──────────────────────────────────────────────────────
  const headerBar = (
    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
      <h1 className="text-xl font-bold text-gray-900">Sales Motion Monthly Impact Tracker</h1>
      <div className="flex items-center gap-2 flex-wrap">
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
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ALL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (viewAll) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {headerBar}
        <div className="p-6 space-y-8">

          {/* ── Parent Campaigns ────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-gray-500" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Parent Campaigns</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">{parentMotions.length}</span>
              </div>
              <p className="text-xs text-gray-400">Managed here · Reps clone these to create their own</p>
            </div>

            <div className="space-y-2">
              {parentMotions.map((m) => (
                <ParentMotionCard
                  key={m.id}
                  motion={m}
                  childrenByUser={childrenByParentId.get(m.id) ?? []}
                />
              ))}
            </div>

            {/* Add parent campaign */}
            <div className="mt-3">
              {showAddParent ? (
                <div className="bg-white rounded-xl border border-dashed border-blue-300 p-4 flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddParent(); if (e.key === 'Escape') { setShowAddParent(false); setNewParentName(''); } }}
                    placeholder="Parent campaign name…"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {MOTION_COLORS.map((c) => (
                      <button key={c} onClick={() => setNewParentColor(c)} className={`w-5 h-5 rounded-full border-2 transition-transform ${newParentColor === c ? 'border-gray-800 scale-125' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <button onClick={handleAddParent} disabled={!newParentName.trim()} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40">Create</button>
                  <button onClick={() => { setShowAddParent(false); setNewParentName(''); }} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddParent(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Plus size={14} /> Add Parent Campaign
                </button>
              )}
            </div>
          </div>

          {/* ── Rep Campaigns ───────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={16} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Rep Campaigns</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">{allRepMotions.length}</span>
            </div>

            {allRepMotions.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
                No rep campaigns yet. Reps can clone a parent campaign or create their own.
              </div>
            ) : (
              <div className="space-y-2">
                {USERS.map((user) => {
                  const userMotions = fullState.users[user.id].motions;
                  if (userMotions.length === 0) return null;
                  return (
                    <div key={user.id}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{user.displayName}</p>
                      <div className="space-y-1.5">
                        {userMotions.map((m) => <MotionCard key={m.id} motion={m} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <StatusLegend />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INDIVIDUAL REP VIEW
  // ══════════════════════════════════════════════════════════════════════════
  const myMotions = state?.motions ?? [];
  const alreadyClonedParentIds = new Set(myMotions.map((m) => m.parentMotionId).filter(Boolean));
  const availableParents = (parentMotions ?? []).filter((p) => !alreadyClonedParentIds.has(p.id));

  const addSection = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Clone from parent */}
      <div className="bg-white rounded-xl border border-indigo-200 p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Copy size={15} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Clone Existing Campaign</p>
            <p className="text-xs text-gray-500">Inherit a parent&apos;s tasks &amp; structure</p>
          </div>
        </div>
        {availableParents.length === 0 ? (
          <p className="text-xs text-gray-400 italic">You&apos;ve already cloned all available parent campaigns.</p>
        ) : (
          <>
            <select
              value={selectedCloneId}
              onChange={(e) => setSelectedCloneId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white"
            >
              <option value="">Select a parent campaign…</option>
              {availableParents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={handleCloneParent}
              disabled={!selectedCloneId}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Clone Campaign
            </button>
          </>
        )}
      </div>

      {/* Create new */}
      <div className="bg-white rounded-xl border border-emerald-200 p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Sparkles size={15} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Create New Campaign</p>
            <p className="text-xs text-gray-500">Build your own from scratch</p>
          </div>
        </div>
        {showCreateNew ? (
          <>
            <input
              type="text"
              value={newMotionName}
              onChange={(e) => setNewMotionName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateNew(); if (e.key === 'Escape') { setShowCreateNew(false); setNewMotionName(''); } }}
              placeholder="Campaign name…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400"
              autoFocus
            />
            <div className="flex gap-1.5 flex-wrap">
              {MOTION_COLORS.map((c) => (
                <button key={c} onClick={() => setNewMotionColor(c)} className={`w-5 h-5 rounded-full border-2 transition-transform ${newMotionColor === c ? 'border-gray-800 scale-125' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateNew} disabled={!newMotionName.trim()} className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors">Create</button>
              <button onClick={() => { setShowCreateNew(false); setNewMotionName(''); }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setShowCreateNew(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-emerald-300 rounded-lg text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <Plus size={14} /> Start building
          </button>
        )}
      </div>
    </div>
  );

  if (myMotions.length === 0) {
    // Empty state — full screen prompt
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {headerBar}
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800 mb-1">No campaigns yet</p>
            <p className="text-sm text-gray-500">Clone a parent campaign or create your own to get started.</p>
          </div>
          <div className="w-full max-w-2xl">
            {addSection}
          </div>
        </div>
      </div>
    );
  }

  // Has motions — show them, add section below
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {headerBar}
      <div className="p-6 space-y-6">
        {/* Motion list */}
        <div className="space-y-2">
          {myMotions.map((m) => <MotionCard key={m.id} motion={m} />)}
        </div>

        {/* Add section */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add Campaign</p>
          {addSection}
        </div>

        <StatusLegend />
      </div>
    </div>
  );
}
