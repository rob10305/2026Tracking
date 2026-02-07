/**
 * Pure functions for scenario comparison calculations.
 */

export interface ScenarioTotal {
  scenarioId: string;
  scenarioName: string;
  totalByPeriod: Record<string, number>; // timePeriodId -> sum of values
  grandTotal: number;
}

export interface ScenarioDelta {
  timePeriodId: string;
  baselineValue: number;
  comparisonValue: number;
  absoluteDelta: number;
  percentDelta: number; // 0-based (e.g., 0.25 = +25%)
}

interface LineItem {
  scenarioId: string;
  timePeriodId: string;
  category: string;
  subcategory: string;
  value: number;
}

/**
 * Calculate totals for each scenario grouped by time period.
 */
export function calcScenarioTotals(
  lineItems: LineItem[],
  scenarios: Array<{ id: string; name: string }>,
): ScenarioTotal[] {
  const totals: ScenarioTotal[] = scenarios.map((s) => ({
    scenarioId: s.id,
    scenarioName: s.name,
    totalByPeriod: {},
    grandTotal: 0,
  }));

  const scenarioMap = new Map(totals.map((t) => [t.scenarioId, t]));

  for (const li of lineItems) {
    const t = scenarioMap.get(li.scenarioId);
    if (!t) continue;
    t.totalByPeriod[li.timePeriodId] =
      (t.totalByPeriod[li.timePeriodId] ?? 0) + li.value;
    t.grandTotal += li.value;
  }

  return totals;
}

/**
 * Calculate deltas between a baseline scenario and a comparison scenario.
 */
export function calcScenarioDelta(
  baselineItems: LineItem[],
  comparisonItems: LineItem[],
  timePeriodIds: string[],
): ScenarioDelta[] {
  // Sum values per time period for each scenario
  const baseMap = new Map<string, number>();
  for (const li of baselineItems) {
    baseMap.set(li.timePeriodId, (baseMap.get(li.timePeriodId) ?? 0) + li.value);
  }

  const compMap = new Map<string, number>();
  for (const li of comparisonItems) {
    compMap.set(li.timePeriodId, (compMap.get(li.timePeriodId) ?? 0) + li.value);
  }

  return timePeriodIds.map((tpId) => {
    const baselineValue = baseMap.get(tpId) ?? 0;
    const comparisonValue = compMap.get(tpId) ?? 0;
    const absoluteDelta = comparisonValue - baselineValue;
    const percentDelta = baselineValue !== 0 ? absoluteDelta / baselineValue : 0;

    return {
      timePeriodId: tpId,
      baselineValue,
      comparisonValue,
      absoluteDelta,
      percentDelta,
    };
  });
}
