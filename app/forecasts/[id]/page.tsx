"use client";

import React, { useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type Handsontable from "handsontable";
import { useForecast } from "@/lib/store/forecast-context";
import ScenarioSelector from "@/components/ScenarioSelector";
import "handsontable/dist/handsontable.full.min.css";

const HotTable = dynamic(
  () =>
    import("handsontable/registry").then((reg) => {
      reg.registerAllModules();
      return import("@handsontable/react").then((mod) => mod.HotTable);
    }),
  { ssr: false, loading: () => <div className="p-8 text-gray-400">Loading grid...</div> },
);
function GridInner() {
  const { forecast, activeScenarioId, lineItems, isLoading, updateLineItems } =
    useForecast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<
    Array<{
      timePeriodId: string;
      category: string;
      subcategory?: string;
      value: number;
    }>
  >([]);

  const timePeriods = forecast?.timePeriods ?? [];

  // Build a map of timePeriodId:category:subcategory -> value
  const valueMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const li of lineItems) {
      map[`${li.timePeriodId}::${li.category}::${li.subcategory}`] = li.value;
    }
    return map;
  }, [lineItems]);

  // Discover unique row keys (category + subcategory combinations)
  const rowKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const li of lineItems) {
      keys.add(`${li.category}::${li.subcategory}`);
    }
    // Always have at least one row
    if (keys.size === 0) {
      keys.add("revenue::");
    }
    return Array.from(keys).sort();
  }, [lineItems]);

  // Build grid data
  const data = useMemo(() => {
    const rows: (string | number)[][] = [];
    for (const rk of rowKeys) {
      const [cat, sub] = rk.split("::");
      const label = sub ? `${cat} — ${sub}` : cat;
      const row: (string | number)[] = [label];
      let total = 0;
      for (const tp of timePeriods) {
        const val = valueMap[`${tp.id}::${cat}::${sub}`] ?? 0;
        row.push(val);
        total += val;
      }
      row.push(total);
      rows.push(row);
    }

    // Total row
    if (rows.length > 1) {
      const totalRow: (string | number)[] = ["TOTAL"];
      for (let col = 0; col < timePeriods.length; col++) {
        let colSum = 0;
        for (const r of rows) {
          colSum += (r[col + 1] as number) || 0;
        }
        totalRow.push(colSum);
      }
      let grandTotal = 0;
      for (const r of rows) {
        grandTotal += (r[rows[0].length - 1] as number) || 0;
      }
      totalRow.push(grandTotal);
      rows.push(totalRow);
    }

    return rows;
  }, [rowKeys, timePeriods, valueMap]);

  const colHeaders = useMemo(
    () => ["Category", ...timePeriods.map((tp) => tp.label), "Total"],
    [timePeriods],
  );

  const columns = useMemo(() => {
    const cols: Array<{ type: string; readOnly?: boolean; width: number }> = [
      { type: "text", readOnly: true, width: 180 },
    ];
    for (let i = 0; i < timePeriods.length; i++) {
      cols.push({ type: "numeric", width: 80 });
    }
    cols.push({ type: "numeric", readOnly: true, width: 80 });
    return cols;
  }, [timePeriods]);

  const handleAfterChange = useCallback(
    (changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => {
      if (!changes || source === "loadData") return;

      for (const [row, col, , newVal] of changes) {
        if (row >= rowKeys.length) continue;
        if (typeof col !== "number" || col < 1 || col > timePeriods.length) continue;

        const [cat, sub] = rowKeys[row].split("::");
        const tp = timePeriods[col - 1];
        const val = parseFloat(String(newVal)) || 0;

        pendingRef.current.push({
          timePeriodId: tp.id,
          category: cat,
          subcategory: sub || "",
          value: val,
        });
      }

      // Debounce the API call
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (pendingRef.current.length > 0) {
          updateLineItems([...pendingRef.current]);
          pendingRef.current = [];
        }
      }, 300);
    },
    [rowKeys, timePeriods, updateLineItems],
  );

  const cells = useCallback(
    (row: number, col: number): Handsontable.CellProperties => {
      const props: Partial<Handsontable.CellProperties> = {};
      // Total row
      if (data.length > 1 && row === data.length - 1) {
        props.readOnly = true;
        props.className = "font-semibold bg-gray-100";
      }
      return props as Handsontable.CellProperties;
    },
    [data.length],
  );

  if (isLoading) {
    return <div className="p-8 text-gray-400">Loading forecast data...</div>;
  }

  if (!forecast) {
    return <div className="p-8 text-red-500">Forecast not found.</div>;
  }

  if (timePeriods.length === 0) {
    return (
      <div className="p-8 text-gray-500 text-center">
        No time periods configured. Go to Settings to configure the date range.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <ScenarioSelector />
      </div>
      <HotTable
        data={data}
        colHeaders={colHeaders}
        columns={columns}
        rowHeaders={false}
        width="100%"
        height="auto"
        stretchH="all"
        licenseKey="non-commercial-and-evaluation"
        afterChange={handleAfterChange}
        cells={cells}
        contextMenu={false}
        manualColumnResize={true}
        fillHandle={true}
        undo={true}
        className="htLeft"
      />
    </div>
  );
}

export default function ForecastDetailPage() {
  return <GridInner />;
}
