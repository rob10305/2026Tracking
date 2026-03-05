"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { SavedForecast, ProductVariant } from "@/lib/models/types";
import { forecastKey, variantForecastKey } from "@/lib/models/types";

function generateId(): string {
  return `fc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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
  toggleLock: (id: string, locked: boolean, password: string) => Promise<{ ok: boolean; error?: string }>;
}

const SavedForecastsContext = createContext<SavedForecastsStore | null>(null);

export function SavedForecastsProvider({ children }: { children: React.ReactNode }) {
  const [forecasts, setForecasts] = useState<SavedForecast[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/db/saved-forecasts")
      .then((r) => r.json())
      .then((data: SavedForecast[]) => {
        setForecasts(data);
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

  const addForecast = useCallback((name: string) => {
    const now = new Date().toISOString();
    const fc: SavedForecast = {
      id: generateId(),
      name,
      locked: false,
      createdAt: now,
      updatedAt: now,
      quantities: {},
    };
    setForecasts((prev) => [...prev, fc]);
    fetch("/api/db/saved-forecasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fc.id, name: fc.name }),
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
        id: generateId(),
        name: newName,
        locked: false,
        createdAt: now,
        updatedAt: now,
        quantities: { ...source.quantities },
      };
      fetch("/api/db/saved-forecasts/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: id, newId: newFc!.id, newName }),
      });
      return [...prev, newFc!];
    });
    return newFc;
  }, []);

  const deleteForecast = useCallback((id: string) => {
    setForecasts((prev) => prev.filter((f) => f.id !== id));
    fetch("/api/db/saved-forecasts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, []);

  const renameForecast = useCallback((id: string, name: string) => {
    setForecasts((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, name, updatedAt: new Date().toISOString() } : f
      )
    );
    fetch("/api/db/saved-forecasts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
  }, []);

  const getForecast = useCallback(
    (id: string) => forecasts.find((f) => f.id === id),
    [forecasts]
  );

  const setQty = useCallback(
    (id: string, productId: string, month: string, qty: number) => {
      const q = Math.max(0, Math.round(qty));
      const key = forecastKey(productId, month);
      setForecasts((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          return {
            ...f,
            updatedAt: new Date().toISOString(),
            quantities: { ...f.quantities, [key]: q },
          };
        })
      );
      fetch("/api/db/saved-forecasts/quantity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forecastId: id, key, quantity: q }),
      });
    },
    []
  );

  const setVariantQty = useCallback(
    (id: string, productId: string, variant: ProductVariant, month: string, qty: number) => {
      const q = Math.max(0, Math.round(qty));
      const key = variantForecastKey(productId, variant, month);
      setForecasts((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          return {
            ...f,
            updatedAt: new Date().toISOString(),
            quantities: { ...f.quantities, [key]: q },
          };
        })
      );
      fetch("/api/db/saved-forecasts/quantity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forecastId: id, key, quantity: q }),
      });
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
      for (const e of entries) {
        const key = forecastKey(e.productId, e.month);
        fetch("/api/db/saved-forecasts/quantity", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ forecastId: id, key, quantity: Math.max(0, Math.round(e.qty)) }),
        });
      }
    },
    []
  );

  const toggleLock = useCallback(
    async (id: string, locked: boolean, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/db/saved-forecasts/lock", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, locked, password }),
        });
        if (!res.ok) {
          const data = await res.json();
          return { ok: false, error: data.error || "Failed to update lock" };
        }
        setForecasts((prev) =>
          prev.map((f) => (f.id === id ? { ...f, locked } : f))
        );
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error" };
      }
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
        toggleLock,
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
