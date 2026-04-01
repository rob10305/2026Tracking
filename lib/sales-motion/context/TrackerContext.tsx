'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { AppState, Motion, Task, Category, KPIRow, MultiUserState, UserId } from '@/lib/sales-motion/types';
import { MONTHS, USERS } from '@/lib/sales-motion/types';
import { createFreshMultiUserState } from '@/lib/sales-motion/utils/storage';

type Action =
  | { type: 'SWITCH_USER'; userId: UserId }
  | { type: 'SET_VIEW_ALL' }
  | { type: 'TOGGLE_REPORTING_MONTH'; month: string }
  // ── Parent motion actions (All view only) ──────────────────────────────────
  | { type: 'ADD_PARENT_MOTION'; name: string; color: string }
  | { type: 'DELETE_PARENT_MOTION'; motionId: string }
  | { type: 'TOGGLE_PARENT_MOTION_LOCK'; motionId: string }
  | { type: 'UPDATE_PARENT_MOTION_FIELD'; motionId: string; field: keyof Pick<Motion, 'name' | 'type' | 'description' | 'owner' | 'focusNote' | 'ragStatus' | 'sellers' | 'contributionGoal' | 'actual' | 'leads' | 'wins' | 'expectedOutcomeType' | 'expectedOutcomeValue' | 'pipelineImpactCustomers' | 'pipelineImpactValue'>; value: string }
  // ── Per-user motion actions ────────────────────────────────────────────────
  | { type: 'UPDATE_MOTION_FIELD'; motionId: string; field: keyof Pick<Motion, 'owner' | 'focusNote' | 'ragStatus' | 'sellers' | 'contributionGoal' | 'actual' | 'leads' | 'wins' | 'expectedOutcomeType' | 'expectedOutcomeValue' | 'pipelineImpactCustomers' | 'pipelineImpactValue'>; value: string }
  | { type: 'ADD_TASK'; motionId: string; categoryId: string }
  | { type: 'UPDATE_TASK'; motionId: string; categoryId: string; taskId: string; field: keyof Task; value: string }
  | { type: 'DELETE_TASK'; motionId: string; categoryId: string; taskId: string }
  | { type: 'ADD_CATEGORY'; motionId: string; name: string }
  | { type: 'DELETE_CATEGORY'; motionId: string; categoryId: string }
  | { type: 'UPDATE_CATEGORY_NAME'; motionId: string; categoryId: string; name: string }
  | { type: 'UPDATE_CATEGORY_FIELD'; motionId: string; categoryId: string; field: string; value: string }
  | { type: 'ADD_KPI_ROW'; motionId: string }
  | { type: 'UPDATE_KPI_ROW'; motionId: string; kpiId: string; field: string; value: string }
  | { type: 'DELETE_KPI_ROW'; motionId: string; kpiId: string }
  | { type: 'ADD_MOTION'; name: string; color: string; seller?: string }
  | { type: 'CLONE_MOTION'; source: Motion; sourceUserId: string; cloningSeller?: string }
  | { type: 'RESET_TASK_OVERRIDE'; motionId: string; categoryId: string; taskId: string }
  | { type: 'TOGGLE_MOTION_LOCK'; motionId: string }
  | { type: 'DELETE_MOTION'; motionId: string }
  | { type: 'UPDATE_USER_MOTION_FIELD'; userId: UserId; motionId: string; field: 'sellers'; value: string }
  | { type: 'IMPORT_STATE'; state: MultiUserState }
  | { type: 'RESET_STATE' }
  | { type: 'SET_FULL_STATE'; state: MultiUserState };

function createDefaultTask(): Task {
  return {
    id: crypto.randomUUID(),
    activityText: '',
    assignedTo: '',
    status: 'Not Started',
    priority: 'Medium',
    dueDate: '',
    completedDate: '',
    keyDependency: '',
    dependencyStatus: 'Not Started',
    kpiMetric: '',
    target: '',
    actual: '',
    rag: '',
    notes: '',
  };
}

function createDefaultKPIRow(): KPIRow {
  const monthly: Record<string, string> = {};
  for (const m of MONTHS) monthly[m] = '';
  return { id: crypto.randomUUID(), metric: '', annualTarget: '', monthly };
}

function mapMotion(state: AppState, motionId: string, fn: (motion: Motion) => Motion): AppState {
  return { ...state, motions: state.motions.map((m) => (m.id === motionId ? fn(m) : m)) };
}

function mapParentMotion(full: MultiUserState, motionId: string, fn: (m: Motion) => Motion): MultiUserState {
  return { ...full, parentMotions: (full.parentMotions ?? []).map((m) => m.id === motionId ? fn(m) : m) };
}

function mapCategory(motion: Motion, categoryId: string, fn: (cat: Category) => Category): Motion {
  return { ...motion, categories: motion.categories.map((c) => (c.id === categoryId ? fn(c) : c)) };
}

