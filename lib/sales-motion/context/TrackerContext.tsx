'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, Motion, Task, Category, KPIRow, MultiUserState, UserId, SharedMotionEntry } from '@/lib/sales-motion/types';
import { MONTHS, USERS } from '@/lib/sales-motion/types';
import { loadMultiUserState, saveMultiUserState, createFreshMultiUserState } from '@/lib/sales-motion/utils/storage';
import { createSeedData } from '@/lib/sales-motion/data/seedData';

type Action =
  | { type: 'SWITCH_USER'; userId: UserId }
  | { type: 'SET_VIEW_ALL' }
  | { type: 'ADD_SHARED_MOTION'; name: string; color: string }
  | { type: 'TOGGLE_REPORTING_MONTH'; month: string }
  | { type: 'UPDATE_MOTION_FIELD'; motionId: string; field: keyof Pick<Motion, 'owner' | 'focusNote' | 'ragStatus' | 'contributionGoal' | 'actual' | 'leads' | 'wins'>; value: string }
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
  | { type: 'ADD_MOTION'; name: string; color: string }
  | { type: 'DELETE_MOTION'; motionId: string }
  | { type: 'IMPORT_STATE'; state: MultiUserState }
  | { type: 'RESET_STATE' };

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

function mapCategory(motion: Motion, categoryId: string, fn: (cat: Category) => Category): Motion {
  return { ...motion, categories: motion.categories.map((c) => (c.id === categoryId ? fn(c) : c)) };
}

function createNewMotion(name: string, color: string, reportingMonths: string[]): Motion {
  return {
    id: crypto.randomUUID(),
    name,
    type: 'Custom Sales Motion',
    description: '',
    color,
    owner: '',
    reportingMonth: reportingMonths[0] || '',
    focusNote: '',
    ragStatus: '',
    contributionGoal: '',
    actual: '',
    leads: '',
    wins: '',
    categories: [
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
      return mapMotion(state, action.motionId, (m) => mapCategory(m, action.categoryId, (c) => ({ ...c, tasks: c.tasks.map((t) => (t.id === action.taskId ? { ...t, [action.field]: action.value } : t)) })));
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
      return { ...state, motions: [...state.motions, createNewMotion(action.name, action.color, state.reportingMonths)] };
    case 'DELETE_MOTION':
      return { ...state, motions: state.motions.filter((m) => m.id !== action.motionId) };
    default:
      return state;
  }
}

function multiUserReducer(full: MultiUserState, action: Action): MultiUserState {
  if (action.type === 'SWITCH_USER') return { ...full, activeUser: action.userId, viewAll: false };
  if (action.type === 'SET_VIEW_ALL') return { ...full, viewAll: true };
  if (action.type === 'IMPORT_STATE') return action.state;
  if (action.type === 'RESET_STATE') return createFreshMultiUserState();
  if (action.type === 'ADD_SHARED_MOTION') {
    const entry: SharedMotionEntry = { name: action.name, color: action.color, createdBy: full.activeUser };
    return { ...full, sharedMotionLibrary: [...full.sharedMotionLibrary, entry] };
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
  sharedMotionLibrary: SharedMotionEntry[];
}

const TrackerContext = createContext<TrackerContextValue | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [fullState, dispatch] = useReducer(multiUserReducer, null, () => {
    if (typeof window === 'undefined') return createFreshMultiUserState();
    return loadMultiUserState() ?? createFreshMultiUserState();
  });

  useEffect(() => {
    saveMultiUserState(fullState);
  }, [fullState]);

  const value: TrackerContextValue = {
    state: fullState.users[fullState.activeUser],
    fullState,
    dispatch,
    activeUser: fullState.activeUser,
    viewAll: fullState.viewAll,
    sharedMotionLibrary: fullState.sharedMotionLibrary,
  };

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker(): TrackerContextValue {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used within a TrackerProvider');
  return ctx;
}

export type { Action };
