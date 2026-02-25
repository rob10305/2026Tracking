"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type {
  AppState,
  Product,
  Margins,
  SalesMotion,
  PipelineContribution,
  ForecastMap,
  LaunchRequirement,
} from "@/lib/models/types";
import { forecastKey } from "@/lib/models/types";
import { createSeedData } from "./seed";

interface AppStore {
  state: AppState;
  addProduct: (p: Product, s: SalesMotion) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  updateMargins: (m: Margins) => void;
  updateIndustryAverages: (s: SalesMotion) => void;
  updateItmHistoricalAverages: (s: SalesMotion) => void;
  updatePipelineContribution: (p: PipelineContribution) => void;
  updateSalesMotion: (productId: string, s: SalesMotion) => void;
  setForecastQty: (productId: string, month: string, qty: number) => void;
  setForecastBulk: (entries: { productId: string; month: string; qty: number }[]) => void;
  updateLaunchRequirements: (productId: string, reqs: LaunchRequirement[]) => void;
  resetToSeed: () => void;
  importState: (s: AppState) => void;
  isLoaded: boolean;
}

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(createSeedData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/db/state")
      .then((r) => r.json())
      .then((data: AppState) => {
        setState(data);
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

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
      fetch("/api/db/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: p, salesMotion: s, isNew: true }),
      });
    },
    [update],
  );

  const updateProduct = useCallback(
    (p: Product) => {
      update((prev) => ({
        ...prev,
        products: prev.products.map((x) => (x.id === p.id ? p : x)),
      }));
      fetch("/api/db/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: p, isNew: false }),
      });
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
      fetch("/api/db/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    [update],
  );

  const updateMargins = useCallback(
    (m: Margins) => {
      update((prev) => ({ ...prev, margins: m }));
      fetch("/api/db/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "margins", value: m }),
      });
    },
    [update],
  );

  const updateIndustryAverages = useCallback(
    (s: SalesMotion) => {
      update((prev) => ({ ...prev, industryAverages: s }));
      fetch("/api/db/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "industryAverages", value: s }),
      });
    },
    [update],
  );

  const updateItmHistoricalAverages = useCallback(
    (s: SalesMotion) => {
      update((prev) => ({ ...prev, itmHistoricalAverages: s }));
      fetch("/api/db/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "itmHistoricalAverages", value: s }),
      });
    },
    [update],
  );

  const updatePipelineContribution = useCallback(
    (p: PipelineContribution) => {
      update((prev) => ({ ...prev, pipelineContribution: p }));
      fetch("/api/db/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "pipelineContribution", value: p }),
      });
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
      fetch("/api/db/sales-motion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, salesMotion: s }),
      });
    },
    [update],
  );

  const setForecastQty = useCallback(
    (productId: string, month: string, qty: number) => {
      const q = Math.max(0, Math.round(qty));
      update((prev) => ({
        ...prev,
        forecastByProductIdMonth: {
          ...prev.forecastByProductIdMonth,
          [forecastKey(productId, month)]: q,
        },
      }));
      fetch("/api/db/forecast-entry", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, month, quantity: q }),
      });
    },
    [update],
  );

  const setForecastBulk = useCallback(
    (entries: { productId: string; month: string; qty: number }[]) => {
      update((prev) => {
        const newForecast = { ...prev.forecastByProductIdMonth };
        for (const e of entries) {
          newForecast[forecastKey(e.productId, e.month)] = Math.max(0, Math.round(e.qty));
        }
        return { ...prev, forecastByProductIdMonth: newForecast };
      });
      fetch("/api/db/forecast-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
    },
    [update],
  );

  const updateLaunchRequirements = useCallback(
    (productId: string, reqs: LaunchRequirement[]) => {
      update((prev) => ({
        ...prev,
        launchRequirements: {
          ...prev.launchRequirements,
          [productId]: reqs,
        },
      }));
      fetch("/api/db/launch-requirements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, requirements: reqs }),
      });
    },
    [update],
  );

  const resetToSeed = useCallback(() => {
    const seed = createSeedData();
    setState(seed);
    fetch("/api/db/reset", { method: "POST" });
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
        updateItmHistoricalAverages,
        updatePipelineContribution,
        updateSalesMotion,
        setForecastQty,
        setForecastBulk,
        updateLaunchRequirements,
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
