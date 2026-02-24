"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/context";
import type { Product, SalesMotion, ProductStatus, ProductReadiness, ProductVariant, VariantPricing } from "@/lib/models/types";
import { getEffectivePricing } from "@/lib/calc/revenue";
import { downloadCSV } from "@/lib/store/persistence";
import NumberInput from "@/components/NumberInput";

const DEFAULT_SALES_MOTION: SalesMotion = {
  sales_cycle_months: 3,
  opp_to_close_win_rate_pct: 25,
  prospect_to_opp_rate_pct: 15,
  prospecting_lead_time_months: 1,
};

const DEFAULT_READINESS: ProductReadiness = {
  mvp_date: "",
  release_date: "",
  prospecting: false,
  website_content: false,
  pricing: false,
  sales_collateral: false,
};

const DEFAULT_VARIANT_PRICING: VariantPricing = {
  gross_annual_price: 10000,
  platform_support_services_pct: 0,
  professional_services_pct: 25,
  software_resale_pct: 25,
  cloud_consumption_pct: 25,
  eps_pct: 25,
  user_count: "",
};

const VARIANT_LABELS: Record<ProductVariant, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

function generateId(): string {
  return "prod-" + Math.random().toString(36).slice(2, 10);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      In Development
    </span>
  );
}

function VariantBadge({ variant }: { variant?: ProductVariant }) {
  if (!variant) return null;
  return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
      {VARIANT_LABELS[variant]}
    </span>
  );
}

function ReadinessCheckbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2.5 p-3 rounded-lg border transition-colors cursor-pointer ${
      checked
        ? "bg-green-50 border-green-200"
        : "bg-gray-50 border-gray-200 hover:border-gray-300"
    } ${disabled ? "opacity-60 cursor-default" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {checked && (
        <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </label>
  );
}

function ReadinessDisplay({ readiness }: { readiness: ProductReadiness }) {
  const items = [
    { label: "Prospecting", done: readiness.prospecting },
    { label: "Website Content", done: readiness.website_content },
    { label: "Pricing", done: readiness.pricing },
    { label: "Sales Collateral", done: readiness.sales_collateral },
  ];
  const completed = items.filter((i) => i.done).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Launch Readiness</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          completed === items.length
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}>
          {completed}/{items.length} complete
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {readiness.mvp_date && (
          <DetailRow label="MVP Date" value={new Date(readiness.mvp_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
        )}
        {readiness.release_date && (
          <DetailRow label="Release Date" value={new Date(readiness.release_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
            item.done ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
          }`}>
            {item.done ? (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
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
  const [editing, setEditing] = useState(false);

  const effective = getEffectivePricing(p);
  const componentSum =
    effective.platform_support_services_pct +
    effective.professional_services_pct +
    effective.software_resale_pct +
    effective.cloud_consumption_pct +
    effective.eps_pct;
  const validMix = Math.abs(componentSum - 100) < 0.01;

  const updateP = (patch: Partial<Product>) => {
    setP((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const updateVariant = (variant: ProductVariant, patch: Partial<VariantPricing>) => {
    setP((prev) => {
      const variants = prev.variants ?? {
        small: { ...DEFAULT_VARIANT_PRICING },
        medium: { ...DEFAULT_VARIANT_PRICING },
        large: { ...DEFAULT_VARIANT_PRICING },
      };
      return {
        ...prev,
        variants: {
          ...variants,
          [variant]: { ...variants[variant], ...patch },
        },
      };
    });
    setDirty(true);
  };

  const updateEffective = (patch: Partial<VariantPricing>) => {
    if (p.has_variants && p.selected_variant && p.variants) {
      updateVariant(p.selected_variant, patch);
    } else {
      setP((prev) => ({ ...prev, ...patch }));
      setDirty(true);
    }
  };

  const updateReadiness = (patch: Partial<ProductReadiness>) => {
    setP((prev) => ({
      ...prev,
      readiness: { ...(prev.readiness ?? DEFAULT_READINESS), ...patch },
    }));
    setDirty(true);
  };

  const save = () => {
    if (!validMix) return;
    const toSave = { ...p };
    if (toSave.status === "live") {
      delete toSave.readiness;
    }
    onSave(toSave);
    setDirty(false);
    setEditing(false);
  };

  const cancel = () => {
    setP({ ...product });
    setDirty(false);
    setEditing(false);
  };

  const formatPrice = (v: number) =>
    "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const readiness = p.readiness ?? DEFAULT_READINESS;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => { if (!editing) setExpanded(!expanded); }}
        onKeyDown={(e) => { if (!editing && (e.key === "Enter" || e.key === " ")) setExpanded(!expanded); }}
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
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base truncate">
                {p.name || "New Product"}
              </h3>
            </div>
            {!expanded && p.generally_available && (
              <p className="text-xs text-gray-400 truncate mt-0.5">
                GA: {p.generally_available}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {!expanded && (
            <>
              <span className="text-sm text-gray-500 mr-2">
                {formatPrice(effective.gross_annual_price)}
              </span>
              <button
                onClick={() => { setExpanded(true); setEditing(true); }}
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

      {expanded && !editing && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={onClone}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Clone
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              Delete
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <DetailRow label="Name" value={product.name || "\u2014"} />
            <DetailRow label="Description" value={product.description || "\u2014"} />
            <DetailRow label="Generally Available" value={product.generally_available || "\u2014"} />
            <DetailRow label="Gross Annual Price" value={formatPrice(effective.gross_annual_price)} />
            {product.has_variants && (
              <DetailRow label="Variant" value={product.selected_variant ? VARIANT_LABELS[product.selected_variant] : "\u2014"} />
            )}
            <DetailRow label="User Count" value={effective.user_count || "\u2014"} />
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Revenue Component Mix (%)</span>
            <div className="grid grid-cols-5 gap-x-6 gap-y-2">
              {effective.platform_support_services_pct > 0 && (
                <DetailRow label="Platform Support" value={`${effective.platform_support_services_pct}%`} />
              )}
              <DetailRow label="Prof. Services" value={`${effective.professional_services_pct}%`} />
              <DetailRow label="Software Resale" value={`${effective.software_resale_pct}%`} />
              <DetailRow label="Cloud Consumption" value={`${effective.cloud_consumption_pct}%`} />
              <DetailRow label="EPS" value={`${effective.eps_pct}%`} />
            </div>
          </div>

        </div>
      )}

      {expanded && editing && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={save}
              disabled={!validMix}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={cancel}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              Delete
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-gray-600">Name</span>
              <input
                type="text"
                value={p.name}
                onChange={(e) => updateP({ name: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-0.5"
              />
            </label>
            <label className="block text-sm">
              <span className="text-gray-600">Generally Available</span>
              <input
                type="text"
                value={p.generally_available}
                onChange={(e) => updateP({ generally_available: e.target.value })}
                placeholder="e.g. April"
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
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={p.has_variants}
                onChange={(e) => {
                  const hasV = e.target.checked;
                  if (hasV && !p.variants) {
                    const current: VariantPricing = {
                      gross_annual_price: p.gross_annual_price,
                      platform_support_services_pct: p.platform_support_services_pct,
                      professional_services_pct: p.professional_services_pct,
                      software_resale_pct: p.software_resale_pct,
                      cloud_consumption_pct: p.cloud_consumption_pct,
                      eps_pct: p.eps_pct,
                      user_count: p.user_count,
                    };
                    updateP({
                      has_variants: true,
                      selected_variant: "small",
                      variants: { small: { ...current }, medium: { ...current }, large: { ...current } },
                    });
                  } else {
                    updateP({ has_variants: hasV, selected_variant: hasV ? (p.selected_variant ?? "small") : undefined });
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Has Variants (S/M/L)</span>
            </label>

            {p.has_variants && (
              <select
                value={p.selected_variant ?? "small"}
                onChange={(e) => updateP({ selected_variant: e.target.value as ProductVariant })}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Gross Annual Price"
              value={effective.gross_annual_price}
              onChange={(v) => updateEffective({ gross_annual_price: v })}
              suffix="$"
              min={0}
            />
            <label className="block text-sm">
              <span className="text-gray-600">User Count</span>
              <input
                type="text"
                value={effective.user_count}
                onChange={(e) => updateEffective({ user_count: e.target.value })}
                placeholder="e.g. 50 or N/A"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-0.5"
              />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Revenue Component Mix (%)
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  validMix
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                Sum: {componentSum.toFixed(1)}% {validMix ? "OK" : "(must = 100%)"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <NumberInput
                label="Platform Support"
                value={effective.platform_support_services_pct}
                onChange={(v) => updateEffective({ platform_support_services_pct: v })}
                suffix="%"
                min={0}
                max={100}
              />
              <NumberInput
                label="Prof. Services"
                value={effective.professional_services_pct}
                onChange={(v) => updateEffective({ professional_services_pct: v })}
                suffix="%"
                min={0}
                max={100}
              />
              <NumberInput
                label="Software Resale"
                value={effective.software_resale_pct}
                onChange={(v) => updateEffective({ software_resale_pct: v })}
                suffix="%"
                min={0}
                max={100}
              />
              <NumberInput
                label="Cloud Consumption"
                value={effective.cloud_consumption_pct}
                onChange={(v) => updateEffective({ cloud_consumption_pct: v })}
                suffix="%"
                min={0}
                max={100}
              />
              <NumberInput
                label="EPS"
                value={effective.eps_pct}
                onChange={(v) => updateEffective({ eps_pct: v })}
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
      generally_available: "",
      gross_annual_price: 10000,
      platform_support_services_pct: 0,
      professional_services_pct: 25,
      software_resale_pct: 25,
      cloud_consumption_pct: 25,
      eps_pct: 25,
      user_count: "",
      has_variants: false,
      status: "live",
    };
    addProduct(newProduct, { ...DEFAULT_SALES_MOTION });
    setExpandAll(false);
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Description",
      "Generally Available",
      "Status",
      "Has Variants",
      "Selected Variant",
      "Gross Annual Price",
      "Platform Support Services %",
      "Professional Services %",
      "Software Resale %",
      "Cloud Consumption %",
      "EPS %",
      "User Count",
    ];
    const rows = state.products.map((p) => {
      const eff = getEffectivePricing(p);
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${(p.description || "").replace(/"/g, '""')}"`,
        `"${p.generally_available || ""}"`,
        p.status === "in_development" ? "In Development" : "Live",
        p.has_variants ? "Yes" : "No",
        p.selected_variant ? VARIANT_LABELS[p.selected_variant] : "",
        eff.gross_annual_price,
        `${eff.platform_support_services_pct}%`,
        `${eff.professional_services_pct}%`,
        `${eff.software_resale_pct}%`,
        `${eff.cloud_consumption_pct}%`,
        `${eff.eps_pct}%`,
        `"${eff.user_count || ""}"`,
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    downloadCSV(csv, `products-export-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleCloneProduct = (sourceProduct: Product) => {
    const id = generateId();
    const cloned: Product = {
      ...sourceProduct,
      id,
      name: `${sourceProduct.name} (Copy)`,
    };
    const salesMotion = state.salesMotionByProductId[sourceProduct.id] ?? { ...DEFAULT_SALES_MOTION };
    addProduct(cloned, { ...salesMotion });
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
          {state.products.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Export CSV
            </button>
          )}
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
