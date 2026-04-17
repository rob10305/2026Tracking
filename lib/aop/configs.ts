import type { AccentKey, DepartmentConfig } from "@/components/aop/DepartmentView";

export type DepartmentSlug = "cs" | "sales" | "partner" | "support";

export type SectionSlug =
  | "goals"
  | "initiatives"
  | "retrospect"
  | "mbr-highlights"
  | "key-metrics"
  | "compensation"
  | "organisation";

export type SectionMeta = {
  slug: SectionSlug;
  label: string;
};

export const SECTIONS: SectionMeta[] = [
  { slug: "goals", label: "Goals" },
  { slug: "initiatives", label: "Initiatives" },
  { slug: "retrospect", label: "FY25 Retrospect" },
  { slug: "mbr-highlights", label: "MBR Highlights" },
  { slug: "key-metrics", label: "Key Metrics" },
  { slug: "compensation", label: "Compensation" },
  { slug: "organisation", label: "Organisation" },
];

export type DepartmentMeta = {
  slug: DepartmentSlug;
  number: string;
  name: string;
  href: string;
  accent: AccentKey;
  accentText: string;
  accentBg: string;
};

export const DEPARTMENTS: DepartmentMeta[] = [
  { slug: "cs", number: "01", name: "CS", href: "/aop/cs", accent: "sky", accentText: "text-sky-400", accentBg: "bg-sky-400" },
  { slug: "sales", number: "02", name: "Sales", href: "/aop/sales", accent: "emerald", accentText: "text-emerald-400", accentBg: "bg-emerald-400" },
  { slug: "partner", number: "03", name: "Partner", href: "/aop/partner", accent: "amber", accentText: "text-amber-400", accentBg: "bg-amber-400" },
  { slug: "support", number: "04", name: "Support", href: "/aop/support", accent: "violet", accentText: "text-violet-400", accentBg: "bg-violet-400" },
];

const STANDARD_BONUS_BULLETS = [
  "Corporate component (20%) - aligned to overall company objectives",
  "Departmental component (80%) - aligned to team outcomes",
  "Tracked on YTD basis, paid quarterly after quarter close",
  "Corporate payout is annual - everyone contributes (EBITDA, Net Revenue, Net ARR Bookings, Net Renewals)",
];

const PLACEHOLDER_GOAL = {
  title: "Goal Title",
  description:
    "Describe the specific FY26 objective, target metric, and why it matters to the plan.",
};

const PLACEHOLDER_FINDING = ["Insert key findings here."];

const PLACEHOLDER_MBR = ["Insert highlight here."];

const PLACEHOLDER_LEAD = { name: "TBD", role: "Department Lead" };

const PLACEHOLDER_ORG_NOTE =
  "Insert team structure, reporting lines, and FY26 hiring plan.";

