"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useForecast } from "@/lib/store/forecast-context";

const RevenueChart = dynamic(() => import("@/components/charts/RevenueChart"), {
  ssr: false,
  loading: () => <div className="h-[350px] bg-gray-50 rounded-lg animate-pulse" />,
});

const ComparisonChart = dynamic(
  () => import("@/components/charts/ComparisonChart"),
  {
    ssr: false,
    loading: () => <div className="h-[350px] bg-gray-50 rounded-lg animate-pulse" />,
  },
);

const MarginChart = dynamic(() => import("@/components/charts/MarginChart"), {
  ssr: false,
  loading: () => <div className="h-[350px] bg-gray-50 rounded-lg animate-pulse" />,
});

interface LineItem {
  scenarioId: string;
  timePeriodId: string;
  category: string;
  subcategory: string;
  value: number;
}

export default function ChartsPage() {
  const { forecast, activeScenarioId, lineItems } = useForecast();
  const [allLineItems, setAllLineItems] = useState<LineItem[]>([]);

  const timePeriods = forecast?.timePeriods ?? [];
  const scenarios = forecast?.scenarios ?? [];

  // Fetch all scenario line items for comparison chart
  useEffect(() => {
    if (!forecast || scenarios.length <= 1) return;
    const fetchAll = async () => {
      const items: LineItem[] = [];
      for (const s of scenarios) {
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
  }, [forecast, scenarios]);

  // Revenue over time for active scenario
  const revenueData = useMemo(() => {
    return timePeriods.map((tp) => {
      let value = 0;
      for (const li of lineItems) {
        if (li.timePeriodId === tp.id) value += li.value;
      }
      return { label: tp.label, value };
    });
  }, [timePeriods, lineItems]);

  // Category breakdown per period
  const categoryData = useMemo(() => {
    const categories = new Set<string>();
    for (const li of lineItems) categories.add(li.category);

    return timePeriods.map((tp) => {
      const point: { label: string; [key: string]: string | number } = { label: tp.label };
      for (const cat of categories) {
        let sum = 0;
        for (const li of lineItems) {
          if (li.timePeriodId === tp.id && li.category === cat) {
            sum += li.value;
          }
        }
        point[cat] = sum;
      }
      return point;
    });
  }, [timePeriods, lineItems]);

  const categoryDefs = useMemo(() => {
    const categories = new Set<string>();
    for (const li of lineItems) categories.add(li.category);
    const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];
    return Array.from(categories).map((cat, i) => ({
      key: cat,
      label: cat,
      color: colors[i % colors.length],
    }));
  }, [lineItems]);

  // Comparison chart data (all scenarios)
  const comparisonData = useMemo(() => {
    if (scenarios.length <= 1) return [];
    return timePeriods.map((tp) => {
      const point: { label: string; [key: string]: string | number } = { label: tp.label };
      for (const s of scenarios) {
        let sum = 0;
        for (const li of allLineItems) {
          if (li.scenarioId === s.id && li.timePeriodId === tp.id) {
            sum += li.value;
          }
        }
        point[s.name] = sum;
      }
      return point;
    });
  }, [timePeriods, scenarios, allLineItems]);

  const comparisonSeries = useMemo(
    () => scenarios.map((s) => ({ name: s.name, color: s.color })),
    [scenarios],
  );

  if (!forecast) {
    return <div className="text-gray-400">Loading...</div>;
  }

  const hasData = lineItems.length > 0;

  return (
    <div className="space-y-6">
      {!hasData && (
        <div className="text-center py-12 text-gray-500">
          <p>No data to chart yet. Enter values in the Grid tab first.</p>
        </div>
      )}

      {hasData && (
        <>
          <RevenueChart data={revenueData} title="Total Values Over Time" />

          {categoryDefs.length > 1 && (
            <MarginChart
              data={categoryData}
              categories={categoryDefs}
              title="Category Breakdown"
            />
          )}

          {scenarios.length > 1 && comparisonData.length > 0 && (
            <ComparisonChart
              data={comparisonData}
              series={comparisonSeries}
              title="Scenario Comparison"
            />
          )}
        </>
      )}
    </div>
  );
}
