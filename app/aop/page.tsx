"use client";

import Link from "next/link";

const TILES = [
  {
    number: "01",
    name: "CS",
    href: "/aop/cs",
    tagline: "Retention, expansion, and customer health",
    accentText: "text-sky-400",
    accentBorder: "border-sky-400",
    glow: "bg-sky-400/10",
  },
  {
    number: "02",
    name: "Sales",
    href: "/aop/sales",
    tagline: "Pipeline, bookings, and go-to-market execution",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-400",
    glow: "bg-emerald-400/10",
  },
  {
    number: "03",
    name: "Partner",
    href: "/aop/partner",
    tagline: "Channel, co-sell, and ecosystem growth",
    accentText: "text-amber-400",
    accentBorder: "border-amber-400",
    glow: "bg-amber-400/10",
  },
  {
    number: "04",
    name: "Support",
    href: "/aop/support",
    tagline: "Customer experience and service excellence",
    accentText: "text-violet-400",
    accentBorder: "border-violet-400",
    glow: "bg-violet-400/10",
  },
];

export default function AopOverviewPage() {
  return (
    <div className="min-h-full bg-[#050914] text-gray-100">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">
          FY2026
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white tracking-tight">
          Annual Operating Plan
        </h1>
        <p className="mt-3 text-gray-400 max-w-2xl">
          Departmental operating plans aligned to the FY2026 strategy. Choose a
          department to view goals, retrospect, initiatives, metrics, and
          variable bonus structures.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className={`relative overflow-hidden bg-[#0b1120] border border-white/5 ${tile.accentBorder} border-l-4 rounded-xl p-7 transition-all hover:bg-[#101a30] group`}
            >
              <div
                className={`absolute -top-10 -right-10 h-40 w-40 rounded-full ${tile.glow} blur-3xl pointer-events-none`}
              />
              <div className="relative">
                <p className={`text-5xl font-extrabold tracking-tight ${tile.accentText}`}>
                  {tile.number}
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  {tile.name}
                </h2>
                <p className="mt-2 text-sm text-gray-400">{tile.tagline}</p>
                <p className={`mt-6 text-xs font-semibold uppercase tracking-[0.2em] ${tile.accentText} group-hover:translate-x-1 transition-transform`}>
                  Open department →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
