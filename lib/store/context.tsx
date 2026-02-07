"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type {
  AppState,
  Product,
  Margins,
  SalesMotion,
  ForecastMap,
} from "@/lib/models/types";
import { forecastKey } from "@/lib/models/types";
import { saveState, loadState, clearState } from "./persistence";
import { createSeedData } from "./seed";

interface AppStore {
  state: AppState;
  // Product CRUD
  addProduct: (p: Product, m: Margins, s: SalesMotion) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  // Margins
  updateMargins: (productId: string, m: Margins) => void;
  // Sales Motion
  updateSalesMotion: (productId: string, s: SalesMotion) => void;
  // Forecast
  setForecastQty: (productId: string, month: string, qty: number) => void;
  setForecastBulk: (entries: { productId: string; month: string; qty: number }[]) => void;
  // State management
  resetToSeed: () => void;
  importState: (s: AppState) => void;
  isLoaded: boolean;
}

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(createSeedData);
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSave = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      skipNextSave.current = true;
      setState(saved);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save on every change
  useEffect(() => {
    if (!isLoaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState(state);
  }, [state, isLoaded]);

  const update = useCallback((fn: (prev: AppState) => AppState) => {
    setState(fn);
  }, []);

  const addProduct = useCallback(
    (p: Product, m: Margins, s: SalesMotion) => {
      update((prev) => ({
        ...prev,
        products: [...prev.products, p],
        marginsByProductId: { ...prev.marginsByProductId, [p.id]: m },
        salesMotionByProductId: { ...prev.salesMotionByProductId, [p.id]: s },
      }));
    },
    [update],
  );

  const updateProduct = useCallback(
    (p: Product) => {
      update((prev) => ({
        ...prev,
        products: prev.products.map((x) => (x.id === p.id ? p : x)),
      }));
    },
    [update],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      update((prev) => {
        const newForecast: ForecastMap = {};
        for (const [k, v] of Object.entries(prev.forecastByProductIdMonth)) {
          if (!k.startsWith(id + "::")) {
            newForecast[k] = v;
          }
        }
        const { [id]: _m, ...restMargins } = prev.marginsByProductId;
        const { [id]: _s, ...restSales } = prev.salesMotionByProductId;
        return {
          ...prev,
          products: prev.products.filter((x) => x.id !== id),
          marginsByProductId: restMargins,
          salesMotionByProductId: restSales,
          forecastByProductIdMonth: newForecast,
        };
      });
    },
    [update],
  );

  const updateMargins = useCallback(
    (productId: string, m: Margins) => {
      update((prev) => ({
        ...prev,
        marginsByProductId: { ...prev.marginsByProductId, [productId]: m },
      }));
    },
    [update],
  );

  const updateSalesMotion = useCallback(
    (productId: string, s: SalesMotion) => {
      update((prev) => ({
        ...prev,
        salesMotionByProductId: {
          ...prev.salesMotionByProductId,
          [productId]: s,
        },
      }));
    },
    [update],
  );

  const setForecastQty = useCallback(
    (productId: string, month: string, qty: number) => {
      update((prev) => ({
        ...prev,
        forecastByProductIdMonth: {
          ...prev.forecastByProductIdMonth,
          [forecastKey(productId, month)]: Math.max(0, Math.round(qty)),
        },
      }));
    },
    [update],
  );

  const setForecastBulk = useCallback(
    (entries: { productId: string; month: string; qty: number }[]) => {
      update((prev) => {
        const newForecast = { ...prev.forecastByProductIdMonth };
        for (const e of entries) {
          newForecast[forecastKey(e.productId, e.month)] = Math.max(
            0,
            Math.round(e.qty),
          );
        }
        return { ...prev, forecastByProductIdMonth: newForecast };
      });
    },
    [update],
  );

  const resetToSeed = useCallback(() => {
    clearState();
    const seed = createSeedData();
    skipNextSave.current = false;
    setState(seed);
  }, []);

  const importState = useCallback((s: AppState) => {
    setState(s);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        state,
        addProduct,
        updateProduct,
        deleteProduct,
        updateMargins,
        updateSalesMotion,
        setForecastQty,
        setForecastBulk,
        resetToSeed,
        importState,
        isLoaded,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
