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

function SalesMotionCard({
  productName,
  productId,
  salesMotion,
  onSave,
}: {
  productName: string;
  productId: string;
  salesMotion: SalesMotion;
  onSave: (productId: string, s: SalesMotion) => void;
}) {
  const [s, setS] = useState<SalesMotion>({ ...salesMotion });
  const [dirty, setDirty] = useState(false);

  const updateS = (patch: Partial<SalesMotion>) => {
    setS((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = () => {
    onSave(productId, s);
    setDirty(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base">{productName}</h3>
        {dirty && (
          <button
            onClick={save}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        )}
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
  );
}

export default function SalesMotionsPage() {
  const { state, updateSalesMotion } = useStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Motions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure sales cycle timing, win rates, and prospecting parameters for each product.
        </p>
      </div>

      {state.products.map((product) => (
        <SalesMotionCard
          key={product.id}
          productName={product.name}
          productId={product.id}
          salesMotion={
            state.salesMotionByProductId[product.id] ?? DEFAULT_SALES_MOTION
          }
          onSave={updateSalesMotion}
        />
      ))}

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
