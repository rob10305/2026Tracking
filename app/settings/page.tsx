"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/store/context";
import {
  exportStateAsJSON,
  importStateFromJSON,
  downloadCSV,
} from "@/lib/store/persistence";
import { exportForecastCSV, exportSummaryCSV, exportWorkbackCSV } from "@/lib/calc/csv";

const SUB_PAGES = [
  {
    href: "/settings/products",
    title: "Products",
    description: "Configure your product catalog, pricing, and revenue component mix.",
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50",
  },
  {
    href: "/settings/margins",
    title: "Margins",
    description: "Set historic margin percentages for each revenue component.",
    icon: (
      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    color: "border-green-200 hover:border-green-400 hover:bg-green-50",
  },
  {
    href: "/settings/industry-averages",
    title: "Opportunity Impact Factors",
    description: "Set default industry average values for sales motion parameters.",
    icon: (
      <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    color: "border-orange-200 hover:border-orange-400 hover:bg-orange-50",
  },
  {
    href: "/settings/launch",
    title: "Product Launch",
    description: "Manage launch activities per product across all 5 pillars. Add custom activities to tailor each launch plan.",
    icon: (
      <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    color: "border-rose-200 hover:border-rose-400 hover:bg-rose-50",
  },
  {
    href: "/settings/dependencies",
    title: "Dependency Map",
    description: "Visualize dependency chains and blockers across all product launch activities.",
    icon: (
      <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.928-3.374a4.5 4.5 0 00-6.364-6.364L4.5 7.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    color: "border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50",
  },
  {
    href: "/settings/gtm",
    title: "GTM Readiness",
    description: "Go-to-market workback analysis — pipeline requirements, timing, and launch dependencies.",
    icon: (
      <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    color: "border-purple-200 hover:border-purple-400 hover:bg-purple-50",
  },
  {
    href: "/settings/contribution",
    title: "Contributor Access",
    description: "Manage contributor page locks, reset passwords, and edit attainment records as admin.",
    icon: (
      <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
  },
];

export default function SettingsPage() {
  const { state, resetToSeed, importState } = useStore();

  const handleImportJSON = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const imported = await importStateFromJSON(file);
        importState(imported);
      } catch (err) {
        alert("Import failed: " + (err as Error).message);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">
          Configure your products, margins, and sales motions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {SUB_PAGES.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`bg-white border-2 rounded-xl p-6 transition-all block ${card.color}`}
          >
            <div className="mb-4">{card.icon}</div>
            <h2 className="font-bold text-lg mb-2">{card.title}</h2>
            <p className="text-sm text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>

      <SyncFromProduction />

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h2 className="font-semibold text-base">Import / Export</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportStateAsJSON(state)}
            className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Export JSON (Full State)
          </button>
          <button
            onClick={handleImportJSON}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Import JSON
          </button>
          <button
            onClick={() =>
              downloadCSV(exportForecastCSV(state), "forecast-quantities.csv")
            }
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            CSV: Forecast Quantities
          </button>
          <button
            onClick={() =>
              downloadCSV(exportSummaryCSV(state), "financial-summary.csv")
            }
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            CSV: Financial Summary
          </button>
          <button
            onClick={() =>
              downloadCSV(exportWorkbackCSV(state), "workback-plan.csv")
            }
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            CSV: Workback Plan
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="font-semibold text-base mb-3">Data Management</h2>
        <button
          onClick={resetToSeed}
          className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Reset to Seed Data
        </button>
      </div>
    </div>
  );
}

function SyncFromProduction() {
  const [url, setUrl] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const handleSync = async () => {
    if (!url.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      const sourceUrl = url.replace(/\/$/, "");
      const resp = await fetch(`${sourceUrl}/api/db/saved-forecasts`);
      if (!resp.ok) throw new Error(`Source returned ${resp.status}`);
      const forecasts = await resp.json();

      const syncResp = await fetch("/api/db/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forecasts }),
      });
      if (!syncResp.ok) {
        const err = await syncResp.json();
        throw new Error(err.error || "Sync failed");
      }
      const result = await syncResp.json();
      setStatus("success");
      setMessage(`Synced ${result.synced} forecast(s). Reload the page to see changes.`);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
      <h2 className="font-semibold text-base">Sync Forecasts from Production</h2>
      <p className="text-sm text-gray-500">
        Pull saved forecast data (including quantities) from your production deployment into this environment.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-app.replit.app"
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSync}
          disabled={status === "loading" || !url.trim()}
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "loading" ? "Syncing..." : "Sync"}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
