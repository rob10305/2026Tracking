'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import type { Motion, Category, Task, KPIRow, OutcomeType } from '@/lib/sales-motion/types';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, RAG_OPTIONS, OUTCOME_TYPE_OPTIONS, MONTHS } from '@/lib/sales-motion/types';
import {
  Plus, Upload, Download, Copy, Rocket, Trash2, ChevronDown, ChevronRight,
  FileJson, FileSpreadsheet, CheckSquare, Square, GripVertical, Pencil, X, Check,
} from 'lucide-react';

const STORAGE_KEY = 'sales-motion-drafts';
const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function newId() { return crypto.randomUUID(); }

function createBlankTask(): Task {
  return { id: newId(), activityText: '', assignedTo: '', status: 'Not Started', priority: 'Medium', dueDate: '', completedDate: '', keyDependency: '', dependencyStatus: 'Not Started', kpiMetric: '', target: '', actual: '', rag: '', notes: '' };
}

function createBlankCategory(name = 'New Category'): Category {
  return { id: newId(), name, assignedTo: '', status: 'Not Started', priority: 'Medium', dueDate: '', completedDate: '', target: '', rag: '', notes: '', tasks: [createBlankTask()] };
}

function createBlankKPI(): KPIRow {
  const monthly: Record<string, string> = {};
  for (const m of MONTHS) monthly[m] = '';
  return { id: newId(), metric: '', annualTarget: '', monthly };
}

function createBlankMotion(name = 'New Motion'): Motion {
  return {
    id: newId(), name, type: 'Custom Sales Motion', description: '', color: COLORS[Math.floor(Math.random() * COLORS.length)],
    owner: '', reportingMonth: '', focusNote: '', ragStatus: '', sellers: '', contributionGoal: '', actual: '', leads: '', wins: '',
    categories: [createBlankCategory('Strategy & Planning'), createBlankCategory('Execution'), createBlankCategory('Events/In Person')],
    kpiRows: [createBlankKPI()],
  };
}

function datestamp() { return new Date().toISOString().slice(0, 10); }

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Main Component ──────────────────────────────────────────────────────────

