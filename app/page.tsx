"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ForecastSummary {
  id: string;
  name: string;
  description: string;
  type: string;
  granularity: string;
  updatedAt: string;
  _count: { scenarios: number; timePeriods: number };
}

const TYPE_COLORS: Record<string, string> = {
  financial: "text-blue-600",
  pipeline: "text-green-600",
  timeline: "text-purple-600",
};

export default function DashboardPage() {
  const [forecasts, setForecasts] = useState<ForecastSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/forecasts")
      .then((res) => res.json())
      .then((data) => {
        setForecasts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const recentForecasts = forecasts.slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/forecasts/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Forecast
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">Total Forecasts</div>
          <div className="text-2xl font-bold mt-1">
            {loading ? "..." : forecasts.length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">Total Scenarios</div>
          <div className="text-2xl font-bold mt-1">
            {loading
              ? "..."
              : forecasts.reduce((sum, f) => sum + f._count.scenarios, 0)}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 uppercase">Quick Links</div>
          <div className="flex gap-2 mt-2">
            <Link
              href="/forecasts"
              className="text-sm text-blue-600 hover:underline"
            >
              All Forecasts
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/forecast"
              className="text-sm text-blue-600 hover:underline"
            >
              Legacy Grid
            </Link>
          </div>
        </div>
      </div>

      {/* Recent forecasts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Forecasts</h2>
          <Link
            href="/forecasts"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        ) : recentForecasts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            <p className="mb-2">No forecasts yet.</p>
            <p className="text-sm">
              <Link
                href="/forecasts/new"
                className="text-blue-600 hover:underline"
              >
                Create your first forecast
              </Link>{" "}
              or use the{" "}
              <Link href="/forecast" className="text-blue-600 hover:underline">
                legacy grid
              </Link>{" "}
              for the FY2026 quick view.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentForecasts.map((f) => (
              <Link
                key={f.id}
                href={`/forecasts/${f.id}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow block"
              >
                <div className="font-semibold text-sm">{f.name}</div>
                {f.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {f.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span className={TYPE_COLORS[f.type] ?? ""}>{f.type}</span>
                  <span>{f._count.scenarios} scenarios</span>
                  <span>{f.granularity}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Updated {new Date(f.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
