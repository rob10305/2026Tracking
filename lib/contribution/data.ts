export const CONTRIBUTION_MONTHS = [
  "2026-04", "2026-05", "2026-06", "2026-07", "2026-08",
  "2026-09", "2026-10", "2026-11", "2026-12",
] as const;

export const CONTRIBUTION_MONTH_LABELS = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type ContributionMonth = typeof CONTRIBUTION_MONTHS[number];

export const CONTRIBUTORS = [
  { id: "jaime",           name: "Jaime",   team: "CS",      color: "cs",      photo: "/avatars/jaime.jpeg" },
  { id: "danielr-cs",      name: "DanielG", team: "CS",      color: "cs",      photo: "/avatars/danielr-cs.jpeg" },
  { id: "mike",            name: "Mike",    team: "Sales",   color: "sales",   photo: "/avatars/mike.jpeg" },
  { id: "shane",           name: "Shane",   team: "Sales",   color: "sales",   photo: "/avatars/shane.jpeg" },
  { id: "danielr-partner", name: "DanielR", team: "Partner", color: "partner", photo: "/avatars/danielr-partner.jpeg" },
] as const;

export type ContributorId = (typeof CONTRIBUTORS)[number]["id"];

export type ContributorInfo = {
  readonly id: string;
  readonly name: string;
  readonly team: string;
  readonly color: string;
  readonly photo: string | null;
};

export const METRICS = [
  {
    id: "beta_customer",
    label: "BETA Customer / PoC",
    description: "New beta/pilot customers onboarded per month",
    format: "number" as const,
  },
  {
    id: "pipeline_value",
    label: "Monthly Pipeline Added ($)",
    description: "New pipeline created each month",
    format: "currency" as const,
  },
  {
    id: "pipeline_opps",
    label: "Monthly Pipeline Added (# Opps)",
    description: "New opportunities added",
    format: "number" as const,
  },
  {
    id: "new_logo_value",
    label: "New Logo Pipeline ($)",
    description: "Pipeline from net-new logos",
    format: "currency" as const,
  },
  {
    id: "reference_customers",
    label: "Reference Customers",
    description: "Tracking starts September — 1 per team",
    format: "number" as const,
  },
  {
    id: "multi_year",
    label: "Multi-Year Customers",
    description: "Customers on 2+ year contracts (starts May)",
    format: "number" as const,
  },
] as const;

export type MetricId = (typeof METRICS)[number]["id"];

export type GoalFormat = "number" | "currency";

// Goals indexed [Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
export const GOALS: Record<ContributorId, Record<MetricId, number[]>> = {
  "jaime": {
    beta_customer:       [1, 1, 1, 1, 1, 1, 1, 1, 1],
    pipeline_value:      [106203, 197802, 107198, 93923, 150675, 167601, 167601, 167601, 167601],
    pipeline_opps:       [1, 3, 1, 1, 2, 2, 2, 2, 2],
    new_logo_value:      [10830, 25270, 57760, 43320, 72200, 68590, 68590, 68590, 68590],
    reference_customers: [0, 0, 0, 0, 0, 1, 1, 1, 1],
    multi_year:          [0, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  "danielr-cs": {
    beta_customer:       [1, 1, 1, 1, 1, 1, 1, 1, 1],
    pipeline_value:      [40892, 76162, 41276, 36164, 58016, 64533, 64533, 64533, 64533],
    pipeline_opps:       [4, 4, 4, 4, 4, 4, 4, 4, 4],
    new_logo_value:      [4170, 9730, 22240, 16680, 27800, 26410, 26410, 26410, 26410],
    reference_customers: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    multi_year:          [0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  "mike": {
    beta_customer:       [1, 1, 1, 1, 1, 1, 1, 1, 1],
    pipeline_value:      [101162, 188414, 102110, 89465, 143524, 159646, 159646, 159646, 159646],
    pipeline_opps:       [2, 3, 2, 1, 2, 2, 2, 2, 2],
    new_logo_value:      [12500, 27500, 60000, 50000, 80000, 87500, 87500, 87500, 87500],
    reference_customers: [0, 0, 0, 0, 0, 1, 1, 1, 1],
    multi_year:          [0, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  "shane": {
    beta_customer:       [1, 1, 1, 1, 1, 1, 1, 1, 1],
    pipeline_value:      [101162, 188414, 102110, 89465, 143524, 159646, 159646, 159646, 159646],
    pipeline_opps:       [1, 2, 1, 1, 2, 2, 2, 2, 2],
    new_logo_value:      [12500, 27500, 60000, 50000, 80000, 87500, 87500, 87500, 87500],
    reference_customers: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    multi_year:          [0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  "danielr-partner": {
    beta_customer:       [1, 1, 1, 1, 1, 1, 1, 1, 1],
    pipeline_value:      [139768, 260317, 564312, 494428, 793181, 882283, 882283, 882283, 882283],
    pipeline_opps:       [4, 4, 4, 4, 4, 4, 4, 4, 4],
    new_logo_value:      [5000, 10000, 20000, 15000, 30000, 35000, 35000, 35000, 35000],
    reference_customers: [0, 0, 0, 0, 0, 1, 1, 1, 1],
    multi_year:          [0, 1, 1, 1, 1, 1, 1, 1, 1],
  },
};

export function getGoal(contributorId: ContributorId, metricId: MetricId, month: ContributionMonth): number {
  const mi = CONTRIBUTION_MONTHS.indexOf(month);
  return GOALS[contributorId]?.[metricId]?.[mi] ?? 0;
}

export function getAnnualGoal(contributorId: ContributorId, metricId: MetricId): number {
  return GOALS[contributorId]?.[metricId]?.reduce((s, v) => s + v, 0) ?? 0;
}

export function actualKey(contributorId: string, metricId: string, month: string): string {
  return `${contributorId}::${metricId}::${month}`;
}
