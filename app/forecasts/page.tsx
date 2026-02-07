"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ForecastList from "@/components/ForecastList";

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/forecasts");
    const data = await res.json();
    setForecasts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/forecasts/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Forecasts</h1>
        <Link
          href="/forecasts/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Forecast
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-400 py-8 text-center">Loading...</div>
      ) : (
        <ForecastList forecasts={forecasts} onDelete={handleDelete} />
      )}
    </div>
  );
}
