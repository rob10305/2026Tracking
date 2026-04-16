import DepartmentView, { DepartmentConfig } from "@/components/aop/DepartmentView";

const STANDARD_BONUS_BULLETS = [
  "Corporate component (20%) - aligned to overall company objectives",
  "Departmental component (80%) - aligned to team outcomes",
  "Tracked on YTD basis, paid quarterly after quarter close",
  "Corporate payout is annual - everyone contributes (EBITDA, Net Revenue, Net ARR Bookings, Net Renewals)",
];

const SALES_CONFIG: DepartmentConfig = {
  number: "02",
  name: "Sales",
  tagline: "Pipeline, bookings, and go-to-market execution",
  accent: "emerald",
  goals: {
    headline: "FY2026 Goals",
    subhead: "Sales priorities aligned to the $36M revenue plan",
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
};

export default function SalesAopPage() {
  return <DepartmentView config={SALES_CONFIG} />;
}
