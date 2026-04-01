import * as XLSX from 'xlsx';
import type { MultiUserState, Motion, UserId } from '../types';
import { USERS, MONTHS } from '../types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function datestamp() {
  return new Date().toISOString().slice(0, 10);
}

// ── JSON exports ────────────────────────────────────────────────────────────

export function exportJSON(state: MultiUserState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `sales-motion-tracker-${datestamp()}.json`);
}

export function exportUserJSON(userId: UserId, fullState: MultiUserState): void {
  const user = USERS.find((u) => u.id === userId);
  const displayName = user?.displayName ?? userId;
  const userData = fullState.users[userId];
  const linkedParentIds = new Set(userData.motions.map((m) => m.parentMotionId).filter(Boolean));
  const linkedParents = (fullState.parentMotions ?? []).filter((m) => linkedParentIds.has(m.id));

  const payload = {
    exportedAt: new Date().toISOString(),
    userId,
    displayName,
    motions: userData.motions,
    reportingMonths: userData.reportingMonths,
    linkedParentCampaigns: linkedParents,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `sales-motion-${displayName.toLowerCase().replace(/\s+/g, '-')}-${datestamp()}.json`);
}

// ── Excel helpers ───────────────────────────────────────────────────────────

function motionRow(m: Motion, userName?: string) {
  const allTasks = m.categories.flatMap((c) => c.tasks);
  const total = allTasks.length;
  const complete = allTasks.filter((t) => t.status === 'Complete').length;
  const inProgress = allTasks.filter((t) => t.status === 'In Progress').length;
  const blocked = allTasks.filter((t) => t.status === 'Blocked').length;

  const row: Record<string, string | number> = {};
  if (userName !== undefined) row['Rep'] = userName;
  row['Campaign'] = m.name;
  row['Type'] = m.type;
  row['Owner'] = m.owner;
  row['RAG Status'] = m.ragStatus;
  row['Contribution Goal'] = m.contributionGoal;
  row['Actual'] = m.actual;
  row['Leads'] = m.leads;
  row['Wins'] = m.wins;
  row['Total Tasks'] = total;
  row['Complete'] = complete;
  row['In Progress'] = inProgress;
  row['Blocked'] = blocked;
  row['% Complete'] = total > 0 ? Math.round((complete / total) * 100) : 0;
  return row;
}

function taskRows(m: Motion, userName?: string) {
  return m.categories.flatMap((cat) =>
    cat.tasks.map((t) => {
      const row: Record<string, string> = {};
      if (userName !== undefined) row['Rep'] = userName;
      row['Campaign'] = m.name;
      row['Category'] = cat.name;
      row['Activity'] = t.activityText;
      row['Assigned To'] = t.assignedTo;
      row['Status'] = t.status;
      row['Priority'] = t.priority;
      row['Due Date'] = t.dueDate;
      row['Completed Date'] = t.completedDate;
      row['Key Dependency'] = t.keyDependency;
      row['Dep Status'] = t.dependencyStatus;
      row['KPI Metric'] = t.kpiMetric;
      row['Target'] = t.target;
      row['Actual'] = t.actual;
      row['RAG'] = t.rag;
      row['Notes'] = t.notes;
      return row;
    }),
  );
}

function kpiRows(m: Motion, userName?: string) {
  return m.kpiRows.map((k) => {
    const row: Record<string, string> = {};
    if (userName !== undefined) row['Rep'] = userName;
    row['Campaign'] = m.name;
    row['Metric'] = k.metric;
    row['Annual Target'] = k.annualTarget;
    for (const month of MONTHS) {
      row[month] = k.monthly[month] ?? '';
    }
    return row;
  });
}

function autoWidth(ws: XLSX.WorkSheet) {
  const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
  if (data.length === 0) return;
  const colWidths = (data[0] ?? []).map((_: unknown, colIdx: number) => {
    let max = 10;
    for (const row of data) {
      const cell = row[colIdx];
      if (cell != null) max = Math.max(max, String(cell).length);
    }
    return { wch: Math.min(max + 2, 40) };
  });
  ws['!cols'] = colWidths;
}

function addSheet(wb: XLSX.WorkBook, name: string, rows: Record<string, string | number>[]) {
  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ '(No data)': '' }]);
  autoWidth(ws);
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
}

// ── Excel exports ───────────────────────────────────────────────────────────

export function exportUserExcel(userId: UserId, fullState: MultiUserState): void {
  const user = USERS.find((u) => u.id === userId);
  const displayName = user?.displayName ?? userId;
  const userData = fullState.users[userId];
  const motions = userData.motions;

  const wb = XLSX.utils.book_new();

  addSheet(wb, 'Motions', motions.map((m) => motionRow(m)));
  addSheet(wb, 'Activities', motions.flatMap((m) => taskRows(m)));
  addSheet(wb, 'KPIs', motions.flatMap((m) => kpiRows(m)));

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `sales-motion-${displayName.toLowerCase().replace(/\s+/g, '-')}-${datestamp()}.xlsx`);
}

export function exportAllExcel(fullState: MultiUserState): void {
  const wb = XLSX.utils.book_new();

  // Summary sheet — one row per user
  const summaryRows = USERS.map((u) => {
    const userData = fullState.users[u.id];
    const motions = userData?.motions ?? [];
    const allTasks = motions.flatMap((m) => m.categories.flatMap((c) => c.tasks));
    return {
      'Rep': u.displayName,
      'Campaigns': motions.length,
      'Total Tasks': allTasks.length,
      'Complete': allTasks.filter((t) => t.status === 'Complete').length,
      'In Progress': allTasks.filter((t) => t.status === 'In Progress').length,
      'Blocked': allTasks.filter((t) => t.status === 'Blocked').length,
    };
  });
  addSheet(wb, 'Summary', summaryRows);

  // All motions sheet
  const allMotionRows = USERS.flatMap((u) => {
    const userData = fullState.users[u.id];
    return (userData?.motions ?? []).map((m) => motionRow(m, u.displayName));
  });
  addSheet(wb, 'All Motions', allMotionRows);

  // All activities sheet
  const allTaskRows = USERS.flatMap((u) => {
    const userData = fullState.users[u.id];
    return (userData?.motions ?? []).flatMap((m) => taskRows(m, u.displayName));
  });
  addSheet(wb, 'All Activities', allTaskRows);

  // All KPIs sheet
  const allKpiRows = USERS.flatMap((u) => {
    const userData = fullState.users[u.id];
    return (userData?.motions ?? []).flatMap((m) => kpiRows(m, u.displayName));
  });
  addSheet(wb, 'All KPIs', allKpiRows);

  // Parent campaigns sheet
  const parents = fullState.parentMotions ?? [];
  const parentMotionRows = parents.map((m) => motionRow(m, '(Parent)'));
  addSheet(wb, 'Parent Campaigns', parentMotionRows);

  const parentTaskRows = parents.flatMap((m) => taskRows(m, '(Parent)'));
  addSheet(wb, 'Parent Activities', parentTaskRows);

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `sales-motion-all-users-${datestamp()}.xlsx`);
}

// ── JSON import (unchanged) ─────────────────────────────────────────────────

export function importJSON(file: File): Promise<MultiUserState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.version === 2 && data.users) {
          resolve(data as MultiUserState);
          return;
        }
        throw new Error('Invalid or unsupported data format');
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
