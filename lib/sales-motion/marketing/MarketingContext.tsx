'use client';

import { createContext, useContext, useReducer, useEffect, useRef, useCallback, useState } from 'react';
import type { MarketingState, SectionKey } from './types';
import { createFreshMarketingState } from './types';

// ── Actions ──────────────────────────────────────────────────────
type Action =
  | { type: 'SET_FULL_STATE'; state: MarketingState }
  | { type: 'ADD_ROW'; section: SectionKey; row: Record<string, string> & { id: string } }
  | { type: 'UPDATE_ROW'; section: SectionKey; id: string; field: string; value: string }
  | { type: 'DELETE_ROW'; section: SectionKey; id: string }
  | { type: 'RESET_STATE' };

function reducer(state: MarketingState, action: Action): MarketingState {
  switch (action.type) {
    case 'SET_FULL_STATE':
      return action.state;
    case 'ADD_ROW':
      return { ...state, [action.section]: [...(state[action.section] as any[]), action.row] };
    case 'UPDATE_ROW':
      return {
        ...state,
        [action.section]: (state[action.section] as any[]).map((r: any) =>
          r.id === action.id ? { ...r, [action.field]: action.value } : r,
        ),
      };
    case 'DELETE_ROW':
      return {
        ...state,
        [action.section]: (state[action.section] as any[]).filter((r: any) => r.id !== action.id),
      };
    case 'RESET_STATE':
      return createFreshMarketingState();
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────
interface MarketingContextValue {
  state: MarketingState;
  dispatch: (action: Action) => void;
  isLoading: boolean;
}

const MarketingContext = createContext<MarketingContextValue | null>(null);

const API_URL = '/api/sales-motion/marketing/state';

export function MarketingProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, createFreshMarketingState());
  const stateRef = useRef(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  stateRef.current = state;

  // ── Save helper ──────────────────────────────────────────────
  const saveToDb = useCallback(async (data: MarketingState) => {
    try {
      await fetch(API_URL, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } catch (e) {
      console.error('[MarketingContext] save failed', e);
    }
  }, []);

  // ── Debounced save ───────────────────────────────────────────
  const scheduleSave = useCallback((data: MarketingState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToDb(data), 1500);
  }, [saveToDb]);

  // ── Wrapped dispatch ─────────────────────────────────────────
  const dispatch = useCallback((action: Action) => {
    rawDispatch(action);
    // After dispatch, the state will update via useEffect below
  }, []);

  // ── Auto-save on state changes ───────────────────────────────
  useEffect(() => {
    if (!loadedRef.current) return;
    scheduleSave(state);
  }, [state, scheduleSave]);

  // ── Load from DB ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data && data.version === 1) {
          rawDispatch({ type: 'SET_FULL_STATE', state: data });
        }
      } catch (e) {
        console.error('[MarketingContext] load failed', e);
      }
      loadedRef.current = true;
      setIsLoading(false);
    })();
  }, []);

  // ── Save on tab close ────────────────────────────────────────
  useEffect(() => {
    const onUnload = () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      try {
        navigator.sendBeacon(API_URL, new Blob([JSON.stringify(stateRef.current)], { type: 'application/json' }));
      } catch { /* best effort */ }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return (
    <MarketingContext.Provider value={{ state, dispatch, isLoading }}>
      {children}
    </MarketingContext.Provider>
  );
}

export function useMarketing() {
  const ctx = useContext(MarketingContext);
  if (!ctx) throw new Error('useMarketing must be used within MarketingProvider');
  return ctx;
}
