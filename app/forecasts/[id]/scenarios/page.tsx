"use client";

import React, { useState } from "react";
import { useForecast } from "@/lib/store/forecast-context";
import ScenarioComparison from "@/components/ScenarioComparison";

export default function ScenariosPage() {
  const { forecast, refreshForecast } = useForecast();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [cloneFromId, setCloneFromId] = useState("");
  const [creating, setCreating] = useState(false);

  if (!forecast) return <div className="text-gray-400">Loading...</div>;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await fetch(`/api/forecasts/${forecast.id}/scenarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        color: newColor,
        cloneFromId: cloneFromId || undefined,
      }),
    });
    setNewName("");
    setCloneFromId("");
    await refreshForecast();
    setCreating(false);
  };

  const handleDelete = async (scenarioId: string) => {
    if (!confirm("Delete this scenario? All its data will be lost.")) return;
    await fetch(`/api/forecasts/${forecast.id}/scenarios/${scenarioId}`, {
      method: "DELETE",
    });
    await refreshForecast();
  };

  const handleRename = async (scenarioId: string, name: string) => {
    await fetch(`/api/forecasts/${forecast.id}/scenarios/${scenarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await refreshForecast();
  };

  const handleRecolor = async (scenarioId: string, color: string) => {
    await fetch(`/api/forecasts/${forecast.id}/scenarios/${scenarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color }),
    });
    await refreshForecast();
  };

  return (
    <div className="space-y-6">
      {/* Scenario list */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-3">Scenarios</h2>
        <div className="space-y-2">
          {forecast.scenarios.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded"
            >
              <input
                type="color"
                value={s.color}
                onChange={(e) => handleRecolor(s.id, e.target.value)}
                className="w-6 h-6 rounded border-0 cursor-pointer"
              />
              <input
                type="text"
                defaultValue={s.name}
                onBlur={(e) => {
                  if (e.target.value !== s.name) handleRename(s.id, e.target.value);
                }}
                className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none text-sm px-1 py-0.5"
              />
              {s.isBaseline && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  Baseline
                </span>
              )}
              {!s.isBaseline && (
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create new scenario */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-3">Add Scenario</h2>
        <div className="flex items-end gap-3">
          <label className="text-sm flex-1">
            <span className="text-gray-600">Name</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Optimistic"
              className="mt-0.5 w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Color</span>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="mt-0.5 block w-10 h-8 rounded border border-gray-300 cursor-pointer"
            />
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Clone from</span>
            <select
              value={cloneFromId}
              onChange={(e) => setCloneFromId(e.target.value)}
              className="mt-0.5 block border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">Empty</option>
              {forecast.scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* Comparison view */}
      {forecast.scenarios.length > 1 && <ScenarioComparison />}
    </div>
  );
}
