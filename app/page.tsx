"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type Accent = "sky" | "emerald" | "amber" | "violet";

const GOALS: {
  number: string;
  value: string;
  label: string;
  caption: string;
  accent: Accent;
}[] = [
  {
    number: "01",
    value: "$4M",
    label: "Net new revenue",
    caption: "Millions of Dollars",
    accent: "emerald",
  },
  {
    number: "02",
    value: "10",
    label: "AI Gateway customers",
    caption: "Gateway activations",
    accent: "sky",
  },
  {
    number: "03",
    value: "10",
    label: "Enterprise Plan deployments",
    caption: "Production rollouts",
    accent: "violet",
  },
];

const SHORTCUTS: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: Accent;
}[] = [
  {
    href: "/sales-motion",
    eyebrow: "Sales",
    title: "Sales motions",
    description: "Pipeline, campaigns, and GTM execution across motions.",
    accent: "emerald",
  },
  {
    href: "/aop",
    eyebrow: "AOP",
    title: "Annual operating plan",
    description: "Departmental goals, retrospect, initiatives, and metrics.",
    accent: "violet",
  },
  {
    href: "/ai-showcase",
    eyebrow: "AI",
    title: "AI Showcase",
    description: "Demos, customer wins, and internal experiments.",
    accent: "sky",
  },
  {
    href: "/forecast",
    eyebrow: "Forecast",
    title: "Bottoms-up forecast",
    description: "Monthly revenue and GP by product, live and editable.",
    accent: "amber",
  },
];

const ACCENT: Record<
  Accent,
  { text: string; border: string; glow: string; dot: string }
> = {
  sky: {
    text: "text-accent-sky",
    border: "border-l-accent-sky",
    glow: "glow-sky",
    dot: "bg-accent-sky",
  },
  emerald: {
    text: "text-accent-emerald",
    border: "border-l-accent-emerald",
    glow: "glow-emerald",
    dot: "bg-accent-emerald",
  },
  amber: {
    text: "text-accent-amber",
    border: "border-l-accent-amber",
    glow: "glow-amber",
    dot: "bg-accent-amber",
  },
  violet: {
    text: "text-accent-violet",
    border: "border-l-accent-violet",
    glow: "glow-violet",
    dot: "bg-accent-violet",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] text-gray-100">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-10">
        {/* Hero */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-sky">
          FY2026
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent-sky/10 border border-accent-sky/30 flex items-center justify-center">
            <Sparkles size={22} className="text-accent-sky" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Individual Goals Tracker
          </h1>
        </div>
        <p className="mt-3 text-gray-400 max-w-2xl">
          Track the north-star metrics driving this year&rsquo;s go-to-market
          plan. Jump into a workspace to update, forecast, and report.
        </p>

        {/* Goals */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {GOALS.map((goal) => {
            const a = ACCENT[goal.accent];
            return (
              <div
                key={goal.number}
                className={`relative overflow-hidden bg-canvas-raised border border-white/5 ${a.border} border-l-4 rounded-xl p-7`}
              >
                <div
                  aria-hidden
                  className={`absolute -top-10 -right-10 h-40 w-40 rounded-full ${a.glow} blur-3xl pointer-events-none`}
                />
                <div className="relative">
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${a.text}`}
                  >
                    {goal.number} · {goal.caption}
                  </p>
                  <p
                    className={`mt-4 text-6xl font-extrabold tracking-tight ${a.text}`}
                  >
                    {goal.value}
                  </p>
                  <h2 className="mt-4 text-lg font-semibold text-white">
                    {goal.label}
                  </h2>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick shortcuts / workspaces */}
        <div className="mt-12">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400">
                Workspaces
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white tracking-tight">
                Jump back in
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SHORTCUTS.map((s) => {
              const a = ACCENT[s.accent];
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`group relative overflow-hidden bg-canvas-raised border border-white/5 ${a.border} border-l-4 rounded-xl p-6 transition-colors hover:bg-canvas-elevated`}
                >
                  <div
                    aria-hidden
                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${a.glow} blur-3xl pointer-events-none`}
                  />
                  <div className="relative">
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${a.text}`}
                    >
                      {s.eyebrow}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                      {s.description}
                    </p>
                    <p
                      className={`mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${a.text} group-hover:translate-x-1 transition-transform`}
                    >
                      Open <ArrowRight size={12} />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
