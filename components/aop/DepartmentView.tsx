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
  organisation: {
    lead: { name: string; role: string };
    headcount: { current: number; planned: number };
    teams: { name: string; description: string }[];
    notes: string;
  };
  mbrHighlights: {
    wins: string[];
    misses: string[];
    risks: string[];
    asks: string[];
  };
};

// Static class maps so Tailwind can detect them at build time.
export const ACCENT_TEXT: Record<AccentKey, string> = {
  sky: "text-sky-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  violet: "text-violet-400",
};

export const ACCENT_BORDER: Record<AccentKey, string> = {
  sky: "border-sky-400",
  emerald: "border-emerald-400",
  amber: "border-amber-400",
  violet: "border-violet-400",
};

export const ACCENT_BG_SOFT: Record<AccentKey, string> = {
  sky: "bg-sky-400/10",
  emerald: "bg-emerald-400/10",
  amber: "bg-amber-400/10",
  violet: "bg-violet-400/10",
};

export const ACCENT_BG: Record<AccentKey, string> = {
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

export const MBR_CARDS: { key: keyof DepartmentConfig["mbrHighlights"]; title: string; accent: AccentKey }[] = [
  { key: "wins", title: "Wins", accent: "emerald" },
  { key: "misses", title: "Misses", accent: "amber" },
  { key: "risks", title: "Risks", accent: "sky" },
  { key: "asks", title: "Asks", accent: "violet" },
];

// ---------- Shared primitives ----------

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[#050914] text-gray-100">
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-12">{children}</div>
    </div>
  );
}