function createNewMotion(name: string, color: string, reportingMonths: string[], seller = ''): Motion {
  return {
    id: crypto.randomUUID(),
    name,
    type: 'Custom Sales Motion',
    description: '',
    color,
    owner: seller,
    reportingMonth: reportingMonths[0] || '',
    focusNote: '',
    ragStatus: '',
    sellers: seller,
    contributionGoal: '',
    actual: '',
    leads: '',
    wins: '',
    categories: [
      { id: crypto.randomUUID(), name: 'Events/In Person', tasks: [], assignedTo: '', status: 'Not Started', priority: 'Medium', dueDate: '', completedDate: '', target: '', rag: '', notes: '' },
      { id: crypto.randomUUID(), name: 'Strategy & Planning', tasks: [], assignedTo: '', status: 'Not Started', priority: 'Medium', dueDate: '', completedDate: '', target: '', rag: '', notes: '' },
      { id: crypto.randomUUID(), name: 'Execution', tasks: [], assignedTo: '', status: 'Not Started', priority: 'Medium', dueDate: '', completedDate: '', target: '', rag: '', notes: '' },
    ],
    kpiRows: [createDefaultKPIRow(), createDefaultKPIRow(), createDefaultKPIRow()],
  };
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'TOGGLE_REPORTING_MONTH': {
      const has = state.reportingMonths.includes(action.month);
      return { ...state, reportingMonths: has ? state.reportingMonths.filter((m) => m !== action.month) : [...state.reportingMonths, action.month].sort() };
    }
    case 'UPDATE_MOTION_FIELD':
      return mapMotion(state, action.motionId, (m) => ({ ...m, [action.field]: action.value }));
    case 'ADD_TASK':
      return mapMotion(state, action.motionId, (m) => mapCategory(m, action.categoryId, (c) => ({ ...c, tasks: [...c.tasks, createDefaultTask()] })));
    case 'UPDATE_TASK':
      return mapMotion(state, action.motionId, (m) => mapCategory(m, action.categoryId, (c) => ({
        ...c,
        tasks: c.tasks.map((t) => t.id === action.taskId
          ? { ...t, [action.field]: action.value, isOverridden: t.parentTaskId ? true : t.isOverridden }
          : t),
      })));
    case 'RESET_TASK_OVERRIDE':
      return mapMotion(state, action.motionId, (m) => mapCategory(m, action.categoryId, (c) => ({
        ...c,
        tasks: c.tasks.map((t) => t.id === action.taskId ? { ...t, isOverridden: false } : t),
      })));
    case 'DELETE_TASK':
      return mapMotion(state, action.motionId, (m) => mapCategory(m, action.categoryId, (c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== action.taskId) })));
    case 'ADD_CATEGORY':
      return mapMotion(state, action.motionId, (m) => ({ ...m, categories: [...m.categories, { id: crypto.randomUUID(), name: action.name, tasks: [], assignedTo: '', status: 'Not Started', priority: 'Medium', dueDate: '', completedDate: '', target: '', rag: '', notes: '' }] }));
    case 'DELETE_CATEGORY':
      return mapMotion(state, action.motionId, (m) => ({ ...m, categories: m.categories.filter((c) => c.id !== action.categoryId) }));
    case 'UPDATE_CATEGORY_NAME':
      return mapMotion(state, action.motionId, (m) => mapCategory(m, action.categoryId, (c) => ({ ...c, name: action.name })));
    case 'UPDATE_CATEGORY_FIELD':
      return mapMotion(state, action.motionId, (m) => mapCategory(m, action.categoryId, (c) => ({ ...c, [action.field]: action.value })));
    case 'ADD_KPI_ROW':
      return mapMotion(state, action.motionId, (m) => ({ ...m, kpiRows: [...m.kpiRows, createDefaultKPIRow()] }));
    case 'UPDATE_KPI_ROW':
      return mapMotion(state, action.motionId, (m) => ({ ...m, kpiRows: m.kpiRows.map((k) => k.id === action.kpiId ? (action.field === 'metric' || action.field === 'annualTarget' ? { ...k, [action.field]: action.value } : { ...k, monthly: { ...k.monthly, [action.field]: action.value } }) : k) }));
    case 'DELETE_KPI_ROW':
      return mapMotion(state, action.motionId, (m) => ({ ...m, kpiRows: m.kpiRows.filter((k) => k.id !== action.kpiId) }));
    case 'ADD_MOTION':
      return { ...state, motions: [...state.motions, createNewMotion(action.name, action.color, state.reportingMonths, action.seller ?? '')] };
    case 'CLONE_MOTION': {
      const src = action.source;
      const cloned: Motion = {
        ...src,
        id: crypto.randomUUID(),
        owner: action.cloningSeller ?? '',
        ragStatus: '' as import('@/lib/sales-motion/types').RAG,
        sellers: action.cloningSeller ?? '',
        contributionGoal: '',
        actual: '',
        leads: '',
        wins: '',
        focusNote: '',
        parentMotionId: src.id,
        parentUserId: action.sourceUserId,
        categories: src.categories.map((c) => ({
          ...c,
          id: crypto.randomUUID(),
          parentCategoryId: c.id,
          tasks: c.tasks.map((t) => ({
            ...t,
            id: crypto.randomUUID(),
            parentTaskId: t.id,
            isOverridden: false,
          })),
        })),
        kpiRows: src.kpiRows.map((k) => ({ ...k, id: crypto.randomUUID() })),
      };
      return { ...state, motions: [...state.motions, cloned] };
    }
    case 'TOGGLE_MOTION_LOCK':
      return mapMotion(state, action.motionId, (m) => ({ ...m, locked: !m.locked }));
    case 'DELETE_MOTION':
      return { ...state, motions: state.motions.filter((m) => m.id !== action.motionId) };
    default:
      return state;
  }
}

