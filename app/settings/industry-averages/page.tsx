"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/context";
import type { SalesMotion, PipelineContribution, PipelineContributionMode } from "@/lib/models/types";
import NumberInput from "@/components/NumberInput";

const PIPELINE_CHANNELS: { key: keyof Omit<PipelineContribution, "mode">; label: string }[] = [
  { key: "website_inbound", label: "Website Inbound" },
  { key: "sales_team_generated", label: "Sales Team Generated" },
  { key: "event_sourced", label: "Event Sourced" },
  { key: "abm_thought_leadership", label: "ABM/Thought Leadership" },
];

export default function IndustryAveragesPage() {
  const { state, updateIndustryAverages, updatePipelineContribution } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SalesMotion>({ ...state.industryAverages });

  const [pipeEditing, setPipeEditing] = useState(false);
  const [pipeDraft, setPipeDraft] = useState<PipelineContribution>({ ...state.pipelineContribution });

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

  const updatePipeDraft = (patch: Partial<PipelineContribution>) => {
    setPipeDraft((prev) => ({ ...prev, ...patch }));
  };

  const togglePipeMode = (mode: PipelineContributionMode) => {
    if (mode === pipeDraft.mode) return;
    setPipeDraft((prev) => ({ ...prev, mode }));
  };

  const savePipe = () => {
    updatePipelineContribution(pipeDraft);
    setPipeEditing(false);
  };

  const cancelPipe = () => {
    setPipeDraft({ ...state.pipelineContribution });
    setPipeEditing(false);
  };

  const pc = state.pipelineContribution;
  const suffix = pc.mode === "pct" ? "%" : "#";
  const draftSuffix = pipeDraft.mode === "pct" ? "%" : "#";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Pipeline Contribution</h2>
          {!pipeEditing ? (
            <button
              onClick={() => { setPipeDraft({ ...state.pipelineContribution }); setPipeEditing(true); }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={savePipe}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={cancelPipe}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {!pipeEditing ? (
          <>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">Mode:</span>
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {pc.mode === "pct" ? "Percentage (%)" : "Number (#)"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-x-6 gap-y-2">
              {PIPELINE_CHANNELS.map((ch) => (
                <div key={ch.key}>
                  <span className="text-xs text-gray-400">{ch.label}</span>
                  <p className="text-sm font-medium text-gray-800">
                    {pc[ch.key]}{suffix}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Display as:</span>
              <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
                <button
                  onClick={() => togglePipeMode("pct")}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    pipeDraft.mode === "pct"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => togglePipeMode("num")}
                  className={`px-3 py-1 text-sm font-medium transition-colors border-l border-gray-300 ${
                    pipeDraft.mode === "num"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  #
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {PIPELINE_CHANNELS.map((ch) => (
                <NumberInput
                  key={ch.key}
                  label={ch.label}
                  value={pipeDraft[ch.key]}
                  onChange={(v) => updatePipeDraft({ [ch.key]: Math.max(0, pipeDraft.mode === "pct" ? v : Math.round(v)) })}
                  suffix={draftSuffix}
                  min={0}
                  max={pipeDraft.mode === "pct" ? 100 : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
