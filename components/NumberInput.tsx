"use client";

import React from "react";

export default function NumberInput({
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step ?? 1}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
        {suffix && <span className="text-gray-400 text-xs">{suffix}</span>}
      </div>
    </label>
  );
}
