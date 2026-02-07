import type { SavedForecast, ForecastMap } from "@/lib/models/types";

const STORAGE_KEY = "forecast-app-saved-forecasts";

export function loadForecasts(): SavedForecast[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedForecast[];
  } catch {
    console.error("Failed to load saved forecasts");
    return [];
  }
}

export function saveForecasts(forecasts: SavedForecast[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(forecasts));
  } catch {
    console.error("Failed to save forecasts");
  }
}

export function generateId(): string {
  return `fc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createNewForecast(name: string): SavedForecast {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    quantities: {},
  };
}

export function migrateLegacyForecast(quantities: ForecastMap): SavedForecast {
  const hasData = Object.values(quantities).some((v) => v > 0);
  if (!hasData) return createNewForecast("My First Forecast");
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "Imported Forecast",
    createdAt: now,
    updatedAt: now,
    quantities: { ...quantities },
  };
}
