"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface TimePeriod {
  id: string;
  forecastId: string;
  label: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

interface Scenario {
  id: string;
  forecastId: string;
  name: string;
  color: string;
  isBaseline: boolean;
  sortOrder: number;
}

interface LineItem {
  id: string;
  scenarioId: string;
  timePeriodId: string;
  category: string;
  subcategory: string;
  value: number;
  metadata: string;
}

interface ForecastDetail {
  id: string;
  name: string;
  description: string;
  type: string;
  granularity: string;
  startDate: string;
  endDate: string;
  config: string;
  scenarios: Scenario[];
  timePeriods: TimePeriod[];
}

interface ForecastStore {
  forecast: ForecastDetail | null;
  activeScenarioId: string | null;
  lineItems: LineItem[];
  isLoading: boolean;
  error: string | null;
  setActiveScenarioId: (id: string) => void;
  refreshForecast: () => Promise<void>;
  refreshLineItems: () => Promise<void>;
  updateLineItems: (
    items: Array<{
      timePeriodId: string;
      category: string;
      subcategory?: string;
      value: number;
      metadata?: Record<string, unknown>;
    }>,
  ) => Promise<void>;
}

const ForecastContext = createContext<ForecastStore | null>(null);

export function ForecastProvider({
  forecastId,
  children,
}: {
  forecastId: string;
  children: React.ReactNode;
}) {
  const [forecast, setForecast] = useState<ForecastDetail | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshForecast = useCallback(async () => {
    try {
      const res = await fetch(`/api/forecasts/${forecastId}`);
      if (!res.ok) throw new Error("Failed to load forecast");
      const data = await res.json();
      setForecast(data);
      // Default to baseline scenario
      if (!activeScenarioId && data.scenarios.length > 0) {
        const baseline = data.scenarios.find((s: Scenario) => s.isBaseline);
        setActiveScenarioId(baseline?.id ?? data.scenarios[0].id);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [forecastId, activeScenarioId]);

  const refreshLineItems = useCallback(async () => {
    if (!activeScenarioId) return;
    try {
      const res = await fetch(
        `/api/forecasts/${forecastId}/scenarios/${activeScenarioId}/line-items`,
      );
      if (!res.ok) throw new Error("Failed to load line items");
      const data = await res.json();
      setLineItems(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [forecastId, activeScenarioId]);

  const updateLineItems = useCallback(
    async (
      items: Array<{
        timePeriodId: string;
        category: string;
        subcategory?: string;
        value: number;
        metadata?: Record<string, unknown>;
      }>,
    ) => {
      if (!activeScenarioId) return;
      try {
        const res = await fetch(
          `/api/forecasts/${forecastId}/scenarios/${activeScenarioId}/line-items`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
          },
        );
        if (!res.ok) throw new Error("Failed to update line items");
        await refreshLineItems();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [forecastId, activeScenarioId, refreshLineItems],
  );

  // Load forecast on mount
  useEffect(() => {
    setIsLoading(true);
    refreshForecast().finally(() => setIsLoading(false));
  }, [refreshForecast]);

  // Load line items when active scenario changes
  useEffect(() => {
    if (activeScenarioId) {
      refreshLineItems();
    }
  }, [activeScenarioId, refreshLineItems]);

  return (
    <ForecastContext.Provider
      value={{
        forecast,
        activeScenarioId,
        lineItems,
        isLoading,
        error,
        setActiveScenarioId,
        refreshForecast,
        refreshLineItems,
        updateLineItems,
      }}
    >
      {children}
    </ForecastContext.Provider>
  );
}

export function useForecast(): ForecastStore {
  const ctx = useContext(ForecastContext);
  if (!ctx) throw new Error("useForecast must be used within ForecastProvider");
  return ctx;
}
