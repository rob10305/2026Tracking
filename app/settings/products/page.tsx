"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/context";
import type { Product, SalesMotion, ComponentMixMode, ProductStatus, ProductReadiness } from "@/lib/models/types";
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

  const mode = p.component_mix_mode ?? "pct";
  const componentSum =
    p.professional_services_pct +
    p.software_resale_pct +
    p.cloud_consumption_pct +
    p.epss_pct;
  const validMix =
    mode === "pct"
      ? Math.abs(componentSum - 100) < 0.01
      : Math.abs(componentSum - p.gross_unit_price) < 0.01;

  const updateP = (patch: Partial<Product>) => {
    setP((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const updateReadiness = (patch: Partial<ProductReadiness>) => {
    setP((prev) => ({
      ...prev,
      readiness: { ...(prev.readiness ?? DEFAULT_READINESS), ...patch },
    }));
    setDirty(true);
  };

  const switchMode = (newMode: ComponentMixMode) => {
    if (newMode === mode) return;
    const price = p.gross_unit_price;
    if (newMode === "dollar" && mode === "pct") {
      setP((prev) => ({
        ...prev,
        component_mix_mode: "dollar",
        professional_services_pct: Math.round(price * prev.professional_services_pct / 100),
        software_resale_pct: Math.round(price * prev.software_resale_pct / 100),
        cloud_consumption_pct: Math.round(price * prev.cloud_consumption_pct / 100),
        epss_pct: Math.round(price * prev.epss_pct / 100),
      }));
    } else {
      const total = p.professional_services_pct + p.software_resale_pct + p.cloud_consumption_pct + p.epss_pct;
      const toPct = (v: number) => total === 0 ? 25 : Math.round((v / total) * 10000) / 100;
      setP((prev) => ({
        ...prev,
        component_mix_mode: "pct",
        professional_services_pct: toPct(prev.professional_services_pct),
        software_resale_pct: toPct(prev.software_resale_pct),
        cloud_consumption_pct: toPct(prev.cloud_consumption_pct),
        epss_pct: toPct(prev.epss_pct),
      }));
    }
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
              <StatusBadge status={p.status ?? "live"} />
            </div>
            {!expanded && p.description && (
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {p.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {!expanded && (
            <>
              <span className="text-sm text-gray-500 mr-2">
                {formatPrice(product.gross_unit_price)}
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
            <DetailRow label="Gross Unit Price" value={formatPrice(product.gross_unit_price)} />
            <DetailRow label="Default Discount" value={`${product.default_discount_pct}%`} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Revenue Component Mix</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                {(product.component_mix_mode ?? "pct") === "pct" ? "Percentage" : "Dollar"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-x-6 gap-y-2">
              {(product.component_mix_mode ?? "pct") === "pct" ? (
                <>
                  <DetailRow label="Prof. Services" value={`${product.professional_services_pct}%`} />
                  <DetailRow label="Software Resale" value={`${product.software_resale_pct}%`} />
                  <DetailRow label="Cloud Consumption" value={`${product.cloud_consumption_pct}%`} />
                  <DetailRow label="EPS" value={`${product.epss_pct}%`} />
                </>
              ) : (
                <>
                  <DetailRow label="Prof. Services" value={formatPrice(product.professional_services_pct)} />
                  <DetailRow label="Software Resale" value={formatPrice(product.software_resale_pct)} />
                  <DetailRow label="Cloud Consumption" value={formatPrice(product.cloud_consumption_pct)} />
                  <DetailRow label="EPS" value={formatPrice(product.epss_pct)} />
                </>
              )}
            </div>
          </div>

          {product.status === "in_development" && product.readiness && (
            <ReadinessDisplay readiness={product.readiness} />
          )}
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
            <span className="text-sm font-medium text-gray-700 block mb-2">Product Status</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => updateP({ status: "live" })}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-all ${
                  p.status === "live"
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${p.status === "live" ? "bg-green-500" : "bg-gray-300"}`} />
                Live
              </button>
              <button
                type="button"
                onClick={() => updateP({ status: "in_development", readiness: p.readiness ?? { ...DEFAULT_READINESS } })}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-all ${
                  p.status === "in_development"
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${p.status === "in_development" ? "bg-amber-500" : "bg-gray-300"}`} />
                In Development
              </button>
            </div>
          </div>

          {p.status === "in_development" && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-amber-800">Launch Readiness Checklist</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="text-amber-700 font-medium">MVP Date</span>
                  <input
                    type="date"
                    value={readiness.mvp_date}
                    onChange={(e) => updateReadiness({ mvp_date: e.target.value })}
                    className="w-full border border-amber-300 rounded px-2 py-1.5 text-sm mt-0.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-amber-700 font-medium">Release Date</span>
                  <input
                    type="date"
                    value={readiness.release_date}
                    onChange={(e) => updateReadiness({ release_date: e.target.value })}
                    className="w-full border border-amber-300 rounded px-2 py-1.5 text-sm mt-0.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ReadinessCheckbox
                  label="Prospecting"
                  checked={readiness.prospecting}
                  onChange={(v) => updateReadiness({ prospecting: v })}
                />
                <ReadinessCheckbox
                  label="Website Content"
                  checked={readiness.website_content}
                  onChange={(v) => updateReadiness({ website_content: v })}
                />
                <ReadinessCheckbox
                  label="Pricing"
                  checked={readiness.pricing}
                  onChange={(v) => updateReadiness({ pricing: v })}
                />
                <ReadinessCheckbox
                  label="Sales Collateral"
                  checked={readiness.sales_collateral}
                  onChange={(v) => updateReadiness({ sales_collateral: v })}
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Revenue Component Mix
              </span>
              <div className="flex rounded overflow-hidden border border-gray-300 text-xs">
                <button
                  type="button"
                  onClick={() => switchMode("pct")}
                  className={`px-2.5 py-1 font-medium transition-colors ${
                    mode === "pct"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("dollar")}
                  className={`px-2.5 py-1 font-medium transition-colors border-l border-gray-300 ${
                    mode === "dollar"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  $
                </button>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  validMix
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {mode === "pct" ? (
                  <>Sum: {componentSum.toFixed(1)}% {validMix ? "OK" : "(must = 100%)"}</>
                ) : (
                  <>Sum: {formatPrice(componentSum)} {validMix ? "OK" : `(must = ${formatPrice(p.gross_unit_price)})`}</>
                )}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <NumberInput
                label="Prof. Services"
                value={p.professional_services_pct}
                onChange={(v) => updateP({ professional_services_pct: v })}
                suffix={mode === "pct" ? "%" : "$"}
                min={0}
                max={mode === "pct" ? 100 : undefined}
              />
              <NumberInput
                label="Software Resale"
                value={p.software_resale_pct}
                onChange={(v) => updateP({ software_resale_pct: v })}
                suffix={mode === "pct" ? "%" : "$"}
                min={0}
                max={mode === "pct" ? 100 : undefined}
              />
              <NumberInput
                label="Cloud Consumption"
                value={p.cloud_consumption_pct}
                onChange={(v) => updateP({ cloud_consumption_pct: v })}
                suffix={mode === "pct" ? "%" : "$"}
                min={0}
                max={mode === "pct" ? 100 : undefined}
              />
              <NumberInput
                label="EPS"
                value={p.epss_pct}
                onChange={(v) => updateP({ epss_pct: v })}
                suffix={mode === "pct" ? "%" : "$"}
                min={0}
                max={mode === "pct" ? 100 : undefined}
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
      component_mix_mode: "pct",
      professional_services_pct: 25,
      software_resale_pct: 25,
      cloud_consumption_pct: 25,
      epss_pct: 25,
      status: "live",
    };
    addProduct(newProduct, { ...DEFAULT_SALES_MOTION });
    setExpandAll(false);
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Description",
      "Status",
      "Gross Unit Price",
      "Default Discount %",
      "Component Mix Mode",
      "Professional Services",
      "Software Resale",
      "Cloud Consumption",
      "EPS",
    ];
    const rows = state.products.map((p) => {
      const mode = p.component_mix_mode ?? "pct";
      const suffix = mode === "pct" ? "%" : "$";
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${(p.description || "").replace(/"/g, '""')}"`,
        p.status === "in_development" ? "In Development" : "Live",
        p.gross_unit_price,
        p.default_discount_pct,
        mode === "pct" ? "Percentage" : "Dollar",
        `${p.professional_services_pct}${suffix}`,
        `${p.software_resale_pct}${suffix}`,
        `${p.cloud_consumption_pct}${suffix}`,
        `${p.epss_pct}${suffix}`,
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
