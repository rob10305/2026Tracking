"use client";

import React from "react";

export type AccentKey = "sky" | "emerald" | "amber" | "violet";

export type DepartmentConfig = {
  number: string;
  name: string;
  tagline: string;
  accent: AccentKey;
  goals: {
    headline: string;
    subhead: string;
    items: { number: string; title: string; description: string }[];
  };
  retrospect: {
    onTarget: string[];
    offTarget: string[];
    needChange: string[];
    lessons: string[];
  };
  metrics: {
    leading: string[];
    lagging: string[];
  };
  plan: {
    title: string;
    subtitle: string;
    body: string;
  };
  bonusStructures: {
    title: string;
    bullets: string[];
  }[];
};

// Static class maps so Tailwind can detect them at build time.
const ACCENT_TEXT: Record<AccentKey, string> = {
  sky: "text-sky-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  violet: "text-violet-400",
};

const ACCENT_BORDER: Record<AccentKey, string> = {
  sky: "border-sky-400",
  emerald: "border-emerald-400",
  amber: "border-amber-400",
  violet: "border-violet-400",
};

const ACCENT_BG_SOFT: Record<AccentKey, string> = {
  sky: "bg-sky-400/10",
  emerald: "bg-emerald-400/10",
  amber: "bg-amber-400/10",
  violet: "bg-violet-400/10",
};

const ACCENT_BG: Record<AccentKey, string> = {
  sky: "bg-sky-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  violet: "bg-violet-400",
};

const RETRO_CARDS: { key: keyof DepartmentConfig["retrospect"]; title: string; accent: AccentKey }[] = [
  { key: "onTarget", title: "On Target Results", accent: "emerald" },
  { key: "offTarget", title: "Off Target Results", accent: "amber" },
  { key: "needChange", title: "In Need of Change", accent: "sky" },
  { key: "lessons", title: "Lessons Learned", accent: "violet" },
];

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          {eyebrow}
        </p>
        {title && (
          <h2 className="mt-1 text-2xl font-semibold text-white tracking-tight">
            {title}
          </h2>
        )}
      </div>
      {children}
    </section>
  );
}

function Card({
  accent,
  className = "",
  children,
}: {
  accent?: AccentKey;
  className?: string;
  children: React.ReactNode;
}) {
  const border = accent ? `border-l-4 ${ACCENT_BORDER[accent]}` : "";
  return (
    <div
      className={`bg-[#0b1120] border border-white/5 ${border} rounded-lg p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export default function DepartmentView({ config }: { config: DepartmentConfig }) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBorder = ACCENT_BORDER[config.accent];
  const accentBgSoft = ACCENT_BG_SOFT[config.accent];
  const accentBg = ACCENT_BG[config.accent];

  return (
    <div className="min-h-full bg-[#050914] text-gray-100">
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-12">
        {/* Cover */}
        <section
          className={`relative bg-[#0b1120] border border-white/5 ${accentBorder} border-l-4 rounded-xl p-10 overflow-hidden`}
        >
          <div className={`absolute inset-y-0 right-0 w-1/3 ${accentBgSoft} blur-3xl pointer-events-none`} />
          <div className="relative">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${accentText}`}>
              FY2026 Annual Operating Plan
            </p>
            <div className="mt-6 flex items-baseline gap-6">
              <span className={`text-7xl font-extrabold tracking-tight ${accentText}`}>
                {config.number}
              </span>
              <h1 className="text-5xl font-bold tracking-tight text-white">
                {config.name}
              </h1>
            </div>
            <p className="mt-6 text-lg text-gray-400 max-w-2xl">{config.tagline}</p>
          </div>
        </section>

        {/* FY2026 Goals */}
        <Section eyebrow="FY2026 Goals" title={config.goals.headline}>
          <p className="text-gray-400">{config.goals.subhead}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {config.goals.items.map((g, i) => (
              <Card key={i} accent={config.accent}>
                <p className={`text-3xl font-bold ${accentText}`}>{g.number}</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{g.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  {g.description}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        {/* FY25 Retrospect */}
        <Section eyebrow="FY25 Retrospect" title="What worked, what didn't, what changes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RETRO_CARDS.map((card) => {
              const items = config.retrospect[card.key];
              return (
                <Card key={card.key} accent={card.accent}>
                  <h3 className={`text-sm font-semibold uppercase tracking-wider ${ACCENT_TEXT[card.accent]}`}>
                    {card.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {items.map((line, i) => (
                      <li key={i} className="text-sm text-gray-300 leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* Departmental Initiatives */}
        <Section eyebrow="Departmental Initiatives" title="Cross-quarter execution">
          <div className="bg-[#0b1120] border border-white/5 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  {["Area", "#", "Description", "Q1", "Q2", "Q3", "Q4", "Who"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-t border-white/5 text-gray-400"
                  >
                    {Array.from({ length: 8 }).map((__, colIdx) => (
                      <td key={colIdx} className="px-4 py-4">
                        <span className="block h-4" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Key Metrics & Intelligence */}
        <Section eyebrow="Key Metrics & Intelligence" title="Leading and lagging indicators">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card accent={config.accent}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${accentText}`}>
                Leading Metrics
              </h3>
              <ul className="mt-3 space-y-2">
                {config.metrics.leading.map((m, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${accentBg} shrink-0`} />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
            <Card accent="amber">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                Lagging Metrics
              </h3>
              <ul className="mt-3 space-y-2">
                {config.metrics.lagging.map((m, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        {/* Operating Plan */}
        <Section eyebrow="Operating Plan" title={config.plan.title}>
          <p className="text-gray-400">{config.plan.subtitle}</p>
          <div className="mt-2 bg-[#0b1120] border-2 border-dashed border-white/15 rounded-lg p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              Data to be Inserted
            </p>
            <p className="mt-3 text-sm text-gray-400 max-w-xl">{config.plan.body}</p>
          </div>
        </Section>

        {/* Variable Bonus Structure */}
        <Section eyebrow="Variable Bonus Structure" title="How performance ties to compensation">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.bonusStructures.map((b, i) => (
              <Card key={i} accent={config.accent}>
                <h3 className="text-base font-semibold text-white">{b.title}</h3>
                <ul className="mt-3 space-y-2">
                  {b.bullets.map((line, j) => (
                    <li key={j} className="text-sm text-gray-300 flex gap-2 leading-relaxed">
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${accentBg} shrink-0`} />
                      {line}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
