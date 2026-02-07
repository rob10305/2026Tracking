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
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
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
          disabled={disabled}
          className={`w-full border border-gray-300 rounded px-2 py-1 text-sm ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
        />
        {suffix && <span className="text-gray-400 text-xs">{suffix}</span>}
      </div>
    </label>
  );
}
