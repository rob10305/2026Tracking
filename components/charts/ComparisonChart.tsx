"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ChartContainer from "./ChartContainer";

interface ScenarioSeries {
  name: string;
  color: string;
}

interface DataPoint {
  label: string;
  [scenarioName: string]: string | number;
}

export default function ComparisonChart({
  data,
  series,
  title = "Scenario Comparison",
}: {
  data: DataPoint[];
  series: ScenarioSeries[];
  title?: string;
}) {
  return (
    <ChartContainer title={title}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v.toLocaleString()} />
        <Tooltip
          formatter={(value) => Number(value ?? 0).toLocaleString()}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend />
        {series.map((s) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
