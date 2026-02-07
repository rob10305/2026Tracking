"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/context";
import type { SalesMotion } from "@/lib/models/types";
import NumberInput from "@/components/NumberInput";

const DEFAULT_SALES_MOTION: SalesMotion = {
  sales_cycle_months: 3,
  buffer_months: 1,
  opp_to_close_win_rate_pct: 25,
  prospect_to_opp_rate_pct: 15,
  prospecting_lead_time_months: 1,
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function SalesMotionCard({
  productName,
  productId,
  salesMotion,
  onSave,
  defaultExpanded,
}: {
  productName: string;
  productId: string;
  salesMotion: SalesMotion;
  onSave: (productId: string, s: SalesMotion) => void;
  defaultExpanded?: boolean;
}) {
  const [s, setS] = useState<SalesMotion>({ ...salesMotion });
  const [dirty, setDirty] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const [editing, setEditing] = useState(false);

  const updateS = (patch: Partial<SalesMotion>) => {
    setS((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = () => {
    onSave(productId, s);
    setDirty(false);
    setEditing(false);
  };

  const cancel = () => {
    setS({ ...salesMotion });
    setDirty(false);
    setEditing(false);
  };

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
          <h3 className="font-bold text-base truncate">{productName}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {!expanded && (
            <>
              <span className="text-sm text-gray-500 mr-2">
                {salesMotion.sales_cycle_months}mo cycle
              </span>
              <button
                onClick={() => { setExpanded(true); setEditing(true); }}
                className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
              >
                Edit
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
          </div>

          <div className="grid grid-cols-5 gap-x-6 gap-y-2">
            <DetailRow label="Sales Cycle" value={`${salesMotion.sales_cycle_months} mo`} />
            <DetailRow label="Buffer" value={`${salesMotion.buffer_months} mo`} />
            <DetailRow label="Win Rate" value={`${salesMotion.opp_to_close_win_rate_pct}%`} />
            <DetailRow label="Prospect to Opp" value={`${salesMotion.prospect_to_opp_rate_pct}%`} />
            <DetailRow label="Prospect Lead Time" value={`${salesMotion.prospecting_lead_time_months} mo`} />
          </div>
        </div>
      )}

      {expanded && editing && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          <div className="flex justify-end gap-2 pt-3">
            <button
              onClick={save}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={cancel}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-5 gap-3">
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
              onChange={(v) => updateS({ opp_to_close_win_rate_pct: v })}
              suffix="%"
              min={0}
              max={100}
            />
            <NumberInput
              label="Prospect to Opp"
              value={s.prospect_to_opp_rate_pct}
              onChange={(v) => updateS({ prospect_to_opp_rate_pct: v })}
              suffix="%"
              min={0}
              max={100}
            />
            <NumberInput
              label="Prospect Lead Time"
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
      )}
    </div>
  );
}

export default function SalesMotionsPage() {
  const { state, updateSalesMotion } = useStore();
  const [expandAll, setExpandAll] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Motions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure sales cycle timing, win rates, and prospecting parameters for each product.
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
        </div>
      </div>

      <div className="space-y-2">
        {state.products.map((product) => (
          <SalesMotionCard
            key={product.id + (expandAll ? "-expanded" : "-collapsed")}
            productName={product.name}
            productId={product.id}
            salesMotion={
              state.salesMotionByProductId[product.id] ?? DEFAULT_SALES_MOTION
            }
            onSave={updateSalesMotion}
            defaultExpanded={expandAll}
          />
        ))}
      </div>

      {state.products.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          <p className="mb-2">No products configured yet.</p>
          <p className="text-sm">
            Add products first to configure their sales motions.
          </p>
        </div>
      )}
    </div>
  );
}
