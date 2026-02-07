"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ChartContainer from "./ChartContainer";

interface DataPoint {
  label: string;
  [category: string]: string | number;
}

interface CategoryDef {
  key: string;
  label: string;
  color: string;
}

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { key: "revenue", label: "Revenue", color: "#3b82f6" },
  { key: "cost", label: "Cost", color: "#ef4444" },
  { key: "margin", label: "Margin", color: "#22c55e" },
];

export default function MarginChart({
  data,
  categories = DEFAULT_CATEGORIES,
  title = "Category Breakdown",
}: {
  data: DataPoint[];
  categories?: CategoryDef[];
  title?: string;
}) {
  return (
    <ChartContainer title={title}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v.toLocaleString()} />
        <Tooltip
          formatter={(value) => Number(value ?? 0).toLocaleString()}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend />
        {categories.map((cat) => (
          <Bar
            key={cat.key}
            dataKey={cat.key}
            fill={cat.color}
            name={cat.label}
            stackId="stack"
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
