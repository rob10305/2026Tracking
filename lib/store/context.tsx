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
  PipelineContribution,
  ForecastMap,
} from "@/lib/models/types";
import { forecastKey } from "@/lib/models/types";
import { saveState, loadState, clearState } from "./persistence";
import { createSeedData } from "./seed";

interface AppStore {
  state: AppState;
  // Product CRUD
  addProduct: (p: Product, s: SalesMotion) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  // Margins
  updateMargins: (m: Margins) => void;
  // Industry Averages
  updateIndustryAverages: (s: SalesMotion) => void;
  // Pipeline Contribution
  updatePipelineContribution: (p: PipelineContribution) => void;
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
      if (!saved.margins) {
        saved.margins = {
          professional_services_margin_pct: 45,
          software_resale_margin_pct: 20,
          cloud_consumption_margin_pct: 30,
          epss_margin_pct: 55,
        };
      }
      if (!saved.industryAverages) {
        saved.industryAverages = {
          sales_cycle_months: 3,
          opp_to_close_win_rate_pct: 20,
          prospect_to_opp_rate_pct: 15,
          prospecting_lead_time_months: 1,
        };
      }
      if (!saved.pipelineContribution) {
        saved.pipelineContribution = {
          mode: "pct",
          website_inbound: 30,
          sales_team_generated: 35,
          event_sourced: 20,
          abm_thought_leadership: 15,
        };
      }
      for (const p of saved.products) {
        if (!p.status) {
          p.status = "live";
        }
      }
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
    (p: Product, s: SalesMotion) => {
      update((prev) => ({
        ...prev,
        products: [...prev.products, p],
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
        const { [id]: _s, ...restSales } = prev.salesMotionByProductId;
        return {
          ...prev,
          products: prev.products.filter((x) => x.id !== id),
          salesMotionByProductId: restSales,
          forecastByProductIdMonth: newForecast,
        };
      });
    },
    [update],
  );

  const updateMargins = useCallback(
    (m: Margins) => {
      update((prev) => ({
        ...prev,
        margins: m,
      }));
    },
    [update],
  );

  const updateIndustryAverages = useCallback(
    (s: SalesMotion) => {
      update((prev) => ({
        ...prev,
        industryAverages: s,
      }));
    },
    [update],
  );

  const updatePipelineContribution = useCallback(
    (p: PipelineContribution) => {
      update((prev) => ({
        ...prev,
        pipelineContribution: p,
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
        updateIndustryAverages,
        updatePipelineContribution,
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
