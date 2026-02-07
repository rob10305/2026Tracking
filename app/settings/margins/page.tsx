"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/context";
import type { Margins } from "@/lib/models/types";
import NumberInput from "@/components/NumberInput";

const DEFAULT_MARGINS: Margins = {
  professional_services_margin_pct: 45,
  software_resale_margin_pct: 20,
  cloud_consumption_margin_pct: 30,
  epss_margin_pct: 50,
};

function MarginCard({
  productName,
  productId,
  margins,
  onSave,
}: {
  productName: string;
  productId: string;
  margins: Margins;
  onSave: (productId: string, m: Margins) => void;
}) {
  const [m, setM] = useState<Margins>({ ...margins });
  const [dirty, setDirty] = useState(false);

  const updateM = (patch: Partial<Margins>) => {
    setM((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = () => {
    onSave(productId, m);
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

      <div className="grid grid-cols-4 gap-3">
        <NumberInput
          label="Prof. Services Margin"
          value={m.professional_services_margin_pct}
          onChange={(v) => updateM({ professional_services_margin_pct: v })}
          suffix="%"
          min={0}
          max={100}
        />
        <NumberInput
          label="Software Resale Margin"
          value={m.software_resale_margin_pct}
          onChange={(v) => updateM({ software_resale_margin_pct: v })}
          suffix="%"
          min={0}
          max={100}
        />
        <NumberInput
          label="Cloud Consumption Margin"
          value={m.cloud_consumption_margin_pct}
          onChange={(v) => updateM({ cloud_consumption_margin_pct: v })}
          suffix="%"
          min={0}
          max={100}
        />
        <NumberInput
          label="EPS Margin"
          value={m.epss_margin_pct}
          onChange={(v) => updateM({ epss_margin_pct: v })}
          suffix="%"
          min={0}
          max={100}
        />
      </div>
    </div>
  );
}

export default function MarginsPage() {
  const { state, updateMargins } = useStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Margins</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure historic margin percentages for each product&apos;s revenue components.
        </p>
      </div>

      {state.products.map((product) => (
        <MarginCard
          key={product.id}
          productName={product.name}
          productId={product.id}
          margins={state.marginsByProductId[product.id] ?? DEFAULT_MARGINS}
          onSave={updateMargins}
        />
      ))}

      {state.products.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          <p className="mb-2">No products configured yet.</p>
          <p className="text-sm">
            Add products first to configure their margins.
          </p>
        </div>
      )}
    </div>
  );
}
