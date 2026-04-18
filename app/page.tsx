"use client";

import Link from "next/link";
import { DollarSign, Cpu, Rocket, ArrowRight, Sparkles } from "lucide-react";

const GOALS = [
  {
    value: "4",
    label: "Millions of Dollars",
    accent: "from-emerald-400 via-teal-500 to-cyan-500",
    icon: DollarSign,
    caption: "Net new revenue",
  },
  {
    value: "10",
    label: "AI Gateway Customers",
    accent: "from-indigo-400 via-violet-500 to-fuchsia-500",
    icon: Cpu,
    caption: "Gateway activations",
  },
  {
    value: "10",
    label: "Enterprise Plan Deployments",
    accent: "from-amber-400 via-orange-500 to-rose-500",
    icon: Rocket,
    caption: "Production rollouts",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-12">
      {/* Decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-brand-gradient opacity-[0.08] blur-3xl" />
        <div className="absolute bottom-0 left-10 h-[300px] w-[300px] rounded-full bg-emerald-300 opacity-[0.12] blur-3xl" />
        <div className="absolute top-40 right-10 h-[260px] w-[260px] rounded-full bg-fuchsia-300 opacity-[0.10] blur-3xl" />
      </div>

      <div className="flex flex-col items-center text-center mb-14">
        <span className="chip bg-white/70 backdrop-blur border border-slate-200 text-ink-soft mb-5 shadow-soft-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          FY2026 Individual Goals Tracker
        </span>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-ink">
          FY2026 <span className="bg-brand-gradient bg-clip-text text-transparent">Goals</span>
        </h1>
        <p className="mt-3 text-lg text-ink-muted max-w-xl">
          Track the north-star metrics driving this year&apos;s go-to-market plan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl">
        {GOALS.map((goal, i) => {
          const Icon = goal.icon;
          return (
            <div
              key={i}
              className="card card-hover group relative overflow-hidden p-8 flex flex-col items-center text-center"
            >
              <div
                aria-hidden
                className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${goal.accent} opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40`}
              />
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${goal.accent} text-white shadow-soft mb-4`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.25} />
              </div>
              <span className="text-7xl sm:text-8xl font-extrabold leading-none tracking-tight text-ink">
                {goal.value}
              </span>
              <span className="mt-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">
                {goal.caption}
              </span>
              <span className="mt-1 text-base font-medium text-ink-soft max-w-[220px]">
                {goal.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
        <Link href="/sales-motion" className="btn-primary group">
          Sales Motions
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
        <Link href="/sales-motion/goals" className="btn-secondary">
          Goals
        </Link>
        <Link href="/forecast" className="btn-ghost">
          View Forecasts
        </Link>
      </div>
    </div>
  );
}
