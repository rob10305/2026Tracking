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
  value: number;
}

export default function RevenueChart({
  data,
  title = "Revenue Over Time",
}: {
  data: DataPoint[];
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
        <Bar dataKey="value" fill="#3b82f6" name="Value" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
