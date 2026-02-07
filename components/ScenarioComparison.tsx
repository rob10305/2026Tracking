"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForecast } from "@/lib/store/forecast-context";
import { calcScenarioDelta } from "@/lib/calc/scenarios";

interface LineItem {
  scenarioId: string;
  timePeriodId: string;
  category: string;
  subcategory: string;
  value: number;
}

function fmt(n: number): string {
  if (n === 0) return "-";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function delta(n: number): string {
  if (n === 0) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function pct(n: number): string {
  if (n === 0) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(1)}%`;
}

export default function ScenarioComparison() {
  const { forecast } = useForecast();
  const [allLineItems, setAllLineItems] = useState<LineItem[]>([]);
  const [baselineId, setBaselineId] = useState("");
  const [comparisonId, setComparisonId] = useState("");

  const scenarios = forecast?.scenarios ?? [];
  const timePeriods = forecast?.timePeriods ?? [];

  // Set defaults
  useEffect(() => {
    if (scenarios.length >= 2) {
      const baseline = scenarios.find((s) => s.isBaseline) ?? scenarios[0];
      setBaselineId(baseline.id);
      const comparison = scenarios.find((s) => s.id !== baseline.id);
      if (comparison) setComparisonId(comparison.id);
    }
  }, [scenarios]);

  // Fetch all line items for all scenarios
  useEffect(() => {
    if (!forecast) return;
    const fetchAll = async () => {
      const items: LineItem[] = [];
      for (const s of forecast.scenarios) {
        const res = await fetch(
          `/api/forecasts/${forecast.id}/scenarios/${s.id}/line-items`,
        );
        if (res.ok) {
          const data = await res.json();
          items.push(...data);
        }
      }
      setAllLineItems(items);
    };
    fetchAll();
  }, [forecast]);

  const deltas = useMemo(() => {
    if (!baselineId || !comparisonId) return [];
    const baseItems = allLineItems.filter((li) => li.scenarioId === baselineId);
    const compItems = allLineItems.filter((li) => li.scenarioId === comparisonId);
    return calcScenarioDelta(
      baseItems,
      compItems,
      timePeriods.map((tp) => tp.id),
    );
  }, [allLineItems, baselineId, comparisonId, timePeriods]);

  if (scenarios.length < 2) return null;

  const baselineName = scenarios.find((s) => s.id === baselineId)?.name ?? "";
  const comparisonName = scenarios.find((s) => s.id === comparisonId)?.name ?? "";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="font-semibold text-sm mb-3">Scenario Comparison</h2>
      <div className="flex gap-3 mb-4">
        <label className="text-sm">
          <span className="text-gray-600 mr-1">Baseline:</span>
          <select
            value={baselineId}
            onChange={(e) => setBaselineId(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-gray-600 mr-1">Compare:</span>
          <select
            value={comparisonId}
            onChange={(e) => setComparisonId(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {deltas.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left">
                <th className="px-3 py-2 font-medium">Period</th>
                <th className="px-3 py-2 font-medium text-right">{baselineName}</th>
                <th className="px-3 py-2 font-medium text-right">{comparisonName}</th>
                <th className="px-3 py-2 font-medium text-right">Delta</th>
                <th className="px-3 py-2 font-medium text-right">% Change</th>
              </tr>
            </thead>
            <tbody>
              {deltas.map((d, i) => {
                const tp = timePeriods.find((t) => t.id === d.timePeriodId);
                return (
                  <tr
                    key={d.timePeriodId}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-3 py-2">{tp?.label ?? d.timePeriodId}</td>
                    <td className="px-3 py-2 text-right">{fmt(d.baselineValue)}</td>
                    <td className="px-3 py-2 text-right">{fmt(d.comparisonValue)}</td>
                    <td
                      className={`px-3 py-2 text-right ${
                        d.absoluteDelta > 0
                          ? "text-green-600"
                          : d.absoluteDelta < 0
                            ? "text-red-600"
                            : ""
                      }`}
                    >
                      {delta(d.absoluteDelta)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${
                        d.percentDelta > 0
                          ? "text-green-600"
                          : d.percentDelta < 0
                            ? "text-red-600"
                            : ""
                      }`}
                    >
                      {pct(d.percentDelta)}
                    </td>
                  </tr>
                );
              })}
              {/* Totals row */}
              {(() => {
                const totalBase = deltas.reduce((s, d) => s + d.baselineValue, 0);
                const totalComp = deltas.reduce((s, d) => s + d.comparisonValue, 0);
                const totalDelta = totalComp - totalBase;
                const totalPct = totalBase !== 0 ? totalDelta / totalBase : 0;
                return (
                  <tr className="font-semibold bg-gray-100 border-t">
                    <td className="px-3 py-2">TOTAL</td>
                    <td className="px-3 py-2 text-right">{fmt(totalBase)}</td>
                    <td className="px-3 py-2 text-right">{fmt(totalComp)}</td>
                    <td
                      className={`px-3 py-2 text-right ${
                        totalDelta > 0
                          ? "text-green-600"
                          : totalDelta < 0
                            ? "text-red-600"
                            : ""
                      }`}
                    >
                      {delta(totalDelta)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${
                        totalPct > 0
                          ? "text-green-600"
                          : totalPct < 0
                            ? "text-red-600"
                            : ""
                      }`}
                    >
                      {pct(totalPct)}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
