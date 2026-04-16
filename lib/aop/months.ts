// FY2026 month helpers used by AOP edit mode and PPT export.
// Aligned with the existing app convention: YYYY-MM strings (calendar 2026).

export const FY26_MONTHS = [
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
] as const;

export type FY26Month = (typeof FY26_MONTHS)[number];

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function monthLabel(month: string): string {
  // "2026-04" -> "Apr 2026"
  const [year, mm] = month.split("-");
  const idx = parseInt(mm, 10) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return month;
  return `${MONTH_LABELS[idx]} ${year}`;
}

export function shortMonthLabel(month: string): string {
  // "2026-04" -> "Apr"
  const [, mm] = month.split("-");
  const idx = parseInt(mm, 10) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return month;
  return MONTH_LABELS[idx];
}

export function isValidFy26Month(value: string): value is FY26Month {
  return (FY26_MONTHS as readonly string[]).includes(value);
}
