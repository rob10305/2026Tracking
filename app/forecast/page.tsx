"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";

export default function BuildForecastListPage() {
  const router = useRouter();
  const { forecasts, isLoaded, addForecast, deleteForecast, renameForecast, duplicateForecast } =
    useSavedForecasts();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (!isLoaded) {
    return <div className="p-8 text-gray-400">Loading...</div>;
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
  };

  const handleRenameStart = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
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
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const countProducts = (quantities: Record<string, number>) => {
    const products = new Set<string>();
    for (const key of Object.keys(quantities)) {
      const [productId] = key.split("::");
      if (quantities[key] > 0) products.add(productId);
    }
    return products.size;
  };

  const totalUnits = (quantities: Record<string, number>) => {
    return Object.values(quantities).reduce((sum, v) => sum + v, 0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Build Forecast</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create forecast models to plan product sales by month and see the
            resulting revenue, pipeline requirements, and contribution breakdown.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-3">Create New Forecast</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Forecast name (e.g., Q1 Aggressive, Conservative Plan)"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Create
          </button>
        </div>
      </div>

      {forecasts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-2 text-4xl">📊</div>
          <h3 className="font-semibold text-gray-700 mb-1">No forecasts yet</h3>
          <p className="text-sm text-gray-500">
            Create your first forecast to start planning product sales by month.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {forecasts
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((fc) => (
              <div
                key={fc.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === fc.id ? (
                      <div className="flex gap-2 items-center mb-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameSave();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="border border-gray-300 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleRenameSave}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
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
                      <Link
                        href={`/forecast/${fc.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {fc.name}
                      </Link>
                    )}
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>{countProducts(fc.quantities)} products</span>
                      <span>{totalUnits(fc.quantities)} total units</span>
                      <span>Updated {formatDate(fc.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4 shrink-0">
                    <Link
                      href={`/forecast/${fc.id}`}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => handleRenameStart(fc.id, fc.name)}
                      className="text-xs text-gray-500 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDuplicate(fc.id, fc.name)}
                      className="text-xs text-gray-500 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(fc.id, fc.name)}
                      className="text-xs text-red-500 px-2 py-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
