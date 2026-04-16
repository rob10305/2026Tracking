'use client';

import { createContext, useContext, useReducer, useEffect, useRef, useCallback, useState } from 'react';
import type { Partner, PartnerState } from './types';
import { createFreshPartnerState, normalizePartnerState } from './types';

// ── Actions ──────────────────────────────────────────────────────
type Action =
  | { type: 'SET_FULL_STATE'; state: PartnerState }
  | { type: 'ADD_PARTNER'; partner: Partner }
  | { type: 'UPDATE_PARTNER'; id: string; patch: Partial<Partner> }
  | { type: 'DELETE_PARTNER'; id: string }
  | { type: 'RESET_STATE' };

function reducer(state: PartnerState, action: Action): PartnerState {
  switch (action.type) {
    case 'SET_FULL_STATE':
      return action.state;
    case 'ADD_PARTNER':
      return { ...state, partners: [...state.partners, action.partner] };
    case 'UPDATE_PARTNER':
      return {
        ...state,
        partners: state.partners.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
      };
    case 'DELETE_PARTNER':
      return { ...state, partners: state.partners.filter((p) => p.id !== action.id) };
    case 'RESET_STATE':
      return createFreshPartnerState();
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────
interface PartnerContextValue {
  state: PartnerState;
  dispatch: (action: Action) => void;
  isLoading: boolean;
}

const PartnerContext = createContext<PartnerContextValue | null>(null);

const API_URL = '/api/sales-motion/partners/state';

export function PartnerProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, createFreshPartnerState());
  const stateRef = useRef(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  stateRef.current = state;

  const saveToDb = useCallback(async (data: PartnerState) => {
    try {
      await fetch(API_URL, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    } catch (e) {
      console.error('[PartnerContext] save failed', e);
    }
  }, []);

  const scheduleSave = useCallback((data: PartnerState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToDb(data), 1500);
  }, [saveToDb]);

  const dispatch = useCallback((action: Action) => {
    rawDispatch(action);
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    scheduleSave(state);
  }, [state, scheduleSave]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data && data.version === 1) {
          rawDispatch({ type: 'SET_FULL_STATE', state: normalizePartnerState(data) });
        }
      } catch (e) {
        console.error('[PartnerContext] load failed', e);
      }
      loadedRef.current = true;
      setIsLoading(false);
    })();
  }, []);

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
    <PartnerContext.Provider value={{ state, dispatch, isLoading }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error('usePartner must be used within PartnerProvider');
  return ctx;
}
