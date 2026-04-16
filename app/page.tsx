"use client";

import Link from "next/link";

const GOALS = [
  {
    value: "4",
    label: "Millions of Dollars",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-400",
    accentGlow: "bg-emerald-400/10",
  },
  {
    value: "10",
    label: "AI Gateway Customers",
    accentText: "text-sky-400",
    accentBorder: "border-sky-400",
    accentGlow: "bg-sky-400/10",
  },
  {
    value: "10",
    label: "Enterprise Plan Deployments",
    accentText: "text-amber-400",
    accentBorder: "border-amber-400",
    accentGlow: "bg-amber-400/10",
  },
];

export default function HomePage() {
  return (
    <div className="-m-4 min-h-[calc(100vh-60px)] bg-[#050914] text-gray-100">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">
          FY2026
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">
          Annual Goals
        </h1>
        <p className="mt-3 text-gray-400 max-w-2xl">
          Top-line individual targets for FY2026 — tracked across the GTM,
          product, and operating plans.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {GOALS.map((goal, i) => (
            <div
              key={i}
              className={`relative overflow-hidden bg-[#0b1120] border border-white/5 ${goal.accentBorder} border-l-4 rounded-xl p-8`}
            >
              <div
                className={`absolute -top-12 -right-12 h-44 w-44 rounded-full ${goal.accentGlow} blur-3xl pointer-events-none`}
              />
              <div className="relative">
                <span
                  className={`block text-[110px] font-extrabold leading-none tracking-tight ${goal.accentText}`}
                >
                  {goal.value}
                </span>
                <span className="mt-4 block text-sm font-medium text-gray-400">
                  {goal.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/sales-motion"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-400 text-[#050914] rounded-lg text-sm font-semibold hover:bg-emerald-300 transition-colors"
          >
            Sales Motions →
          </Link>
          <Link
            href="/aop"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0b1120] border border-white/10 text-gray-200 rounded-lg text-sm font-semibold hover:bg-[#101a30] transition-colors"
          >
            Annual Operating Plan
          </Link>
          <Link
            href="/sales-motion/goals"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0b1120] border border-white/10 text-gray-200 rounded-lg text-sm font-semibold hover:bg-[#101a30] transition-colors"
          >
            Goals
          </Link>
        </div>
      </div>
    </div>
  );
}
