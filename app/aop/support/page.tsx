import DepartmentView, { DepartmentConfig } from "@/components/aop/DepartmentView";

const STANDARD_BONUS_BULLETS = [
  "Corporate component (20%) - aligned to overall company objectives",
  "Departmental component (80%) - aligned to team outcomes",
  "Tracked on YTD basis, paid quarterly after quarter close",
  "Corporate payout is annual - everyone contributes (EBITDA, Net Revenue, Net ARR Bookings, Net Renewals)",
];

const SUPPORT_CONFIG: DepartmentConfig = {
  number: "04",
  name: "Support",
  tagline: "Customer experience and service excellence",
  accent: "violet",
  goals: {
    headline: "FY2026 Goals",
    subhead: "Support priorities aligned to CSAT and SLA targets",
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
      "Ticket volume / backlog",
      "First response time",
      "Self-service deflection",
      "KB coverage",
      "Agent utilization",
    ],
    lagging: [
      "CSAT",
      "SLA attainment",
      "MTTR",
      "Escalation rate",
    ],
  },
  plan: {
    title: "FY26 Support Operating Plan",
    subtitle: "Support capacity, staffing, and service-level targets",
    body: "Insert support capacity, ticket volume, and plan figures from the FY26 financial workbook.",
  },
  bonusStructures: [
    { title: "Support Team", bullets: STANDARD_BONUS_BULLETS },
  ],
};

export default function SupportAopPage() {
  return <DepartmentView config={SUPPORT_CONFIG} />;
}
