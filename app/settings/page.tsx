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
    href: "/settings/goals",
    title: "Goals Editor",
    description: "Edit monthly goal targets for each contributor across all metrics.",
    icon: (
      <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    color: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50",
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
  {
    href: "/settings/marketing",
    title: "Marketing",
    description: "Configure the OneDrive embed URL for the Marketing Content library and other marketing integrations.",
    icon: (
      <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m16.5 0a48.667 48.667 0 00-16.5 0m16.5 0a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25M8.25 11.25h7.5" />
      </svg>
    ),
    color: "border-teal-200 hover:border-teal-400 hover:bg-teal-50",
  },
  {
    href: "/settings/pipeline",
    title: "Pipeline Views",
    description: "Pick which Salesforce reports appear as selectable views on Pipeline → Overview.",
    icon: (
      <svg className="w-8 h-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: "border-sky-200 hover:border-sky-400 hover:bg-sky-50",
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

