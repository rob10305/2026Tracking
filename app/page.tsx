"use client";

import Link from "next/link";

const GOALS = [
  { value: "4", label: "Millions of Dollars" },
  { value: "10", label: "AI Gateway Customers" },
  { value: "10", label: "Enterprise Plan Deployments" },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-60px)] bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">FY2026 Goals</h1>
      <p className="text-gray-500 mb-16 text-lg">What we&apos;re building toward this year</p>

      <div className="flex items-center gap-20">
        {GOALS.map((goal, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-[120px] font-extrabold leading-none text-gray-900 tracking-tight">
              {goal.value}
            </span>
            <span className="mt-4 text-lg font-medium text-gray-500 text-center max-w-[200px]">
              {goal.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-20 flex gap-4">
        <Link
          href="/forecast"
          className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Forecast Modelling
        </Link>
        <Link
          href="/cfo"
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          CFO Dashboard
        </Link>
        <Link
          href="/sales-motion"
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Sales Motions
        </Link>
      </div>
    </div>
  );
}
