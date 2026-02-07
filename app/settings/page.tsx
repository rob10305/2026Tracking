"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/context";
import type { Product, Margins, SalesMotion } from "@/lib/models/types";
import {
  exportStateAsJSON,
  importStateFromJSON,
  downloadCSV,
} from "@/lib/store/persistence";
import { exportForecastCSV, exportSummaryCSV, exportWorkbackCSV } from "@/lib/calc/csv";

function generateId(): string {
  return "prod-" + Math.random().toString(36).slice(2, 10);
}

const DEFAULT_MARGINS: Margins = {
  professional_services_margin_pct: 45,
  software_resale_margin_pct: 20,
  cloud_consumption_margin_pct: 30,
  epss_margin_pct: 50,
};

const DEFAULT_SALES_MOTION: SalesMotion = {
  sales_cycle_months: 3,
  buffer_months: 1,
  opp_to_close_win_rate_pct: 25,
  prospect_to_opp_rate_pct: 15,
  prospecting_lead_time_months: 1,
};

function NumberInput({
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step ?? 1}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
        {suffix && <span className="text-gray-400 text-xs">{suffix}</span>}
      </div>
    </label>
  );
}

function ProductEditor({
  product,
  margins,
  salesMotion,
  onSaveProduct,
  onSaveMargins,
  onSaveSalesMotion,
  onDelete,
}: {
  product: Product;
  margins: Margins;
  salesMotion: SalesMotion;
  onSaveProduct: (p: Product) => void;
  onSaveMargins: (m: Margins) => void;
  onSaveSalesMotion: (s: SalesMotion) => void;
  onDelete: () => void;
}) {
  const [p, setP] = useState<Product>({ ...product });
  const [m, setM] = useState<Margins>({ ...margins });
  const [s, setS] = useState<SalesMotion>({ ...salesMotion });
  const [dirty, setDirty] = useState(false);

  const componentSum =
    p.professional_services_pct +
    p.software_resale_pct +
    p.cloud_consumption_pct +
    p.epss_pct;
  const validMix = Math.abs(componentSum - 100) < 0.01;

  const updateP = (patch: Partial<Product>) => {
    setP((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };
  const updateM = (patch: Partial<Margins>) => {
    setM((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };
  const updateS = (patch: Partial<SalesMotion>) => {
    setS((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = () => {
    if (!validMix) return;
    onSaveProduct(p);
    onSaveMargins(m);
    onSaveSalesMotion(s);
    setDirty(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base">{p.name || "New Product"}</h3>
        <div className="flex gap-2">
          {dirty && (
            <button
              onClick={save}
              disabled={!validMix}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm col-span-2">
          <span className="text-gray-600">Name</span>
          <input
            type="text"
            value={p.name}
            onChange={(e) => updateP({ name: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-0.5"
          />
        </label>
        <label className="block text-sm col-span-2">
          <span className="text-gray-600">Description</span>
          <input
            type="text"
            value={p.description}
            onChange={(e) => updateP({ description: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-0.5"
          />
        </label>
        <NumberInput
          label="Gross Unit Price"
          value={p.gross_unit_price}
          onChange={(v) => updateP({ gross_unit_price: v })}
          suffix="$"
          min={0}
        />
        <NumberInput
          label="Default Discount"
          value={p.default_discount_pct}
          onChange={(v) => updateP({ default_discount_pct: v })}
          suffix="%"
          min={0}
          max={100}
        />
      </div>

      {/* Component Mix */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">
            Revenue Component Mix
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              validMix
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Sum: {componentSum.toFixed(1)}%{" "}
            {validMix ? "OK" : "(must = 100%)"}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <NumberInput
            label="Prof. Services"
            value={p.professional_services_pct}
            onChange={(v) => updateP({ professional_services_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="Software Resale"
            value={p.software_resale_pct}
            onChange={(v) => updateP({ software_resale_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="Cloud Consumption"
            value={p.cloud_consumption_pct}
            onChange={(v) => updateP({ cloud_consumption_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="EPSS"
            value={p.epss_pct}
            onChange={(v) => updateP({ epss_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Historic Margins */}
      <div>
        <span className="text-sm font-medium text-gray-700 block mb-2">
          Historic Margins (2025)
        </span>
        <div className="grid grid-cols-4 gap-2">
          <NumberInput
            label="PS Margin"
            value={m.professional_services_margin_pct}
            onChange={(v) =>
              updateM({ professional_services_margin_pct: v })
            }
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="Resale Margin"
            value={m.software_resale_margin_pct}
            onChange={(v) => updateM({ software_resale_margin_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="Cloud Margin"
            value={m.cloud_consumption_margin_pct}
            onChange={(v) => updateM({ cloud_consumption_margin_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="EPSS Margin"
            value={m.epss_margin_pct}
            onChange={(v) => updateM({ epss_margin_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Sales Motion */}
      <div>
        <span className="text-sm font-medium text-gray-700 block mb-2">
          Sales Motion
        </span>
        <div className="grid grid-cols-5 gap-2">
          <NumberInput
            label="Sales Cycle"
            value={s.sales_cycle_months}
            onChange={(v) =>
              updateS({ sales_cycle_months: Math.max(0, Math.round(v)) })
            }
            suffix="mo"
            min={0}
          />
          <NumberInput
            label="Buffer"
            value={s.buffer_months}
            onChange={(v) =>
              updateS({ buffer_months: Math.max(0, Math.round(v)) })
            }
            suffix="mo"
            min={0}
          />
          <NumberInput
            label="Win Rate"
            value={s.opp_to_close_win_rate_pct}
            onChange={(v) =>
              updateS({ opp_to_close_win_rate_pct: v })
            }
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="Prospect→Opp"
            value={s.prospect_to_opp_rate_pct}
            onChange={(v) => updateS({ prospect_to_opp_rate_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="Prospect Lead"
            value={s.prospecting_lead_time_months}
            onChange={(v) =>
              updateS({
                prospecting_lead_time_months: Math.max(0, Math.round(v)),
              })
            }
            suffix="mo"
            min={0}
          />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const {
    state,
    updateProduct,
    updateMargins,
    updateSalesMotion,
    addProduct,
    deleteProduct,
    resetToSeed,
    importState,
  } = useStore();

  const handleAddProduct = () => {
    const id = generateId();
    const newProduct: Product = {
      id,
      name: "New Product",
      description: "",
      gross_unit_price: 10000,
      default_discount_pct: 10,
      professional_services_pct: 25,
      software_resale_pct: 25,
      cloud_consumption_pct: 25,
      epss_pct: 25,
    };
    addProduct(newProduct, { ...DEFAULT_MARGINS }, { ...DEFAULT_SALES_MOTION });
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="flex gap-2">
          <button
            onClick={handleAddProduct}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Product
          </button>
          <button
            onClick={resetToSeed}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Reset to Seed Data
          </button>
        </div>
      </div>

      {/* Import/Export */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-3">Import / Export</h2>
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

      {/* Product editors */}
      {state.products.map((product) => (
        <ProductEditor
          key={product.id}
          product={product}
          margins={
            state.marginsByProductId[product.id] ?? DEFAULT_MARGINS
          }
          salesMotion={
            state.salesMotionByProductId[product.id] ??
            DEFAULT_SALES_MOTION
          }
          onSaveProduct={updateProduct}
          onSaveMargins={(m) => updateMargins(product.id, m)}
          onSaveSalesMotion={(s) => updateSalesMotion(product.id, s)}
          onDelete={() => {
            if (
              confirm(
                `Delete "${product.name}"? This will also remove all forecast data for this product.`,
              )
            ) {
              deleteProduct(product.id);
            }
          }}
        />
      ))}

      {state.products.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No products yet. Click &quot;+ Add Product&quot; or &quot;Reset to
          Seed Data&quot;.
        </p>
      )}
    </div>
  );
}