export function MotionDevelopment() {
  const { dispatch, parentMotions } = useTracker();
  const [drafts, setDrafts] = useState<Motion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedMotion, setExpandedMotion] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load drafts from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDrafts(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Persist drafts to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Draft CRUD ──────────────────────────────────────────────────────────

  function addBlankDraft() {
    const m = createBlankMotion();
    setDrafts((prev) => [...prev, m]);
    setExpandedMotion(m.id);
    showToast('New draft created');
  }

  function cloneDraft(motion: Motion) {
    const cloned: Motion = { ...structuredClone(motion), id: newId(), name: `${motion.name} (Copy)` };
    cloned.categories = cloned.categories.map((c) => ({ ...c, id: newId(), tasks: c.tasks.map((t) => ({ ...t, id: newId() })) }));
    cloned.kpiRows = cloned.kpiRows.map((k) => ({ ...k, id: newId() }));
    setDrafts((prev) => [...prev, cloned]);
    showToast('Draft cloned');
  }

  function deleteDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
    if (expandedMotion === id) setExpandedMotion(null);
    showToast('Draft deleted');
  }

  function updateDraft(id: string, updates: Partial<Motion>) {
    setDrafts((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d));
  }

  // ── Category / Task helpers ─────────────────────────────────────────────

  function updateCategory(motionId: string, catId: string, updates: Partial<Category>) {
    setDrafts((prev) => prev.map((d) => d.id !== motionId ? d : {
      ...d, categories: d.categories.map((c) => c.id === catId ? { ...c, ...updates } : c),
    }));
  }

  function addCategory(motionId: string) {
    setDrafts((prev) => prev.map((d) => d.id !== motionId ? d : { ...d, categories: [...d.categories, createBlankCategory()] }));
  }

  function deleteCategory(motionId: string, catId: string) {
    setDrafts((prev) => prev.map((d) => d.id !== motionId ? d : { ...d, categories: d.categories.filter((c) => c.id !== catId) }));
  }

  function updateTask(motionId: string, catId: string, taskId: string, updates: Partial<Task>) {
    setDrafts((prev) => prev.map((d) => d.id !== motionId ? d : {
      ...d, categories: d.categories.map((c) => c.id !== catId ? c : {
        ...c, tasks: c.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t),
      }),
    }));
  }

  function addTask(motionId: string, catId: string) {
    setDrafts((prev) => prev.map((d) => d.id !== motionId ? d : {
      ...d, categories: d.categories.map((c) => c.id !== catId ? c : { ...c, tasks: [...c.tasks, createBlankTask()] }),
    }));
  }

  function deleteTask(motionId: string, catId: string, taskId: string) {
    setDrafts((prev) => prev.map((d) => d.id !== motionId ? d : {
      ...d, categories: d.categories.map((c) => c.id !== catId ? c : { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) }),
    }));
  }

  // ── Selection ───────────────────────────────────────────────────────────

  function toggleSelect(id: string) {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function selectAll() {
    if (selected.size === drafts.length) setSelected(new Set());
    else setSelected(new Set(drafts.map((d) => d.id)));
  }

  // ── Import ──────────────────────────────────────────────────────────────

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          let motions: Motion[] = [];
          if (Array.isArray(data)) motions = data;
          else if (data.categories && data.name) motions = [data];
          else if (data.motions) motions = data.motions;
          else if (data.parentMotions) motions = data.parentMotions;
          else throw new Error('Unrecognized JSON format');

          const imported = motions.map((m: Motion) => ({
            ...m,
            id: newId(),
            categories: (m.categories ?? []).map((c: Category) => ({ ...c, id: newId(), tasks: (c.tasks ?? []).map((t: Task) => ({ ...t, id: newId() })) })),
            kpiRows: (m.kpiRows ?? []).map((k: KPIRow) => ({ ...k, id: newId() })),
          }));
          setDrafts((prev) => [...prev, ...imported]);
          showToast(`Imported ${imported.length} motion(s) from JSON`);
        } catch (err) {
          showToast(`Import failed: ${(err as Error).message}`);
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const wb = XLSX.read(ev.target?.result, { type: 'array' });
          const motionsSheet = wb.Sheets['Motions'] || wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(motionsSheet);
          const activitiesSheet = wb.Sheets['Activities'];
          const activityRows = activitiesSheet ? XLSX.utils.sheet_to_json<Record<string, string>>(activitiesSheet) : [];

          const motionMap = new Map<string, Motion>();
          for (const row of rows) {
            const name = row['Campaign'] || row['Name'] || row['name'] || '';
            if (!name) continue;
            const m = createBlankMotion(name);
            m.type = row['Type'] || m.type;
            m.owner = row['Owner'] || '';
            m.ragStatus = (row['RAG Status'] || '') as Motion['ragStatus'];
            m.contributionGoal = row['Contribution Goal'] || '';
            m.actual = row['Actual'] || '';
            m.leads = row['Leads'] || '';
            m.wins = row['Wins'] || '';
            m.categories = [];
            motionMap.set(name, m);
          }

          // Group activities by campaign → category
          for (const row of activityRows) {
            const campaignName = row['Campaign'] || '';
            const catName = row['Category'] || 'General';
            const motion = motionMap.get(campaignName);
            if (!motion) continue;
            let cat = motion.categories.find((c) => c.name === catName);
            if (!cat) {
              cat = createBlankCategory(catName);
              cat.tasks = [];
              motion.categories.push(cat);
            }
            cat.tasks.push({
              id: newId(),
              activityText: row['Activity'] || '',
              assignedTo: row['Assigned To'] || '',
              status: (row['Status'] || 'Not Started') as Task['status'],
              priority: (row['Priority'] || 'Medium') as Task['priority'],
              dueDate: row['Due Date'] || '',
              completedDate: row['Completed Date'] || '',
              keyDependency: row['Key Dependency'] || '',
              dependencyStatus: (row['Dep Status'] || 'Not Started') as Task['dependencyStatus'],
              kpiMetric: row['KPI Metric'] || '',
              target: row['Target'] || '',
              actual: row['Actual'] || '',
              rag: (row['RAG'] || '') as Task['rag'],
              notes: row['Notes'] || '',
            });
          }

          const imported = Array.from(motionMap.values());
          // Ensure motions without activities still have default categories
          for (const m of imported) {
            if (m.categories.length === 0) {
              m.categories = [createBlankCategory('Strategy & Planning'), createBlankCategory('Execution')];
            }
          }
          setDrafts((prev) => [...prev, ...imported]);
          showToast(`Imported ${imported.length} motion(s) from Excel`);
        } catch (err) {
          showToast(`Excel import failed: ${(err as Error).message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast('Unsupported file type. Use .json or .xlsx');
    }

    // Reset file input
    if (fileRef.current) fileRef.current.value = '';
  }

  // ── Export ──────────────────────────────────────────────────────────────

  function exportMotionsJSON(motions: Motion[]) {
    const blob = new Blob([JSON.stringify(motions, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `motion-drafts-${datestamp()}.json`);
    showToast(`Exported ${motions.length} motion(s) as JSON`);
  }

  function exportMotionsExcel(motions: Motion[]) {
    const wb = XLSX.utils.book_new();

    // Motions sheet
    const motionRows = motions.map((m) => ({
      'Campaign': m.name, 'Type': m.type, 'Description': m.description, 'Owner': m.owner,
      'RAG Status': m.ragStatus, 'Contribution Goal': m.contributionGoal, 'Actual': m.actual,
      'Leads': m.leads, 'Wins': m.wins, 'Color': m.color,
    }));
    const ws1 = XLSX.utils.json_to_sheet(motionRows.length > 0 ? motionRows : [{ '(No data)': '' }]);
    XLSX.utils.book_append_sheet(wb, ws1, 'Motions');

    // Activities sheet
    const taskRows = motions.flatMap((m) => m.categories.flatMap((c) => c.tasks.map((t) => ({
      'Campaign': m.name, 'Category': c.name, 'Activity': t.activityText, 'Assigned To': t.assignedTo,
      'Status': t.status, 'Priority': t.priority, 'Due Date': t.dueDate, 'Completed Date': t.completedDate,
      'Key Dependency': t.keyDependency, 'Dep Status': t.dependencyStatus,
      'KPI Metric': t.kpiMetric, 'Target': t.target, 'Actual': t.actual, 'RAG': t.rag, 'Notes': t.notes,
    }))));
    const ws2 = XLSX.utils.json_to_sheet(taskRows.length > 0 ? taskRows : [{ '(No data)': '' }]);
    XLSX.utils.book_append_sheet(wb, ws2, 'Activities');

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, `motion-drafts-${datestamp()}.xlsx`);
    showToast(`Exported ${motions.length} motion(s) as Excel`);
  }

  function exportSelected(format: 'json' | 'xlsx') {
    const motions = drafts.filter((d) => selected.has(d.id));
    if (motions.length === 0) { showToast('No motions selected'); return; }
    format === 'json' ? exportMotionsJSON(motions) : exportMotionsExcel(motions);
  }

  // ── Promote to Production ──────────────────────────────────────────────

  function promoteDraft(motion: Motion) {
    const exists = parentMotions.some((p) => p.name.toLowerCase() === motion.name.toLowerCase());
    if (exists) {
      if (!confirm(`A parent motion named "${motion.name}" already exists. Promote anyway?`)) return;
    }
    dispatch({ type: 'PROMOTE_DRAFT_TO_PARENT', motion });
    setDrafts((prev) => prev.filter((d) => d.id !== motion.id));
    setSelected((prev) => { const s = new Set(prev); s.delete(motion.id); return s; });
    showToast(`"${motion.name}" promoted to production!`);
  }

  function promoteSelected() {
    const motions = drafts.filter((d) => selected.has(d.id));
    if (motions.length === 0) { showToast('No motions selected'); return; }
    for (const m of motions) dispatch({ type: 'PROMOTE_DRAFT_TO_PARENT', motion: m });
    setDrafts((prev) => prev.filter((d) => !selected.has(d.id)));
    setSelected(new Set());
    showToast(`Promoted ${motions.length} motion(s) to production`);
  }

  // ── Toggle helpers ─────────────────────────────────────────────────────

  function toggleCat(catId: string) {
    setExpandedCats((prev) => { const s = new Set(prev); s.has(catId) ? s.delete(catId) : s.add(catId); return s; });
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-0">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Motion Development</h1>
        <p className="text-sm text-gray-500 mt-1">Create, edit, and manage draft motions. Promote them to production when ready.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 bg-white rounded-xl border border-gray-200 p-3">
        <button onClick={addBlankDraft} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
          <Plus size={14} /> New Draft
        </button>

        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50">
          <Upload size={14} /> Import
        </button>
        <input ref={fileRef} type="file" accept=".json,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />

        <div className="w-px h-6 bg-gray-200" />

        <button onClick={() => exportSelected('json')} disabled={selected.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-40">
          <FileJson size={14} /> Export JSON
        </button>
        <button onClick={() => exportSelected('xlsx')} disabled={selected.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-40">
          <FileSpreadsheet size={14} /> Export Excel
        </button>

        <div className="w-px h-6 bg-gray-200" />

        <button onClick={promoteSelected} disabled={selected.size === 0} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-40">
          <Rocket size={14} /> Promote Selected ({selected.size})
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={selectAll} className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 hover:text-gray-700">
            {selected.size === drafts.length && drafts.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
            {selected.size === drafts.length && drafts.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs text-gray-400">{drafts.length} draft(s)</span>
        </div>
      </div>

      {/* Empty state */}
      {drafts.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <GripVertical size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 mb-4">No draft motions yet</p>
          <div className="flex justify-center gap-3">
            <button onClick={addBlankDraft} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              <Plus size={14} /> Create New
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Upload size={14} /> Import File
            </button>
          </div>
        </div>
      )}

      {/* Draft list */}
      <div className="space-y-3">
        {drafts.map((motion) => {
          const isExpanded = expandedMotion === motion.id;
          const isSelected = selected.has(motion.id);
          const totalTasks = motion.categories.reduce((sum, c) => sum + c.tasks.length, 0);

          return (
            <div key={motion.id} className={`bg-white rounded-xl border ${isSelected ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200'} overflow-hidden`}>
              {/* Motion card header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggleSelect(motion.id)} className="shrink-0">
                  {isSelected ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} className="text-gray-400" />}
                </button>

                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: motion.color }} />

                <button onClick={() => setExpandedMotion(isExpanded ? null : motion.id)} className="flex items-center gap-1 flex-1 min-w-0 text-left">
                  {isExpanded ? <ChevronDown size={14} className="text-gray-400 shrink-0" /> : <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                  <span className="font-medium text-sm text-gray-900 truncate">{motion.name || '(Untitled)'}</span>
                </button>

                <span className="text-[10px] text-gray-400 shrink-0">{motion.categories.length} cat · {totalTasks} tasks</span>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => exportMotionsJSON([motion])} title="Export JSON" className="p-1 hover:bg-gray-100 rounded">
                    <FileJson size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => exportMotionsExcel([motion])} title="Export Excel" className="p-1 hover:bg-gray-100 rounded">
                    <FileSpreadsheet size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => cloneDraft(motion)} title="Clone" className="p-1 hover:bg-gray-100 rounded">
                    <Copy size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => promoteDraft(motion)} title="Promote to Production" className="p-1 hover:bg-green-100 rounded">
                    <Rocket size={14} className="text-green-600" />
                  </button>
                  <button onClick={() => deleteDraft(motion.id)} title="Delete" className="p-1 hover:bg-red-100 rounded">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                  {/* Motion fields */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Field label="Motion Name" value={motion.name} onChange={(v) => updateDraft(motion.id, { name: v })} />
                    <Field label="Type" value={motion.type} onChange={(v) => updateDraft(motion.id, { type: v })} />
                    <Field label="Owner" value={motion.owner} onChange={(v) => updateDraft(motion.id, { owner: v })} />
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Color</label>
                      <div className="flex gap-1">
                        {COLORS.map((c) => (
                          <button key={c} onClick={() => updateDraft(motion.id, { color: c })}
                            className={`w-5 h-5 rounded-full border-2 ${motion.color === c ? 'border-gray-900' : 'border-transparent'}`}
                            style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                    <Field label="Description" value={motion.description} onChange={(v) => updateDraft(motion.id, { description: v })} wide />
                    <Field label="Sellers" value={motion.sellers} onChange={(v) => updateDraft(motion.id, { sellers: v })} />
                    <Field label="Contribution Goal" value={motion.contributionGoal} onChange={(v) => updateDraft(motion.id, { contributionGoal: v })} />
                    <SelectField label="RAG Status" value={motion.ragStatus} options={RAG_OPTIONS} onChange={(v) => updateDraft(motion.id, { ragStatus: v as Motion['ragStatus'] })} />
                    <SelectField label="Outcome Type" value={motion.expectedOutcomeType ?? ''} options={OUTCOME_TYPE_OPTIONS} onChange={(v) => updateDraft(motion.id, { expectedOutcomeType: v as OutcomeType })} />
                    <Field label="Outcome Value" value={motion.expectedOutcomeValue ?? ''} onChange={(v) => updateDraft(motion.id, { expectedOutcomeValue: v })} />
                    <Field label="Pipeline Customers" value={motion.pipelineImpactCustomers ?? ''} onChange={(v) => updateDraft(motion.id, { pipelineImpactCustomers: v })} />
                    <Field label="Pipeline $" value={motion.pipelineImpactValue ?? ''} onChange={(v) => updateDraft(motion.id, { pipelineImpactValue: v })} />
                  </div>

                  {/* Categories */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Categories</h3>
                      <button onClick={() => addCategory(motion.id)} className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-medium">
                        <Plus size={12} /> Add Category
                      </button>
                    </div>

                    <div className="space-y-2">
                      {motion.categories.map((cat) => {
                        const catExpanded = expandedCats.has(cat.id);
                        return (
                          <div key={cat.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                              <button onClick={() => toggleCat(cat.id)}>
                                {catExpanded ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
                              </button>
                              <input value={cat.name} onChange={(e) => updateCategory(motion.id, cat.id, { name: e.target.value })}
                                className="flex-1 text-xs font-medium bg-transparent border-none outline-none" />
                              <span className="text-[10px] text-gray-400">{cat.tasks.length} tasks</span>
                              <button onClick={() => deleteCategory(motion.id, cat.id)} className="p-0.5 hover:bg-red-100 rounded">
                                <Trash2 size={11} className="text-red-400" />
                              </button>
                            </div>

                            {catExpanded && (
                              <div className="px-3 py-2 space-y-2">
                                {/* Category fields */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                  <Field label="Assigned To" value={cat.assignedTo} onChange={(v) => updateCategory(motion.id, cat.id, { assignedTo: v })} small />
                                  <SelectField label="Status" value={cat.status} options={STATUS_OPTIONS} onChange={(v) => updateCategory(motion.id, cat.id, { status: v as Category['status'] })} small />
                                  <SelectField label="Priority" value={cat.priority} options={PRIORITY_OPTIONS} onChange={(v) => updateCategory(motion.id, cat.id, { priority: v as Category['priority'] })} small />
                                  <Field label="Due Date" value={cat.dueDate} onChange={(v) => updateCategory(motion.id, cat.id, { dueDate: v })} type="date" small />
                                  <SelectField label="Outcome Type" value={cat.expectedOutcomeType ?? ''} options={OUTCOME_TYPE_OPTIONS} onChange={(v) => updateCategory(motion.id, cat.id, { expectedOutcomeType: v as OutcomeType })} small />
                                  <Field label="Outcome Value" value={cat.expectedOutcomeValue ?? ''} onChange={(v) => updateCategory(motion.id, cat.id, { expectedOutcomeValue: v })} small />
                                </div>

                                {/* Tasks table */}
                                {cat.tasks.length > 0 && (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-[11px]">
                                      <thead>
                                        <tr className="text-gray-500 border-b border-gray-100">
                                          <th className="text-left py-1 px-1 font-medium">Activity</th>
                                          <th className="text-left py-1 px-1 font-medium w-24">Assigned To</th>
                                          <th className="text-left py-1 px-1 font-medium w-24">Status</th>
                                          <th className="text-left py-1 px-1 font-medium w-20">Priority</th>
                                          <th className="text-left py-1 px-1 font-medium w-28">Due Date</th>
                                          <th className="text-left py-1 px-1 font-medium">Dependency</th>
                                          <th className="text-left py-1 px-1 font-medium w-24">Notes</th>
                                          <th className="w-6"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {cat.tasks.map((task) => (
                                          <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-1 px-1">
                                              <input value={task.activityText} onChange={(e) => updateTask(motion.id, cat.id, task.id, { activityText: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-[11px]" placeholder="Activity..." />
                                            </td>
                                            <td className="py-1 px-1">
                                              <input value={task.assignedTo} onChange={(e) => updateTask(motion.id, cat.id, task.id, { assignedTo: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-[11px]" />
                                            </td>
                                            <td className="py-1 px-1">
                                              <select value={task.status} onChange={(e) => updateTask(motion.id, cat.id, task.id, { status: e.target.value as Task['status'] })}
                                                className="w-full bg-transparent border-none outline-none text-[11px]">
                                                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                              </select>
                                            </td>
                                            <td className="py-1 px-1">
                                              <select value={task.priority} onChange={(e) => updateTask(motion.id, cat.id, task.id, { priority: e.target.value as Task['priority'] })}
                                                className="w-full bg-transparent border-none outline-none text-[11px]">
                                                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                              </select>
                                            </td>
                                            <td className="py-1 px-1">
                                              <input type="date" value={task.dueDate} onChange={(e) => updateTask(motion.id, cat.id, task.id, { dueDate: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-[11px]" />
                                            </td>
                                            <td className="py-1 px-1">
                                              <input value={task.keyDependency} onChange={(e) => updateTask(motion.id, cat.id, task.id, { keyDependency: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-[11px]" placeholder="Dependency..." />
                                            </td>
                                            <td className="py-1 px-1">
                                              <input value={task.notes} onChange={(e) => updateTask(motion.id, cat.id, task.id, { notes: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none text-[11px]" />
                                            </td>
                                            <td className="py-1 px-1">
                                              <button onClick={() => deleteTask(motion.id, cat.id, task.id)} className="p-0.5 hover:bg-red-100 rounded">
                                                <X size={10} className="text-red-400" />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                                <button onClick={() => addTask(motion.id, cat.id)} className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-medium">
                                  <Plus size={10} /> Add Task
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Reusable field components ──────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', wide, small }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; wide?: boolean; small?: boolean;
}) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <label className={`block font-medium text-gray-500 mb-0.5 ${small ? 'text-[9px]' : 'text-[10px]'}`}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:border-blue-400 ${small ? 'text-[10px]' : 'text-xs'}`} />
    </div>
  );
}

function SelectField({ label, value, options, onChange, small }: {
  label: string; value: string; options: readonly string[]; onChange: (v: string) => void; small?: boolean;
}) {
  return (
    <div>
      <label className={`block font-medium text-gray-500 mb-0.5 ${small ? 'text-[9px]' : 'text-[10px]'}`}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:border-blue-400 ${small ? 'text-[10px]' : 'text-xs'}`}>
        {options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
      </select>
    </div>
  );
}
