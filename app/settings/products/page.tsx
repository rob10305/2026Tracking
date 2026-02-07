"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/context";
import type { Product, Margins, SalesMotion } from "@/lib/models/types";
import NumberInput from "@/components/NumberInput";

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

function generateId(): string {
  return "prod-" + Math.random().toString(36).slice(2, 10);
}

function ProductCard({
  product,
  onSave,
  onDelete,
  onClone,
  defaultExpanded,
}: {
  product: Product;
  onSave: (p: Product) => void;
  onDelete: () => void;
  onClone: () => void;
  defaultExpanded?: boolean;
}) {
  const [p, setP] = useState<Product>({ ...product });
  const [dirty, setDirty] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);

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

  const save = () => {
    if (!validMix) return;
    onSave(p);
    setDirty(false);
  };

  const formatPrice = (v: number) =>
    "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(!expanded); }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg
            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
              expanded ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <div className="min-w-0">
            <h3 className="font-bold text-base truncate">
              {p.name || "New Product"}
            </h3>
            {!expanded && p.description && (
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {p.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {dirty && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
              Unsaved
            </span>
          )}
          {!expanded && (
            <>
              <span className="text-sm text-gray-500 mr-2">
                {formatPrice(p.gross_unit_price)}
              </span>
              <button
                onClick={() => setExpanded(true)}
                className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onClone}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Clone
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          <div className="flex justify-end gap-2 pt-3">
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
              onClick={onClone}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Clone
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              Delete
            </button>
          </div>

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
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const { state, updateProduct, addProduct, deleteProduct } = useStore();
  const [expandAll, setExpandAll] = useState(false);

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
    setExpandAll(false);
  };

  const handleCloneProduct = (sourceProduct: Product) => {
    const id = generateId();
    const cloned: Product = {
      ...sourceProduct,
      id,
      name: `${sourceProduct.name} (Copy)`,
    };
    const margins = state.marginsByProductId[sourceProduct.id] ?? { ...DEFAULT_MARGINS };
    const salesMotion = state.salesMotionByProductId[sourceProduct.id] ?? { ...DEFAULT_SALES_MOTION };
    addProduct(cloned, { ...margins }, { ...salesMotion });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your product catalog, pricing, and revenue component mix.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {state.products.length > 1 && (
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {expandAll ? "Collapse All" : "Expand All"}
            </button>
          )}
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {state.products.map((product) => (
          <ProductCard
            key={product.id + (expandAll ? "-expanded" : "-collapsed")}
            product={product}
            onSave={updateProduct}
            defaultExpanded={expandAll}
            onClone={() => handleCloneProduct(product)}
            onDelete={() => {
              if (
                confirm(
                  `Delete "${product.name}"? This will also remove all forecast data for this product.`
                )
              ) {
                deleteProduct(product.id);
              }
            }}
          />
        ))}
      </div>

      {state.products.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          <p className="mb-2">No products configured yet.</p>
          <p className="text-sm">
            Click &quot;+ Add Product&quot; to get started.
          </p>
        </div>
      )}
    </div>
  );
}
