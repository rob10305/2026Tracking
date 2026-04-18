'use client';

import { useRef, useState, useMemo } from 'react';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { MotionCard } from './MotionCard';
import { ParentMotionCard } from './ParentMotionCard';
import { StatusLegend } from './StatusLegend';
import { exportJSON, exportUserJSON, exportUserExcel, exportAllExcel, importJSON } from '@/lib/sales-motion/utils/exportImport';
import { useToast } from '@/components/sales-motion/shared/Toast';
import { Download, Upload, RotateCcw, Plus, GitBranch, Link2, Copy, Sparkles, ChevronDown, FileSpreadsheet, FileJson } from 'lucide-react';
import { USERS } from '@/lib/sales-motion/types';
import type { UserId } from '@/lib/sales-motion/types';
import { parseCurrency } from '@/lib/sales-motion/utils/currency';

const MOTION_COLORS = ['#1A56DB', '#137333', '#6A0DAD', '#C0392B', '#37474F', '#E67E22', '#2980B9', '#8E44AD', '#16A085', '#D35400'];

export function Dashboard() {
  const { state, fullState, dispatch, parentMotions, activeUser, viewAll, isLoading } = useTracker();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);


  const [showExportMenu, setShowExportMenu] = useState(false);

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

  // ── Loading gate ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-accent-sky" />
          <p className="mt-3 text-sm text-gray-400">Loading tracker data…</p>
        </div>
      </div>
    );
  }

  // ── Shared header bar ──────────────────────────────────────────────────────
  const btn = "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-white/[0.03] border border-white/10 text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors";
  const menuItem = "w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white";
  const headerBar = (
    <div className="px-8 py-5 border-b border-white/5 bg-canvas-raised/40 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-emerald">FY2026</p>
        <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">Sales Motion Monthly Impact Tracker</h1>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <button onClick={() => setShowExportMenu(!showExportMenu)} className={btn}>
            <Download size={14} /> Export <ChevronDown size={12} />
          </button>
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-canvas-raised border border-white/10 rounded-lg shadow-soft-dark z-20 py-1">
                {!viewAll && (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">My Data ({USERS.find((u) => u.id === activeUser)?.displayName})</div>
                    <button onClick={() => { exportUserJSON(activeUser, fullState); toast('JSON exported'); setShowExportMenu(false); }} className={menuItem}>
                      <FileJson size={14} className="text-accent-sky" /> My Data (JSON)
                    </button>
                    <button onClick={() => { exportUserExcel(activeUser, fullState); toast('Excel exported'); setShowExportMenu(false); }} className={menuItem}>
                      <FileSpreadsheet size={14} className="text-accent-emerald" /> My Data (Excel)
                    </button>
                    <div className="border-t border-white/5 my-1" />
                  </>
                )}
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">All Users</div>
                <button onClick={() => { exportJSON(fullState); toast('JSON exported'); setShowExportMenu(false); }} className={menuItem}>
                  <FileJson size={14} className="text-accent-sky" /> All Users (JSON)
                </button>
                <button onClick={() => { exportAllExcel(fullState); toast('Excel exported'); setShowExportMenu(false); }} className={menuItem}>
                  <FileSpreadsheet size={14} className="text-accent-emerald" /> All Users (Excel)
                </button>
              </div>
            </>
          )}
        </div>
        <button onClick={() => fileRef.current?.click()} className={btn}>
          <Upload size={14} /> Import
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-accent-rose/10 border border-accent-rose/30 text-accent-rose hover:bg-accent-rose/20 transition-colors">
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
      <div className="flex-1 overflow-y-auto bg-canvas">
        {headerBar}
        <div className="p-8 space-y-10">

          {/* ── Parent Campaigns ────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitBranch size={14} className="text-accent-sky" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-300">Parent Campaigns</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10">{parentMotions.length}</span>
              </div>
              <p className="text-xs text-gray-500">Managed here · Reps clone these to create their own</p>
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
                <div className="bg-canvas-raised rounded-xl border border-dashed border-accent-sky/40 p-4 flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddParent(); if (e.key === 'Escape') { setShowAddParent(false); setNewParentName(''); } }}
                    placeholder="Parent campaign name…"
                    className="flex-1 bg-canvas border border-white/10 text-white placeholder-gray-500 rounded-md px-3 py-1.5 text-sm outline-none focus:border-accent-sky"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {MOTION_COLORS.map((c) => (
                      <button key={c} onClick={() => setNewParentColor(c)} className={`w-5 h-5 rounded-full border-2 transition-transform ${newParentColor === c ? 'border-white scale-125' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <button onClick={handleAddParent} disabled={!newParentName.trim()} className="px-4 py-1.5 bg-accent-sky text-[#050914] text-sm font-semibold rounded-md hover:brightness-110 disabled:opacity-40">Create</button>
                  <button onClick={() => { setShowAddParent(false); setNewParentName(''); }} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddParent(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 rounded-xl text-sm text-gray-500 hover:text-accent-sky hover:border-accent-sky/40 hover:bg-accent-sky/5 transition-colors"
                >
                  <Plus size={14} /> Add Parent Campaign
                </button>
              )}
            </div>
          </div>

          {/* ── Rep Campaigns ───────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link2 size={14} className="text-accent-violet" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-300">Rep Campaigns</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-violet/10 text-accent-violet border border-accent-violet/30">{allRepMotions.length}</span>
            </div>

            {allRepMotions.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm bg-canvas-raised rounded-xl border border-white/5">
                No rep campaigns yet. Reps can clone a parent campaign or create their own.
              </div>
            ) : (
              <div className="space-y-4">
                {USERS.map((user) => {
                  const userMotions = fullState.users[user.id].motions;
                  if (userMotions.length === 0) return null;
                  return (
                    <div key={user.id}>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em] mb-2 ml-1">{user.displayName}</p>
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
      {/* Clone from parent — violet accent rail */}
      <div className="relative overflow-hidden bg-canvas-raised border border-white/5 border-l-4 border-l-accent-violet rounded-xl p-5 flex flex-col gap-3">
        <div aria-hidden className="absolute -top-10 -right-10 h-32 w-32 rounded-full glow-violet blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center">
            <Copy size={15} className="text-accent-violet" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Clone Existing Campaign</p>
            <p className="text-xs text-gray-400">Inherit a parent&apos;s tasks &amp; structure</p>
          </div>
        </div>
        {availableParents.length === 0 ? (
          <p className="relative text-xs text-gray-500 italic">You&apos;ve already cloned all available parent campaigns.</p>
        ) : (
          <div className="relative flex flex-col gap-2">
            <select
              value={selectedCloneId}
              onChange={(e) => setSelectedCloneId(e.target.value)}
              className="w-full bg-canvas border border-white/10 text-white rounded-md px-3 py-2 text-sm outline-none focus:border-accent-violet"
            >
              <option value="">Select a parent campaign…</option>
              {availableParents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={handleCloneParent}
              disabled={!selectedCloneId}
              className="px-4 py-2 bg-accent-violet text-[#050914] text-sm font-semibold rounded-md hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Clone Campaign
            </button>
          </div>
        )}
      </div>

      {/* Create new — emerald accent rail */}
      <div className="relative overflow-hidden bg-canvas-raised border border-white/5 border-l-4 border-l-accent-emerald rounded-xl p-5 flex flex-col gap-3">
        <div aria-hidden className="absolute -top-10 -right-10 h-32 w-32 rounded-full glow-emerald blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-emerald/10 border border-accent-emerald/30 flex items-center justify-center">
            <Sparkles size={15} className="text-accent-emerald" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Create New Campaign</p>
            <p className="text-xs text-gray-400">Build your own from scratch</p>
          </div>
        </div>
        {showCreateNew ? (
          <div className="relative flex flex-col gap-2">
            <input
              type="text"
              value={newMotionName}
              onChange={(e) => setNewMotionName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateNew(); if (e.key === 'Escape') { setShowCreateNew(false); setNewMotionName(''); } }}
              placeholder="Campaign name…"
              className="w-full bg-canvas border border-white/10 text-white placeholder-gray-500 rounded-md px-3 py-2 text-sm outline-none focus:border-accent-emerald"
              autoFocus
            />
            <div className="flex gap-1.5 flex-wrap">
              {MOTION_COLORS.map((c) => (
                <button key={c} onClick={() => setNewMotionColor(c)} className={`w-5 h-5 rounded-full border-2 transition-transform ${newMotionColor === c ? 'border-white scale-125' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateNew} disabled={!newMotionName.trim()} className="flex-1 px-4 py-2 bg-accent-emerald text-[#050914] text-sm font-semibold rounded-md hover:brightness-110 disabled:opacity-40 transition">Create</button>
              <button onClick={() => { setShowCreateNew(false); setNewMotionName(''); }} className="px-3 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreateNew(true)}
            className="relative flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-accent-emerald/30 rounded-md text-sm text-accent-emerald hover:bg-accent-emerald/5 transition-colors"
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
      <div className="flex-1 overflow-y-auto bg-canvas">
        {headerBar}
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">No campaigns yet</p>
            <p className="text-sm text-gray-400">Clone a parent campaign or create your own to get started.</p>
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
    <div className="flex-1 overflow-y-auto bg-canvas">
      {headerBar}
      <div className="p-8 space-y-8">
        {/* Motion list */}
        <div className="space-y-2">
          {myMotions.map((m) => <MotionCard key={m.id} motion={m} />)}
        </div>

        {/* Add section */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.25em] mb-4">Add Campaign</p>
          {addSection}
        </div>

        <StatusLegend />
      </div>
    </div>
  );
}
