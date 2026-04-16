import DepartmentView, { DepartmentConfig } from "@/components/aop/DepartmentView";

const STANDARD_BONUS_BULLETS = [
  "Corporate component (20%) - aligned to overall company objectives",
  "Departmental component (80%) - aligned to team outcomes",
  "Tracked on YTD basis, paid quarterly after quarter close",
  "Corporate payout is annual - everyone contributes (EBITDA, Net Revenue, Net ARR Bookings, Net Renewals)",
];

const CS_CONFIG: DepartmentConfig = {
  number: "01",
  name: "CS",
  tagline: "Retention, expansion, and customer health",
  accent: "sky",
  goals: {
    headline: "FY2026 Goals",
    subhead: "CS priorities aligned to retention and expansion targets",
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
      "Customer health scores",
      "Product adoption",
      "Engagement frequency",
      "EBR cadence",
      "Time-to-value",
    ],
    lagging: [
      "GRR",
      "NRR",
      "Logo churn",
      "Expansion ARR",
    ],
  },
  plan: {
    title: "FY26 Retention & Expansion Plan",
    subtitle: "Retention and expansion targets by segment and cohort",
    body: "Insert retention, expansion, and plan figures from the FY26 financial workbook.",
  },
  bonusStructures: [
    { title: "CS Managers", bullets: STANDARD_BONUS_BULLETS },
  ],
};

export default function CsAopPage() {
  return <DepartmentView config={CS_CONFIG} />;
}