export function Section({
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

export function Card({
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

// ---------- Cover ----------

export function DepartmentCover({ config }: { config: DepartmentConfig }) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBorder = ACCENT_BORDER[config.accent];
  const accentBgSoft = ACCENT_BG_SOFT[config.accent];

  return (
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
          <h1 className="text-5xl font-bold tracking-tight text-white">{config.name}</h1>
        </div>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl">{config.tagline}</p>
      </div>
    </section>
  );
}

// ---------- Sections ----------

export function GoalsSection({ config }: { config: DepartmentConfig }) {
  const accentText = ACCENT_TEXT[config.accent];
  return (
    <Section eyebrow="FY2026 Goals" title={config.goals.headline}>
      <p className="text-gray-400">{config.goals.subhead}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {config.goals.items.map((g, i) => (
          <Card key={i} accent={config.accent}>
            <p className={`text-3xl font-bold ${accentText}`}>{g.number}</p>
            <h3 className="mt-3 text-lg font-semibold text-white">{g.title}</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">{g.description}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function RetrospectSection({ config }: { config: DepartmentConfig }) {
  return (
    <Section eyebrow="FY25 Retrospect" title="What worked, what didn't, what changes">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RETRO_CARDS.map((card) => (
          <Card key={card.key} accent={card.accent}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${ACCENT_TEXT[card.accent]}`}>
              {card.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {config.retrospect[card.key].map((line, i) => (
                <li key={i} className="text-sm text-gray-300 leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function MbrHighlightsSection({ config }: { config: DepartmentConfig }) {
  return (
    <Section eyebrow="MBR Highlights" title="Wins, misses, risks, and asks">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MBR_CARDS.map((card) => (
          <Card key={card.key} accent={card.accent}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${ACCENT_TEXT[card.accent]}`}>
              {card.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {config.mbrHighlights[card.key].map((line, i) => (
                <li key={i} className="text-sm text-gray-300 leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function InitiativesSection() {
  return (
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
              <tr key={rowIdx} className="border-t border-white/5 text-gray-400">
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
  );
}

export function KeyMetricsSection({ config }: { config: DepartmentConfig }) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBg = ACCENT_BG[config.accent];
  return (
    <>
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

      <Section eyebrow="Operating Plan" title={config.plan.title}>
        <p className="text-gray-400">{config.plan.subtitle}</p>
        <div className="mt-2 bg-[#0b1120] border-2 border-dashed border-white/15 rounded-lg p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            Data to be Inserted
          </p>
          <p className="mt-3 text-sm text-gray-400 max-w-xl">{config.plan.body}</p>
        </div>
      </Section>
    </>
  );
}

export function CompensationSection({ config }: { config: DepartmentConfig }) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBg = ACCENT_BG[config.accent];
  return (
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
      <p className={`text-xs ${accentText} mt-2`}>
        Bonus payouts follow the corporate / departmental split.
      </p>
    </Section>
  );
}

export function OrganisationSection({ config }: { config: DepartmentConfig }) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBg = ACCENT_BG[config.accent];
  const { lead, headcount, teams, notes } = config.organisation;

  return (
    <>
      <Section eyebrow="Leadership" title="Department lead">
        <Card accent={config.accent}>
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentText}`}>
            {lead.role}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{lead.name}</p>
        </Card>
      </Section>

      <Section eyebrow="Headcount" title="Current and planned">
        <div className="grid grid-cols-2 gap-4">
          <Card accent={config.accent}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Current
            </p>
            <p className={`mt-2 text-4xl font-extrabold ${accentText}`}>
              {headcount.current}
            </p>
          </Card>
          <Card accent="amber">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              FY26 Planned
            </p>
            <p className="mt-2 text-4xl font-extrabold text-amber-400">
              {headcount.planned}
            </p>
          </Card>
        </div>
      </Section>

      <Section eyebrow="Teams" title="Team structure">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t, i) => (
            <Card key={i} accent={config.accent}>
              <div className="flex items-start gap-3">
                <span className={`mt-2 h-2 w-2 rounded-full ${accentBg} shrink-0`} />
                <div>
                  <h3 className="text-base font-semibold text-white">{t.name}</h3>
                  <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Notes" title="Structure & hiring plan">
        <div className="bg-[#0b1120] border-2 border-dashed border-white/15 rounded-lg p-10 flex flex-col items-center justify-center text-center min-h-[160px]">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            Data to be Inserted
          </p>
          <p className="mt-3 text-sm text-gray-400 max-w-xl">{notes}</p>
        </div>
      </Section>
    </>
  );
}

// ---------- Top-level summary ----------

export function DepartmentSummary({ config }: { config: DepartmentConfig }) {
  const accentText = ACCENT_TEXT[config.accent];
  const accentBg = ACCENT_BG[config.accent];

  const summaryTiles = [
    { label: "Goals", value: `${config.goals.items.length}` },
    { label: "Bonus Structures", value: `${config.bonusStructures.length}` },
    { label: "Leading Metrics", value: `${config.metrics.leading.length}` },
    { label: "Teams", value: `${config.organisation.teams.length}` },
  ];

  return (
    <PageShell>
      <DepartmentCover config={config} />

      <Section eyebrow="At a glance" title="Department summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryTiles.map((tile) => (
            <Card key={tile.label} accent={config.accent}>
              <p className={`text-3xl font-bold ${accentText}`}>{tile.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {tile.label}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="What's inside" title={`${config.name} operating plan`}>
        <p className="text-gray-400 max-w-3xl">
          Use the left sub-navigation to drill into Goals, Initiatives, Key
          Metrics, Compensation, and Organisation for the {config.name} department.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Card accent={config.accent}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${accentText}`}>
              Operating Plan
            </h3>
            <p className="mt-2 text-base font-semibold text-white">{config.plan.title}</p>
            <p className="mt-1 text-sm text-gray-400">{config.plan.subtitle}</p>
          </Card>
          <Card accent={config.accent}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${accentText}`}>
              Lead
            </h3>
            <p className="mt-2 text-base font-semibold text-white">
              {config.organisation.lead.name}
            </p>
            <p className="mt-1 text-sm text-gray-400">{config.organisation.lead.role}</p>
          </Card>
        </div>
        <div className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${accentText}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${accentBg}`} />
          Pick a section on the left to continue
        </div>
      </Section>
    </PageShell>
  );
}

// ---------- Backwards-compat default export (full slide deck) ----------

export default function DepartmentView({ config }: { config: DepartmentConfig }) {
  return (
    <PageShell>
      <DepartmentCover config={config} />
      <GoalsSection config={config} />
      <InitiativesSection />
      <RetrospectSection config={config} />
      <MbrHighlightsSection config={config} />
      <KeyMetricsSection config={config} />
      <CompensationSection config={config} />
      <OrganisationSection config={config} />
    </PageShell>
  );
}
