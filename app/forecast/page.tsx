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
  Lock,
  Unlock,
} from "lucide-react";

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function BuildForecastListPage() {
  const router = useRouter();
  const { state } = useStore();
  const {
    forecasts,
    isLoaded,
    addForecast,
    deleteForecast,
    renameForecast,
    duplicateForecast,
    toggleLock,
  } = useSavedForecasts();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [lockModalId, setLockModalId] = useState<string | null>(null);
  const [lockPassword, setLockPassword] = useState("");
  const [lockError, setLockError] = useState("");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-accent-sky/10 rounded-full border border-accent-sky/30" />
          <div className="h-3 w-24 bg-white/10 rounded" />
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

  const handleLockToggle = (id: string) => {
    setLockModalId(id);
    setLockPassword("");
    setLockError("");
    setMenuOpenId(null);
  };

  const handleLockSubmit = async () => {
    if (!lockModalId) return;
    const fc = forecasts.find((f) => f.id === lockModalId);
    if (!fc) return;
    const result = await toggleLock(lockModalId, !fc.locked, lockPassword);
    if (result.ok) {
      setLockModalId(null);
      setLockPassword("");
      setLockError("");
    } else {
      setLockError(result.error || "Invalid password");
    }
  };

  const VARIANTS: ProductVariant[] = ["small", "medium", "large"];

  const getForecastStats = (fc: SavedForecast) => {
    let totalUnits = 0;
    let grossRevenue = 0;
    let netRevenue = 0;
    let oneTimeRevenue = 0;
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
            oneTimeRevenue += result.gross_components.professional_services;
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
          oneTimeRevenue += result.gross_components.professional_services;
        }
      }
    }

    return {
      totalUnits,
      grossRevenue,
      netRevenue,
      oneTimeRevenue,
      activeProducts: activeProducts.size,
    };
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
    const points = values
      .map((v, i) => `${i * step},${height - (v / max) * height}`)
      .join(" ");
    const hasData = values.some((v) => v > 0);
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
          className="text-accent-sky"
        />
      </svg>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero header — AOP / AI Showcase style */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-sky">
          FY2026
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent-sky/10 border border-accent-sky/30 flex items-center justify-center">
            <BarChart3 size={20} className="text-accent-sky" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Forecast Modelling
          </h1>
        </div>
        <p className="mt-3 text-gray-400 max-w-2xl">
          Create and compare forecast models to plan your revenue targets.
        </p>
      </div>

      {/* New Forecast card — canvas-raised with left-accent rail and corner glow */}
      <div className="relative overflow-hidden bg-canvas-raised border border-white/5 border-l-4 border-l-accent-sky rounded-xl p-6">
        <div
          aria-hidden
          className="absolute -top-12 -right-12 h-40 w-40 rounded-full glow-sky blur-3xl pointer-events-none"
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-sky/10 border border-accent-sky/30 flex items-center justify-center">
              <Plus className="w-5 h-5 text-accent-sky" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-sky">
                New Forecast
              </p>
              <p className="text-sm text-gray-400">Name your model and start planning</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g., Q1 Aggressive, Conservative Plan, Base Case"
              className="flex-1 min-w-[240px] bg-canvas border border-white/10 text-white placeholder-gray-500 rounded-md px-4 py-2.5 focus:outline-none focus:border-accent-sky/50"
            />
            <button
              onClick={handleCreate}
              className="bg-accent-sky text-[#050914] px-5 py-2.5 rounded-md font-semibold hover:brightness-110 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </div>
      </div>

      {forecasts.length === 0 ? (
        <div className="bg-canvas-raised border border-dashed border-white/10 rounded-xl p-16 text-center">
          <div className="w-14 h-14 rounded-xl bg-accent-sky/10 border border-accent-sky/30 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-accent-sky" />
          </div>
          <h3 className="font-semibold text-white text-lg mb-2">No forecasts yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
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
              const accentBorder = fc.locked ? "border-l-accent-amber" : "border-l-accent-sky";

              return (
                <div
                  key={fc.id}
                  className={`group relative overflow-hidden bg-canvas-raised border border-white/5 ${accentBorder} border-l-4 rounded-xl transition-colors hover:bg-canvas-elevated`}
                >
                  <div
                    aria-hidden
                    className={`absolute -top-12 -right-12 h-32 w-32 rounded-full ${
                      fc.locked ? "glow-amber" : "glow-sky"
                    } blur-3xl pointer-events-none opacity-70`}
                  />
                  <div className="relative p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        {editingId === fc.id ? (
                          <div className="flex gap-2 items-center flex-wrap">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameSave();
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                              className="bg-canvas border border-accent-sky/40 text-white rounded-md px-3 py-1.5 text-sm flex-1 focus:outline-none focus:border-accent-sky"
                            />
                            <button
                              onClick={handleRenameSave}
                              className="text-xs bg-accent-sky text-[#050914] font-semibold px-3 py-1.5 rounded-md hover:brightness-110"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs text-gray-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white text-lg truncate">
                              {fc.name}
                            </h3>
                            {fc.locked && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent-amber bg-accent-amber/10 border border-accent-amber/30 px-2 py-0.5 rounded-full">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
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
                          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {menuOpenId === fc.id && (
                          <div className="absolute right-0 top-8 bg-canvas-raised border border-white/10 rounded-md shadow-soft-dark z-20 py-1 min-w-[160px]">
                            <button
                              onClick={() => handleRenameStart(fc.id, fc.name)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Rename
                            </button>
                            <button
                              onClick={() => handleDuplicate(fc.id, fc.name)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" /> Duplicate
                            </button>
                            <button
                              onClick={() => handleLockToggle(fc.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                              {fc.locked ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                              {fc.locked ? "Unlock" : "Lock"}
                            </button>
                            <hr className="my-1 border-white/5" />
                            <button
                              onClick={() => handleDelete(fc.id, fc.name)}
                              className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors ${
                                fc.locked
                                  ? "text-gray-600 cursor-not-allowed"
                                  : "text-accent-rose hover:bg-accent-rose/10"
                              }`}
                              disabled={fc.locked}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stat tiles — dark-aware with accent colors */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      <StatTile
                        icon={<DollarSign className="w-3 h-3" />}
                        label="Gross Revenue"
                        value={stats.grossRevenue > 0 ? fmt(stats.grossRevenue) : "—"}
                        accent="emerald"
                      />
                      <StatTile
                        icon={<DollarSign className="w-3 h-3" />}
                        label="Net Revenue"
                        value={stats.netRevenue > 0 ? fmt(stats.netRevenue) : "—"}
                        accent="emerald"
                      />
                      <StatTile
                        icon={<DollarSign className="w-3 h-3" />}
                        label="One Time (Gross)"
                        value={stats.oneTimeRevenue > 0 ? fmt(stats.oneTimeRevenue) : "—"}
                        accent="amber"
                      />
                      <StatTile
                        icon={<Package className="w-3 h-3" />}
                        label="Won Deals"
                        value={
                          stats.totalUnits > 0 ? stats.totalUnits.toLocaleString() : "—"
                        }
                        accent="sky"
                      />
                      <StatTile
                        icon={<TrendingUp className="w-3 h-3" />}
                        label="Products"
                        value={stats.activeProducts > 0 ? String(stats.activeProducts) : "—"}
                        accent="violet"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>{renderSparkline(sparkline)}</div>
                      <Link
                        href={`/forecast/${fc.id}`}
                        className="inline-flex items-center gap-1.5 bg-accent-sky text-[#050914] px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 transition"
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

      {lockModalId &&
        (() => {
          const targetFc = forecasts.find((f) => f.id === lockModalId);
          const unlocking = !!targetFc?.locked;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-canvas-raised border border-white/10 rounded-xl shadow-soft-dark-lg p-6 w-full max-w-sm mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                      unlocking
                        ? "bg-accent-emerald/10 border-accent-emerald/30"
                        : "bg-accent-amber/10 border-accent-amber/30"
                    }`}
                  >
                    {unlocking ? (
                      <Unlock className="w-5 h-5 text-accent-emerald" />
                    ) : (
                      <Lock className="w-5 h-5 text-accent-amber" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {unlocking ? "Unlock Forecast" : "Lock Forecast"}
                    </h3>
                    <p className="text-xs text-gray-500">{targetFc?.name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {unlocking
                    ? "Enter the password to unlock this forecast for editing."
                    : "Enter the password to lock this forecast and prevent changes."}
                </p>
                <input
                  type="password"
                  value={lockPassword}
                  onChange={(e) => {
                    setLockPassword(e.target.value);
                    setLockError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLockSubmit()}
                  placeholder="Password"
                  autoFocus
                  className="w-full bg-canvas border border-white/10 text-white placeholder-gray-500 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-accent-sky mb-2"
                />
                {lockError && (
                  <p className="text-sm text-accent-rose mb-3">{lockError}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setLockModalId(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-300 bg-white/[0.03] border border-white/10 rounded-md hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLockSubmit}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold text-[#050914] rounded-md transition ${
                      unlocking ? "bg-accent-emerald" : "bg-accent-amber"
                    } hover:brightness-110`}
                  >
                    {unlocking ? "Unlock" : "Lock"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

type Accent = "sky" | "emerald" | "amber" | "violet";

const STAT_ACCENT: Record<Accent, { text: string; border: string }> = {
  sky:     { text: "text-accent-sky",     border: "border-accent-sky/20" },
  emerald: { text: "text-accent-emerald", border: "border-accent-emerald/20" },
  amber:   { text: "text-accent-amber",   border: "border-accent-amber/20" },
  violet:  { text: "text-accent-violet",  border: "border-accent-violet/20" },
};

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: Accent;
}) {
  const a = STAT_ACCENT[accent];
  return (
    <div
      className={`bg-white/[0.02] border ${a.border} rounded-md p-2.5 text-center`}
    >
      <div
        className={`flex items-center justify-center gap-1 mb-1 text-[9px] font-semibold uppercase tracking-[0.15em] ${a.text}`}
      >
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={`font-bold text-sm ${value === "—" ? "text-gray-500" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}
