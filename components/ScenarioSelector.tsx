"use client";

import React from "react";
import { useForecast } from "@/lib/store/forecast-context";

export default function ScenarioSelector() {
  const { forecast, activeScenarioId, setActiveScenarioId } = useForecast();

  if (!forecast || forecast.scenarios.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Scenario:</span>
      <div className="flex gap-1">
        {forecast.scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveScenarioId(s.id)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeScenarioId === s.id
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={
              activeScenarioId === s.id ? { backgroundColor: s.color } : undefined
            }
          >
            {s.name}
            {s.isBaseline && (
              <span className="ml-1 text-xs opacity-70">(base)</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
