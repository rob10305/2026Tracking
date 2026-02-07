import { describe, it, expect } from "vitest";
import { calcScenarioTotals, calcScenarioDelta } from "@/lib/calc/scenarios";

const lineItems = [
  { scenarioId: "s1", timePeriodId: "tp1", category: "revenue", subcategory: "product-a", value: 100 },
  { scenarioId: "s1", timePeriodId: "tp1", category: "revenue", subcategory: "product-b", value: 50 },
  { scenarioId: "s1", timePeriodId: "tp2", category: "revenue", subcategory: "product-a", value: 120 },
  { scenarioId: "s2", timePeriodId: "tp1", category: "revenue", subcategory: "product-a", value: 130 },
  { scenarioId: "s2", timePeriodId: "tp1", category: "revenue", subcategory: "product-b", value: 60 },
  { scenarioId: "s2", timePeriodId: "tp2", category: "revenue", subcategory: "product-a", value: 150 },
];

const scenarios = [
  { id: "s1", name: "Baseline" },
  { id: "s2", name: "Optimistic" },
];

describe("calcScenarioTotals", () => {
  it("sums values by time period for each scenario", () => {
    const totals = calcScenarioTotals(lineItems, scenarios);

    expect(totals).toHaveLength(2);

    const s1 = totals.find((t) => t.scenarioId === "s1")!;
    expect(s1.totalByPeriod["tp1"]).toBe(150); // 100 + 50
    expect(s1.totalByPeriod["tp2"]).toBe(120);
    expect(s1.grandTotal).toBe(270);

    const s2 = totals.find((t) => t.scenarioId === "s2")!;
    expect(s2.totalByPeriod["tp1"]).toBe(190); // 130 + 60
    expect(s2.totalByPeriod["tp2"]).toBe(150);
    expect(s2.grandTotal).toBe(340);
  });

  it("returns zero totals for scenarios with no line items", () => {
    const totals = calcScenarioTotals([], [{ id: "s3", name: "Empty" }]);
    expect(totals[0].grandTotal).toBe(0);
    expect(totals[0].totalByPeriod).toEqual({});
  });
});

describe("calcScenarioDelta", () => {
  const baselineItems = lineItems.filter((li) => li.scenarioId === "s1");
  const comparisonItems = lineItems.filter((li) => li.scenarioId === "s2");

  it("calculates absolute and percent deltas per time period", () => {
    const deltas = calcScenarioDelta(baselineItems, comparisonItems, ["tp1", "tp2"]);

    expect(deltas).toHaveLength(2);

    // tp1: baseline=150, comparison=190
    expect(deltas[0].baselineValue).toBe(150);
    expect(deltas[0].comparisonValue).toBe(190);
    expect(deltas[0].absoluteDelta).toBe(40);
    expect(deltas[0].percentDelta).toBeCloseTo(40 / 150);

    // tp2: baseline=120, comparison=150
    expect(deltas[1].baselineValue).toBe(120);
    expect(deltas[1].comparisonValue).toBe(150);
    expect(deltas[1].absoluteDelta).toBe(30);
    expect(deltas[1].percentDelta).toBe(30 / 120);
  });

  it("handles zero baseline gracefully", () => {
    const deltas = calcScenarioDelta([], comparisonItems, ["tp1"]);
    expect(deltas[0].baselineValue).toBe(0);
    expect(deltas[0].comparisonValue).toBe(190);
    expect(deltas[0].absoluteDelta).toBe(190);
    expect(deltas[0].percentDelta).toBe(0); // can't divide by zero
  });

  it("handles empty comparison", () => {
    const deltas = calcScenarioDelta(baselineItems, [], ["tp1"]);
    expect(deltas[0].absoluteDelta).toBe(-150);
    expect(deltas[0].percentDelta).toBeCloseTo(-1);
  });
});
