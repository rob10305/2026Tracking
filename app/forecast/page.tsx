"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import SidePanel from "@/components/SidePanel";
import type { RevenueMode } from "@/lib/models/types";
import { useStore } from "@/lib/store/context";

const ForecastGrid = dynamic(() => import("@/components/ForecastGrid"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-gray-400">Loading grid...</div>
  ),
});

export default function ForecastPage() {
  const { isLoaded } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [mode, setMode] = useState<RevenueMode>("net");

  if (!isLoaded) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  return (
    <div className="flex gap-4">
      {/* Main grid area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Forecast Grid — FY2026</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mode:</span>
            <button
              onClick={() => setMode("gross")}
              className={`px-3 py-1 text-sm rounded ${
                mode === "gross"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Gross
            </button>
            <button
              onClick={() => setMode("net")}
              className={`px-3 py-1 text-sm rounded ${
                mode === "net"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Net
            </button>
          </div>
        </div>
        <ForecastGrid onSelectProduct={setSelectedProduct} />
        <p className="text-xs text-gray-400 mt-2">
          Tip: Copy/paste from Excel or Google Sheets. Select cells and
          Ctrl+V to paste multi-cell ranges.
        </p>
      </div>

      {/* Side panel */}
      <div className="w-72 shrink-0 bg-white border border-gray-200 rounded-lg p-4">
        <SidePanel productId={selectedProduct} mode={mode} />
      </div>
    </div>
  );
}
