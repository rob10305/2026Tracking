"use client";

import React, { useState, useEffect } from "react";
import { useForecast } from "@/lib/store/forecast-context";

const GRANULARITIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "weekly", label: "Weekly" },
];

const FORECAST_TYPES = [
  { value: "financial", label: "Financial" },
  { value: "pipeline", label: "Sales Pipeline" },
  { value: "timeline", label: "Project Timeline" },
];

export default function ForecastSettingsPage() {
  const { forecast, refreshForecast } = useForecast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("financial");
  const [granularity, setGranularity] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (forecast) {
      setName(forecast.name);
      setDescription(forecast.description);
      setType(forecast.type);
      setGranularity(forecast.granularity);
      setStartDate(forecast.startDate);
      setEndDate(forecast.endDate);
    }
  }, [forecast]);

  if (!forecast) return <div className="text-gray-400">Loading...</div>;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/forecasts/${forecast.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, type }),
    });
    await refreshForecast();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRegenerateTimePeriods = async () => {
    if (
      !confirm(
        "Regenerating time periods will delete existing line items. Continue?",
      )
    )
      return;

    setSaving(true);
    await fetch(`/api/forecasts/${forecast.id}/time-periods`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, endDate, granularity }),
    });
    await refreshForecast();
    setSaving(false);
  };

  return (
    <div className="max-w-xl space-y-6">
      {/* Basic info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <h2 className="font-semibold text-sm">Forecast Details</h2>

        <label className="block text-sm">
          <span className="font-medium text-gray-700">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-gray-700">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-gray-700">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {FORECAST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-sm text-green-600 py-2">Saved</span>}
        </div>
      </div>

      {/* Time period configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <h2 className="font-semibold text-sm">Time Periods</h2>
        <p className="text-xs text-gray-500">
          Currently: {forecast.timePeriods.length} periods ({forecast.granularity})
        </p>

        <div className="grid grid-cols-3 gap-3">
          <label className="text-sm">
            <span className="font-medium text-gray-700">Granularity</span>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {GRANULARITIES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-gray-700">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-gray-700">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </label>
        </div>

        <button
          onClick={handleRegenerateTimePeriods}
          disabled={saving}
          className="px-4 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
        >
          Regenerate Time Periods
        </button>
        <p className="text-xs text-red-500">
          Warning: Regenerating time periods will delete all line item data.
        </p>
      </div>

      {/* Current time periods list */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-2">Current Periods</h2>
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-1">#</th>
                <th className="text-left py-1">Label</th>
                <th className="text-left py-1">Start</th>
                <th className="text-left py-1">End</th>
              </tr>
            </thead>
            <tbody>
              {forecast.timePeriods.map((tp, i) => (
                <tr key={tp.id} className="border-b border-gray-50">
                  <td className="py-1 text-gray-400">{i + 1}</td>
                  <td className="py-1">{tp.label}</td>
                  <td className="py-1 text-gray-500">{tp.startDate}</td>
                  <td className="py-1 text-gray-500">{tp.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
