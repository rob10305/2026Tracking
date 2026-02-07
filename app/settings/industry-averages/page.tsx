"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/context";
import type { SalesMotion } from "@/lib/models/types";
import NumberInput from "@/components/NumberInput";

export default function IndustryAveragesPage() {
  const { state, updateIndustryAverages } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SalesMotion>({ ...state.industryAverages });

  const updateDraft = (patch: Partial<SalesMotion>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const save = () => {
    updateIndustryAverages(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft({ ...state.industryAverages });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Industry Averages</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set default industry average values for sales motion parameters. These can be applied to individual products via the Sales Motions page.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Default Sales Motion Parameters</h2>
          {!editing ? (
            <button
              onClick={() => { setDraft({ ...state.industryAverages }); setEditing(true); }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
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
          )}
        </div>

        {!editing ? (
          <div className="grid grid-cols-4 gap-x-6 gap-y-2">
            <div>
              <span className="text-xs text-gray-400">Sales Cycle</span>
              <p className="text-sm font-medium text-gray-800">{state.industryAverages.sales_cycle_months} mo</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Win Rate</span>
              <p className="text-sm font-medium text-gray-800">{state.industryAverages.opp_to_close_win_rate_pct}%</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Prospect to Opp</span>
              <p className="text-sm font-medium text-gray-800">{state.industryAverages.prospect_to_opp_rate_pct}%</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Prospect Lead Time</span>
              <p className="text-sm font-medium text-gray-800">{state.industryAverages.prospecting_lead_time_months} mo</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            <NumberInput
              label="Sales Cycle"
              value={draft.sales_cycle_months}
              onChange={(v) => updateDraft({ sales_cycle_months: Math.max(0, Math.round(v)) })}
              suffix="mo"
              min={0}
            />
            <NumberInput
              label="Win Rate"
              value={draft.opp_to_close_win_rate_pct}
              onChange={(v) => updateDraft({ opp_to_close_win_rate_pct: v })}
              suffix="%"
              min={0}
              max={100}
            />
            <NumberInput
              label="Prospect to Opp"
              value={draft.prospect_to_opp_rate_pct}
              onChange={(v) => updateDraft({ prospect_to_opp_rate_pct: v })}
              suffix="%"
              min={0}
              max={100}
            />
            <NumberInput
              label="Prospect Lead Time"
              value={draft.prospecting_lead_time_months}
              onChange={(v) => updateDraft({ prospecting_lead_time_months: Math.max(0, Math.round(v)) })}
              suffix="mo"
              min={0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
