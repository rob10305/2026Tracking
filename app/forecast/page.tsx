"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";
import { useStore } from "@/lib/store/context";
import { calcFullRevenue } from "@/lib/calc/revenue";
import { forecastKey, variantForecastKey, MONTHS_2026 } from "@/lib/models/types";
import type { SavedForecast, ProductVariant } from "@/lib/models/types";
import {
  Plus,
  BarChart3,
  TrendingUp,
  Calendar,
  Package,
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  ArrowRight,
  DollarSign,
} from "lucide-react";

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function BuildForecastListPage() {
  const router = useRouter();
  const { state } = useStore();
  const { forecasts, isLoaded, addForecast, deleteForecast, renameForecast, duplicateForecast } =
    useSavedForecasts();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    const name = newName.trim() || `Forecast ${forecasts.length + 1}`;
    const fc = addForecast(name);
    setNewName("");
    router.push(`/forecast/${fc.id}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteForecast(id);
    }
    setMenuOpenId(null);
  };

  const handleRenameStart = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
    setMenuOpenId(null);
  };

  const handleRenameSave = () => {
    if (editingId && editName.trim()) {
      renameForecast(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const handleDuplicate = (id: string, name: string) => {
    duplicateForecast(id, `${name} (Copy)`);
    setMenuOpenId(null);
  };

  const VARIANTS: ProductVariant[] = ["small", "medium", "large"];

  const getForecastStats = (fc: SavedForecast) => {
    let totalUnits = 0;
    let grossRevenue = 0;
    let netRevenue = 0;
    const activeProducts = new Set<string>();

    for (const [key, qty] of Object.entries(fc.quantities)) {
      if (qty > 0) {
        totalUnits += qty;
        const [productId] = key.split("::");
        activeProducts.add(productId);
      }
    }

    for (const p of state.products) {
      if (p.has_variants && p.variants) {
        for (const v of VARIANTS) {
          let variantQty = 0;
          for (const m of MONTHS_2026) {
            variantQty += fc.quantities[variantForecastKey(p.id, v, m)] ?? 0;
          }
          if (variantQty > 0) {
            const variantProduct = { ...p, selected_variant: v };
            const result = calcFullRevenue(variantProduct, state.margins, variantQty);
            grossRevenue += result.gross_revenue;
            netRevenue += result.net_revenue;
          }
        }
      } else {
        let annualQty = 0;
        for (const m of MONTHS_2026) {
          annualQty += fc.quantities[forecastKey(p.id, m)] ?? 0;
        }
        if (annualQty > 0) {
          const result = calcFullRevenue(p, state.margins, annualQty);
          grossRevenue += result.gross_revenue;
          netRevenue += result.net_revenue;
        }
      }
    }

    return { totalUnits, grossRevenue, netRevenue, activeProducts: activeProducts.size };
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getMonthlySparkline = (fc: SavedForecast) => {
    const values: number[] = [];
    for (const m of MONTHS_2026) {
      let monthTotal = 0;
      for (const p of state.products) {
        if (p.has_variants && p.variants) {
          for (const v of VARIANTS) {
            monthTotal += fc.quantities[variantForecastKey(p.id, v, m)] ?? 0;
          }
        } else {
          monthTotal += fc.quantities[forecastKey(p.id, m)] ?? 0;
        }
      }
      values.push(monthTotal);
    }
    return values;
  };

  const renderSparkline = (values: number[]) => {
    const max = Math.max(...values, 1);
    const height = 32;
    const width = 120;
    const step = width / (values.length - 1);
    const points = values.map((v, i) => `${i * step},${height - (v / max) * height}`).join(" ");
    const hasData = values.some(v => v > 0);
    if (!hasData) return null;
    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-400"
        />
      </svg>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Forecast Modelling</h1>
        <p className="text-gray-500 mt-1">
          Create and compare forecast models to plan your revenue targets.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">New Forecast</h2>
            <p className="text-blue-100 text-sm">Name your model and start planning</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="e.g., Q1 Aggressive, Conservative Plan, Base Case"
            className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          />
          <button
            onClick={handleCreate}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {forecasts.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="font-semibold text-gray-700 text-lg mb-2">No forecasts yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Create your first forecast model above to start planning product sales by month.
            Each forecast is independent so you can compare different scenarios.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forecasts
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((fc) => {
              const stats = getForecastStats(fc);
              const sparkline = getMonthlySparkline(fc);

              return (
                <div
                  key={fc.id}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        {editingId === fc.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameSave();
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                              className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={handleRenameSave}
                              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <h3 className="font-semibold text-gray-900 text-lg truncate">{fc.name}</h3>
                        )}
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Updated {formatDate(fc.updatedAt)}
                        </p>
                      </div>

                      <div className="relative ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === fc.id ? null : fc.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {menuOpenId === fc.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 min-w-[160px]">
                            <button
                              onClick={() => handleRenameStart(fc.id, fc.name)}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Rename
                            </button>
                            <button
                              onClick={() => handleDuplicate(fc.id, fc.name)}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" /> Duplicate
                            </button>
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={() => handleDelete(fc.id, fc.name)}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-xs">Gross Revenue</span>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {stats.grossRevenue > 0 ? fmt(stats.grossRevenue) : "--"}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-xs">Net Revenue</span>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {stats.netRevenue > 0 ? fmt(stats.netRevenue) : "--"}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <Package className="w-3 h-3" />
                          <span className="text-xs">Won Deals</span>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {stats.totalUnits > 0 ? stats.totalUnits.toLocaleString() : "--"}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs">Products</span>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {stats.activeProducts > 0 ? stats.activeProducts : "--"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-gray-300">
                        {renderSparkline(sparkline)}
                      </div>
                      <Link
                        href={`/forecast/${fc.id}`}
                        className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Open <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {menuOpenId && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
      )}
    </div>
  );
}
