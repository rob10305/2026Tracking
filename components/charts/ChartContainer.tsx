"use client";

import React from "react";
import { ResponsiveContainer } from "recharts";

export default function ChartContainer({
  title,
  children,
  height = 350,
}: {
  title: string;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