export const CONFIGS: Record<DepartmentSlug, DepartmentConfig> = {
  cs: {
    number: "01",
    name: "CS",
    tagline: "Retention, expansion, and customer health",
    accent: "sky",
    goals: {
      headline: "FY2026 Goals",
      subhead: "CS priorities aligned to retention and expansion targets",
      items: [
        { number: "01", ...PLACEHOLDER_GOAL },
        { number: "02", ...PLACEHOLDER_GOAL },
        { number: "03", ...PLACEHOLDER_GOAL },
      ],
    },
    retrospect: {
      onTarget: PLACEHOLDER_FINDING,
      offTarget: PLACEHOLDER_FINDING,
      needChange: PLACEHOLDER_FINDING,
      lessons: PLACEHOLDER_FINDING,
    },
    mbrHighlights: {
      wins: PLACEHOLDER_MBR,
      misses: PLACEHOLDER_MBR,
      risks: PLACEHOLDER_MBR,
      asks: PLACEHOLDER_MBR,
    },
    metrics: {
      leading: [
        "Customer health scores",
        "Product adoption",
        "Engagement frequency",
        "EBR cadence",
        "Time-to-value",
      ],
      lagging: ["GRR", "NRR", "Logo churn", "Expansion ARR"],
    },
    plan: {
      title: "FY26 Retention & Expansion Plan",
      subtitle: "Retention and expansion targets by segment and cohort",
      body: "Insert retention, expansion, and plan figures from the FY26 financial workbook.",
    },
    bonusStructures: [{ title: "CS Managers", bullets: STANDARD_BONUS_BULLETS }],
    organisation: {
      lead: PLACEHOLDER_LEAD,
      headcount: { current: 0, planned: 0 },
      teams: [
        { name: "Customer Success Managers", description: "Account health, EBRs, retention" },
        { name: "Onboarding & Enablement", description: "Time-to-value, training" },
      ],
      notes: PLACEHOLDER_ORG_NOTE,
    },
  },
  sales: {
    number: "02",
    name: "Sales",
    tagline: "Pipeline, bookings, and go-to-market execution",
    accent: "emerald",
    goals: {
      headline: "FY2026 Goals",
      subhead: "Sales priorities aligned to the $36M revenue plan",
      items: [
        { number: "01", ...PLACEHOLDER_GOAL },
        { number: "02", ...PLACEHOLDER_GOAL },
        { number: "03", ...PLACEHOLDER_GOAL },
      ],
    },
    retrospect: {
      onTarget: PLACEHOLDER_FINDING,
      offTarget: PLACEHOLDER_FINDING,
      needChange: PLACEHOLDER_FINDING,
      lessons: PLACEHOLDER_FINDING,
    },
    mbrHighlights: {
      wins: PLACEHOLDER_MBR,
      misses: PLACEHOLDER_MBR,
      risks: PLACEHOLDER_MBR,
      asks: PLACEHOLDER_MBR,
    },
    metrics: {
      leading: [
        "Sales pipeline size",
        "Lead generation rate",
        "Conversion rates",
        "Sales activity metrics",
        "Lead quality",
      ],
      lagging: [
        "Sales bookings",
        "Sales conversion cycle length",
        "Win rate",
        "Sales team performance",
      ],
    },
    plan: {
      title: "FY26 Bookings Plan",
      subtitle: "Bookings targets by segment, geography, and product",
      body: "Insert bookings, actuals, and plan figures from the FY26 financial workbook.",
    },
    bonusStructures: [
      { title: "Commission", bullets: STANDARD_BONUS_BULLETS },
      { title: "Partner", bullets: STANDARD_BONUS_BULLETS },
      { title: "Pre-Sales", bullets: STANDARD_BONUS_BULLETS },
    ],
    organisation: {
      lead: PLACEHOLDER_LEAD,
      headcount: { current: 0, planned: 0 },
      teams: [
        { name: "Account Executives", description: "New logo and expansion bookings" },
        { name: "Sales Development", description: "Outbound and inbound qualification" },
        { name: "Pre-Sales / Solutions", description: "Technical wins and POCs" },
      ],
      notes: PLACEHOLDER_ORG_NOTE,
    },
  },
  partner: {
    number: "03",
    name: "Partner",
    tagline: "Channel, co-sell, and ecosystem growth",
    accent: "amber",
    goals: {
      headline: "FY2026 Goals",
      subhead: "Partner priorities aligned to channel-sourced growth",
      items: [
        { number: "01", ...PLACEHOLDER_GOAL },
        { number: "02", ...PLACEHOLDER_GOAL },
        { number: "03", ...PLACEHOLDER_GOAL },
      ],
    },
    retrospect: {
      onTarget: PLACEHOLDER_FINDING,
      offTarget: PLACEHOLDER_FINDING,
      needChange: PLACEHOLDER_FINDING,
      lessons: PLACEHOLDER_FINDING,
    },
    mbrHighlights: {
      wins: PLACEHOLDER_MBR,
      misses: PLACEHOLDER_MBR,
      risks: PLACEHOLDER_MBR,
      asks: PLACEHOLDER_MBR,
    },
    metrics: {
      leading: [
        "Active partner count",
        "Partner-sourced pipeline",
        "Co-sell volume",
        "Certifications",
        "Joint marketing",
      ],
      lagging: [
        "Partner-sourced bookings",
        "Partner-influenced revenue",
        "Tier progression",
        "Partner satisfaction",
      ],
    },
    plan: {
      title: "FY26 Partner Bookings Plan",
      subtitle: "Partner bookings targets by tier, region, and motion",
      body: "Insert partner bookings, actuals, and plan figures from the FY26 financial workbook.",
    },
    bonusStructures: [{ title: "Channel Managers", bullets: STANDARD_BONUS_BULLETS }],
    organisation: {
      lead: PLACEHOLDER_LEAD,
      headcount: { current: 0, planned: 0 },
      teams: [
        { name: "Channel Managers", description: "Partner recruitment and management" },
        { name: "Partner Marketing", description: "Joint marketing and co-sell programs" },
      ],
      notes: PLACEHOLDER_ORG_NOTE,
    },
  },
  support: {
    number: "04",
    name: "Support",
    tagline: "Customer experience and service excellence",
    accent: "violet",
    goals: {
      headline: "FY2026 Goals",
      subhead: "Support priorities aligned to CSAT and SLA targets",
      items: [
        { number: "01", ...PLACEHOLDER_GOAL },
        { number: "02", ...PLACEHOLDER_GOAL },
        { number: "03", ...PLACEHOLDER_GOAL },
      ],
    },
    retrospect: {
      onTarget: PLACEHOLDER_FINDING,
      offTarget: PLACEHOLDER_FINDING,
      needChange: PLACEHOLDER_FINDING,
      lessons: PLACEHOLDER_FINDING,
    },
    mbrHighlights: {
      wins: PLACEHOLDER_MBR,
      misses: PLACEHOLDER_MBR,
      risks: PLACEHOLDER_MBR,
      asks: PLACEHOLDER_MBR,
    },
    metrics: {
      leading: [
        "Ticket volume / backlog",
        "First response time",
        "Self-service deflection",
        "KB coverage",
        "Agent utilization",
      ],
      lagging: ["CSAT", "SLA attainment", "MTTR", "Escalation rate"],
    },
    plan: {
      title: "FY26 Support Operating Plan",
      subtitle: "Support capacity, staffing, and service-level targets",
      body: "Insert support capacity, ticket volume, and plan figures from the FY26 financial workbook.",
    },
    bonusStructures: [{ title: "Support Team", bullets: STANDARD_BONUS_BULLETS }],
    organisation: {
      lead: PLACEHOLDER_LEAD,
      headcount: { current: 0, planned: 0 },
      teams: [
        { name: "Tier 1 Support", description: "Front-line ticket triage and resolution" },
        { name: "Tier 2 / Escalations", description: "Complex issues and engineering bridge" },
        { name: "Knowledge & Self-Service", description: "KB content and deflection programs" },
      ],
      notes: PLACEHOLDER_ORG_NOTE,
    },
  },
};

export function getDepartment(slug: string): DepartmentMeta | undefined {
  return DEPARTMENTS.find((d) => d.slug === slug);
}

export function getConfig(slug: string): DepartmentConfig | undefined {
  return (CONFIGS as Record<string, DepartmentConfig>)[slug];
}

export function isSection(slug: string): slug is SectionSlug {
  return SECTIONS.some((s) => s.slug === slug);
}
