"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/context";
import type { Margins } from "@/lib/models/types";
import NumberInput from "@/components/NumberInput";

export default function MarginsPage() {
  const { state, updateMargins } = useStore();
  const [m, setM] = useState<Margins>({ ...state.margins });
  const [dirty, setDirty] = useState(false);

  const update = (patch: Partial<Margins>) => {
    setM((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = () => {
    updateMargins(m);
    setDirty(false);
  };

  const cancel = () => {
    setM({ ...state.margins });
    setDirty(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Margins</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure historic margin percentages applied to all products&apos; revenue components.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <>
              <button
                onClick={save}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={cancel}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Prof. Services Margin"
            value={m.professional_services_margin_pct}
            onChange={(v) => update({ professional_services_margin_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="Software Resale Margin"
            value={m.software_resale_margin_pct}
            onChange={(v) => update({ software_resale_margin_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="Cloud Consumption Margin"
            value={m.cloud_consumption_margin_pct}
            onChange={(v) => update({ cloud_consumption_margin_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
          <NumberInput
            label="EPS Margin"
            value={m.epss_margin_pct}
            onChange={(v) => update({ epss_margin_pct: v })}
            suffix="%"
            min={0}
            max={100}
          />
        </div>
      </div>
    </div>
  );
}
