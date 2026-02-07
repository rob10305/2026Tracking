"use client";

import React, { useMemo, useCallback, useRef } from "react";
import { HotTable, HotTableClass } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import type Handsontable from "handsontable";
import { useStore } from "@/lib/store/context";
import { MONTHS_2026, MONTH_LABELS, forecastKey } from "@/lib/models/types";

registerAllModules();

interface ForecastGridProps {
  onSelectProduct: (productId: string | null) => void;
}

export default function ForecastGrid({ onSelectProduct }: ForecastGridProps) {
  const { state, setForecastBulk } = useStore();
  const hotRef = useRef<HotTableClass>(null);

  const products = state.products;

  // Build grid data: each row = [productName, jan, feb, ..., dec, total]
  const data = useMemo(() => {
    const rows: (string | number)[][] = [];
    for (const p of products) {
      const row: (string | number)[] = [p.name];
      let total = 0;
      for (const m of MONTHS_2026) {
        const qty =
          state.forecastByProductIdMonth[forecastKey(p.id, m)] ?? 0;
        row.push(qty);
        total += qty;
      }
      row.push(total);
      rows.push(row);
    }
    // Totals row
    const totalRow: (string | number)[] = ["TOTAL"];
    let grandTotal = 0;
    for (let col = 0; col < 12; col++) {
      let colSum = 0;
      for (const r of rows) {
        colSum += (r[col + 1] as number) || 0;
      }
      totalRow.push(colSum);
      grandTotal += colSum;
    }
    totalRow.push(grandTotal);
    rows.push(totalRow);
    return rows;
  }, [products, state.forecastByProductIdMonth]);

  const colHeaders = ["Product", ...MONTH_LABELS, "Total"];

  const columns = useMemo(() => {
    const cols: Handsontable.ColumnSettings[] = [
      { type: "text", readOnly: true, width: 180 },
    ];
    for (let i = 0; i < 12; i++) {
      cols.push({ type: "numeric", width: 65 });
    }
    cols.push({ type: "numeric", readOnly: true, width: 70 });
    return cols;
  }, []);

  const handleAfterChange = useCallback(
    (
      changes: Handsontable.CellChange[] | null,
      source: Handsontable.ChangeSource,
    ) => {
      if (!changes || source === "loadData") return;

      const entries: { productId: string; month: string; qty: number }[] = [];
      for (const [row, col, , newVal] of changes) {
        // Skip total row and product name / total columns
        if (row >= products.length) continue;
        if (typeof col !== "number" || col < 1 || col > 12) continue;

        const product = products[row];
        const month = MONTHS_2026[col - 1];
        const qty = parseInt(String(newVal), 10);
        entries.push({
          productId: product.id,
          month,
          qty: isNaN(qty) ? 0 : qty,
        });
      }

      if (entries.length > 0) {
        setForecastBulk(entries);
      }
    },
    [products, setForecastBulk],
  );

  const handleAfterSelectionEnd = useCallback(
    (row: number) => {
      if (row >= 0 && row < products.length) {
        onSelectProduct(products[row].id);
      } else {
        onSelectProduct(null);
      }
    },
    [products, onSelectProduct],
  );

  const cells = useCallback(
    (row: number, col: number): Handsontable.CellProperties => {
      const props: Partial<Handsontable.CellProperties> = {};
      // Total row is read-only
      if (row === products.length) {
        props.readOnly = true;
        props.className = "font-semibold bg-gray-100";
      }
      return props as Handsontable.CellProperties;
    },
    [products.length],
  );

  if (products.length === 0) {
    return (
      <div className="text-gray-500 p-8 text-center">
        No products configured. Go to{" "}
        <a href="/settings" className="text-blue-600 underline">
          Settings
        </a>{" "}
        to add products.
      </div>
    );
  }

  return (
    <HotTable
      ref={hotRef}
      data={data}
      colHeaders={colHeaders}
      columns={columns}
      rowHeaders={false}
      width="100%"
      height="auto"
      stretchH="all"
      licenseKey="non-commercial-and-evaluation"
      afterChange={handleAfterChange}
      afterSelectionEnd={handleAfterSelectionEnd}
      cells={cells}
      contextMenu={false}
      manualColumnResize={true}
      autoWrapRow={true}
      autoWrapCol={true}
      fillHandle={true}
      undo={true}
      className="htLeft"
    />
  );
}