function ensureParentMotions(full: MultiUserState): MultiUserState {
  if (full.parentMotions) return full;
  // Migration: extract unique top-level motions from all users → parentMotions
  const seen = new Map<string, Motion>();
  for (const user of USERS) {
    for (const m of (full.users[user.id]?.motions ?? [])) {
      if (!m.parentMotionId && !seen.has(m.name)) {
        seen.set(m.name, { ...m });
      }
    }
  }
  return {
    ...full,
    parentMotions: Array.from(seen.values()),
    users: Object.fromEntries(
      USERS.map((u) => [u.id, {
        ...full.users[u.id],
        motions: (full.users[u.id]?.motions ?? []).filter((m) => !!m.parentMotionId),
      }]),
    ) as Record<UserId, AppState>,
  };
}

function multiUserReducer(full: MultiUserState, action: Action): MultiUserState {
  if (action.type === 'SWITCH_USER') return { ...full, activeUser: action.userId, viewAll: false };
  if (action.type === 'SET_VIEW_ALL') return { ...full, viewAll: true };
  if (action.type === 'IMPORT_STATE') return ensureParentMotions(action.state);
  if (action.type === 'SET_FULL_STATE') return ensureParentMotions(action.state);
  if (action.type === 'RESET_STATE') return createFreshMultiUserState();

  // ── Parent motion actions ─────────────────────────────────────────────────
  if (action.type === 'ADD_PARENT_MOTION') {
    const newMotion = createNewMotion(action.name, action.color, []);
    return { ...full, parentMotions: [...(full.parentMotions ?? []), newMotion] };
  }
  if (action.type === 'DELETE_PARENT_MOTION') {
    return { ...full, parentMotions: (full.parentMotions ?? []).filter((m) => m.id !== action.motionId) };
  }
  if (action.type === 'TOGGLE_PARENT_MOTION_LOCK') {
    return mapParentMotion(full, action.motionId, (m) => ({ ...m, locked: !m.locked }));
  }
  if (action.type === 'UPDATE_PARENT_MOTION_FIELD') {
    return mapParentMotion(full, action.motionId, (m) => ({ ...m, [action.field]: action.value }));
  }

  // ── User-specific actions ─────────────────────────────────────────────────
  if (action.type === 'UPDATE_USER_MOTION_FIELD') {
    const targetState = full.users[action.userId];
    const updatedMotions = targetState.motions.map((m) =>
      m.id === action.motionId ? { ...m, [action.field]: action.value } : m,
    );
    return { ...full, users: { ...full.users, [action.userId]: { ...targetState, motions: updatedMotions } } };
  }

  // ── Route task/category/kpi actions to parentMotions when the motionId belongs to a parent ──
  if ('motionId' in action && (full.parentMotions ?? []).some((m) => m.id === action.motionId)) {
    const fakeUserState: AppState = { motions: full.parentMotions ?? [], reportingMonths: [] };
    const updated = appReducer(fakeUserState, action);
    return { ...full, parentMotions: updated.motions };
  }

  const updatedUser = appReducer(full.users[full.activeUser], action);
  return { ...full, users: { ...full.users, [full.activeUser]: updatedUser } };
}

interface TrackerContextValue {
  state: AppState;
  fullState: MultiUserState;
  dispatch: React.Dispatch<Action>;
  activeUser: UserId;
  viewAll: boolean;
  parentMotions: Motion[];
}

const TrackerContext = createContext<TrackerContextValue | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [fullState, dispatch] = useReducer(multiUserReducer, null, createFreshMultiUserState);
  const isLoaded = useRef(false);

  useEffect(() => {
    fetch('/api/sales-motion/state')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.version === 2) {
          dispatch({ type: 'SET_FULL_STATE', state: data as MultiUserState });
        }
        isLoaded.current = true;
      })
      .catch(() => { isLoaded.current = true; });
  }, []);

  useEffect(() => {
    if (!isLoaded.current) return;
    const timer = setTimeout(() => {
      fetch('/api/sales-motion/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullState),
      }).catch(console.error);
    }, 1500);
    return () => clearTimeout(timer);
  }, [fullState]);

  const value: TrackerContextValue = {
    state: fullState.users[fullState.activeUser],
    fullState,
    dispatch,
    activeUser: fullState.activeUser,
    viewAll: fullState.viewAll,
    parentMotions: fullState.parentMotions ?? [],
  };

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker(): TrackerContextValue {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used within a TrackerProvider');
  return ctx;
}

export type { Action };
