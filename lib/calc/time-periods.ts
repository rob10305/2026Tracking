export interface TimePeriodDef {
  label: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  sortOrder: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const QUARTER_NAMES = ["Q1", "Q2", "Q3", "Q4"];

function lastDayOfMonth(year: number, month: number): number {
  // month is 1-indexed
  return new Date(year, month, 0).getDate();
}

/**
 * Generate time periods for a given date range and granularity.
 */
export function generateTimePeriods(
  startDate: string,
  endDate: string,
  granularity: string,
): TimePeriodDef[] {
  switch (granularity) {
    case "monthly":
      return generateMonthly(startDate, endDate);
    case "quarterly":
      return generateQuarterly(startDate, endDate);
    case "weekly":
      return generateWeekly(startDate, endDate);
    default:
      return generateMonthly(startDate, endDate);
  }
}

function generateMonthly(startDate: string, endDate: string): TimePeriodDef[] {
  const periods: TimePeriodDef[] = [];
  const [startYear, startMonth] = startDate.split("-").map(Number);
  const [endYear, endMonth] = endDate.split("-").map(Number);

  let order = 0;
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const last = lastDayOfMonth(year, month);
    const label = `${MONTH_NAMES[month - 1]} ${year}`;
    const sd = `${year}-${String(month).padStart(2, "0")}-01`;
    const ed = `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;

    periods.push({ label, startDate: sd, endDate: ed, sortOrder: order++ });

    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return periods;
}

function generateQuarterly(startDate: string, endDate: string): TimePeriodDef[] {
  const periods: TimePeriodDef[] = [];
  const [startYear, startMonth] = startDate.split("-").map(Number);
  const [endYear, endMonth] = endDate.split("-").map(Number);

  // Align to quarter start
  let quarter = Math.ceil(startMonth / 3);
  let year = startYear;
  let order = 0;

  while (true) {
    const qStartMonth = (quarter - 1) * 3 + 1;
    const qEndMonth = quarter * 3;

    if (year > endYear || (year === endYear && qStartMonth > endMonth)) break;

    const last = lastDayOfMonth(year, qEndMonth);
    const label = `${QUARTER_NAMES[quarter - 1]} ${year}`;
    const sd = `${year}-${String(qStartMonth).padStart(2, "0")}-01`;
    const ed = `${year}-${String(qEndMonth).padStart(2, "0")}-${String(last).padStart(2, "0")}`;

    periods.push({ label, startDate: sd, endDate: ed, sortOrder: order++ });

    quarter++;
    if (quarter > 4) {
      quarter = 1;
      year++;
    }
  }

  return periods;
}

function generateWeekly(startDate: string, endDate: string): TimePeriodDef[] {
  const periods: TimePeriodDef[] = [];
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  // Align to Monday
  const dayOfWeek = start.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const current = new Date(start);
  current.setDate(current.getDate() + mondayOffset);

  let order = 0;
  while (current <= end) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const sd = formatDateISO(current);
    const ed = formatDateISO(weekEnd);
    const label = `Week of ${MONTH_NAMES[current.getMonth()]} ${current.getDate()}`;

    periods.push({ label, startDate: sd, endDate: ed, sortOrder: order++ });

    current.setDate(current.getDate() + 7);
  }

  return periods;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
