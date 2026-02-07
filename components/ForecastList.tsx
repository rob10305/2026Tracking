"use client";

import React from "react";
import Link from "next/link";

interface ForecastSummary {
  id: string;
  name: string;
  description: string;
  type: string;
  granularity: string;
  startDate: string;
  endDate: string;
  updatedAt: string;
  _count: { scenarios: number; timePeriods: number };
}

const TYPE_BADGES: Record<string, { bg: string; text: string }> = {
  financial: { bg: "bg-blue-100", text: "text-blue-700" },
  pipeline: { bg: "bg-green-100", text: "text-green-700" },
  timeline: { bg: "bg-purple-100", text: "text-purple-700" },
};

export default function ForecastList({
  forecasts,
  onDelete,
}: {
  forecasts: ForecastSummary[];
  onDelete: (id: string) => void;
}) {
  if (forecasts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No forecasts yet</p>
        <p className="text-sm">
          Create your first forecast to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {forecasts.map((f) => {
        const badge = TYPE_BADGES[f.type] ?? TYPE_BADGES.financial;
        return (
          <div
            key={f.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <Link
                href={`/forecasts/${f.id}`}
                className="font-semibold text-base hover:text-blue-600 transition-colors"
              >
                {f.name}
              </Link>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${badge.bg} ${badge.text}`}
              >
                {f.type}
              </span>
            </div>
            {f.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {f.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{f.granularity}</span>
              <span>{f._count.scenarios} scenario{f._count.scenarios !== 1 ? "s" : ""}</span>
              <span>{f._count.timePeriods} periods</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Updated {new Date(f.updatedAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => {
                  if (confirm(`Delete "${f.name}"?`)) onDelete(f.id);
                }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
