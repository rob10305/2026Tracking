"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { SavedForecast, ForecastMap, ProductVariant } from "@/lib/models/types";
import { forecastKey, variantForecastKey } from "@/lib/models/types";
import {
  loadForecasts,
  saveForecasts,
  createNewForecast,
} from "./forecast-persistence";

interface SavedForecastsStore {
  forecasts: SavedForecast[];
  isLoaded: boolean;
  addForecast: (name: string) => SavedForecast;
  duplicateForecast: (id: string, newName: string) => SavedForecast | null;
  deleteForecast: (id: string) => void;
  renameForecast: (id: string, name: string) => void;
  getForecast: (id: string) => SavedForecast | undefined;
  setQty: (id: string, productId: string, month: string, qty: number) => void;
  setVariantQty: (id: string, productId: string, variant: ProductVariant, month: string, qty: number) => void;
  setQtyBulk: (id: string, entries: { productId: string; month: string; qty: number }[]) => void;
}

const SavedForecastsContext = createContext<SavedForecastsStore | null>(null);

export function SavedForecastsProvider({ children }: { children: React.ReactNode }) {
  const [forecasts, setForecasts] = useState<SavedForecast[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    const saved = loadForecasts();
    if (saved.length > 0) {
      skipNextSave.current = true;
      setForecasts(saved);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveForecasts(forecasts);
  }, [forecasts, isLoaded]);

  const addForecast = useCallback((name: string) => {
    const fc = createNewForecast(name);
    setForecasts((prev) => {
      const updated = [...prev, fc];
      saveForecasts(updated);
      return updated;
    });
    return fc;
  }, []);

  const duplicateForecast = useCallback((id: string, newName: string) => {
    let newFc: SavedForecast | null = null;
    setForecasts((prev) => {
      const source = prev.find((f) => f.id === id);
      if (!source) return prev;
      const now = new Date().toISOString();
      newFc = {
        id: `fc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: newName,
        createdAt: now,
        updatedAt: now,
        quantities: { ...source.quantities },
      };
      return [...prev, newFc];
    });
    return newFc;
  }, []);

  const deleteForecast = useCallback((id: string) => {
    setForecasts((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const renameForecast = useCallback((id: string, name: string) => {
    setForecasts((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, name, updatedAt: new Date().toISOString() } : f
      )
    );
  }, []);

  const getForecast = useCallback(
    (id: string) => forecasts.find((f) => f.id === id),
    [forecasts]
  );

  const setQty = useCallback(
    (id: string, productId: string, month: string, qty: number) => {
      setForecasts((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          return {
            ...f,
            updatedAt: new Date().toISOString(),
            quantities: {
              ...f.quantities,
              [forecastKey(productId, month)]: Math.max(0, Math.round(qty)),
            },
          };
        })
      );
    },
    []
  );

  const setVariantQty = useCallback(
    (id: string, productId: string, variant: ProductVariant, month: string, qty: number) => {
      setForecasts((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          return {
            ...f,
            updatedAt: new Date().toISOString(),
            quantities: {
              ...f.quantities,
              [variantForecastKey(productId, variant, month)]: Math.max(0, Math.round(qty)),
            },
          };
        })
      );
    },
    []
  );

  const setQtyBulk = useCallback(
    (id: string, entries: { productId: string; month: string; qty: number }[]) => {
      setForecasts((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const newQ = { ...f.quantities };
          for (const e of entries) {
            newQ[forecastKey(e.productId, e.month)] = Math.max(0, Math.round(e.qty));
          }
          return { ...f, updatedAt: new Date().toISOString(), quantities: newQ };
        })
      );
    },
    []
  );

  return (
    <SavedForecastsContext.Provider
      value={{
        forecasts,
        isLoaded,
        addForecast,
        duplicateForecast,
        deleteForecast,
        renameForecast,
        getForecast,
        setQty,
        setVariantQty,
        setQtyBulk,
      }}
    >
      {children}
    </SavedForecastsContext.Provider>
  );
}

export function useSavedForecasts(): SavedForecastsStore {
  const ctx = useContext(SavedForecastsContext);
  if (!ctx) throw new Error("useSavedForecasts must be used within SavedForecastsProvider");
  return ctx;
}
