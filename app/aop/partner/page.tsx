import DepartmentView, { DepartmentConfig } from "@/components/aop/DepartmentView";

const STANDARD_BONUS_BULLETS = [
  "Corporate component (20%) - aligned to overall company objectives",
  "Departmental component (80%) - aligned to team outcomes",
  "Tracked on YTD basis, paid quarterly after quarter close",
  "Corporate payout is annual - everyone contributes (EBITDA, Net Revenue, Net ARR Bookings, Net Renewals)",
];

const PARTNER_CONFIG: DepartmentConfig = {
  number: "03",
  name: "Partner",
  tagline: "Channel, co-sell, and ecosystem growth",
  accent: "amber",
  goals: {
    headline: "FY2026 Goals",
    subhead: "Partner priorities aligned to channel-sourced growth",
    items: [
      {
        number: "01",
        title: "Goal Title",
        description:
          "Describe the specific FY26 objective, target metric, and why it matters to the plan.",
      },
      {
        number: "02",
        title: "Goal Title",
        description:
          "Describe the specific FY26 objective, target metric, and why it matters to the plan.",
      },
      {
        number: "03",
        title: "Goal Title",
        description:
          "Describe the specific FY26 objective, target metric, and why it matters to the plan.",
      },
    ],
  },
  retrospect: {
    onTarget: ["Insert key findings here."],
    offTarget: ["Insert key findings here."],
    needChange: ["Insert key findings here."],
    lessons: ["Insert key findings here."],
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
  bonusStructures: [
    { title: "Channel Managers", bullets: STANDARD_BONUS_BULLETS },
  ],
};

export default function PartnerAopPage() {
  return <DepartmentView config={PARTNER_CONFIG} />;
}
