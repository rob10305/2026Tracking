import { describe, it, expect } from "vitest";
import { generateTimePeriods } from "@/lib/calc/time-periods";

describe("generateTimePeriods", () => {
  describe("monthly", () => {
    it("generates 12 months for a full year", () => {
      const periods = generateTimePeriods("2026-01-01", "2026-12-31", "monthly");
      expect(periods).toHaveLength(12);
      expect(periods[0].label).toBe("Jan 2026");
      expect(periods[0].startDate).toBe("2026-01-01");
      expect(periods[0].endDate).toBe("2026-01-31");
      expect(periods[11].label).toBe("Dec 2026");
      expect(periods[11].startDate).toBe("2026-12-01");
      expect(periods[11].endDate).toBe("2026-12-31");
    });

    it("handles partial year", () => {
      const periods = generateTimePeriods("2026-03-01", "2026-06-30", "monthly");
      expect(periods).toHaveLength(4);
      expect(periods[0].label).toBe("Mar 2026");
      expect(periods[3].label).toBe("Jun 2026");
    });

    it("handles cross-year boundary", () => {
      const periods = generateTimePeriods("2025-11-01", "2026-02-28", "monthly");
      expect(periods).toHaveLength(4);
      expect(periods[0].label).toBe("Nov 2025");
      expect(periods[1].label).toBe("Dec 2025");
      expect(periods[2].label).toBe("Jan 2026");
      expect(periods[3].label).toBe("Feb 2026");
    });

    it("handles February correctly (non-leap year)", () => {
      const periods = generateTimePeriods("2026-02-01", "2026-02-28", "monthly");
      expect(periods).toHaveLength(1);
      expect(periods[0].endDate).toBe("2026-02-28");
    });

    it("assigns sequential sort orders", () => {
      const periods = generateTimePeriods("2026-01-01", "2026-06-30", "monthly");
      for (let i = 0; i < periods.length; i++) {
        expect(periods[i].sortOrder).toBe(i);
      }
    });
  });

  describe("quarterly", () => {
    it("generates 4 quarters for a full year", () => {
      const periods = generateTimePeriods("2026-01-01", "2026-12-31", "quarterly");
      expect(periods).toHaveLength(4);
      expect(periods[0].label).toBe("Q1 2026");
      expect(periods[0].startDate).toBe("2026-01-01");
      expect(periods[0].endDate).toBe("2026-03-31");
      expect(periods[3].label).toBe("Q4 2026");
      expect(periods[3].startDate).toBe("2026-10-01");
      expect(periods[3].endDate).toBe("2026-12-31");
    });

    it("handles partial year starting mid-quarter", () => {
      const periods = generateTimePeriods("2026-04-01", "2026-09-30", "quarterly");
      expect(periods).toHaveLength(2);
      expect(periods[0].label).toBe("Q2 2026");
      expect(periods[1].label).toBe("Q3 2026");
    });
  });

  describe("weekly", () => {
    it("generates weekly periods", () => {
      const periods = generateTimePeriods("2026-01-01", "2026-01-31", "weekly");
      // Jan 2026 starts on Thursday, so we align to Monday Dec 29
      expect(periods.length).toBeGreaterThanOrEqual(4);
      // Each period spans 7 days
      for (const p of periods) {
        const start = new Date(p.startDate + "T00:00:00");
        const end = new Date(p.endDate + "T00:00:00");
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        expect(diff).toBe(6); // 7-day span, inclusive
      }
    });
  });

  describe("default", () => {
    it("falls back to monthly for unknown granularity", () => {
      const periods = generateTimePeriods("2026-01-01", "2026-03-31", "custom");
      expect(periods).toHaveLength(3);
      expect(periods[0].label).toBe("Jan 2026");
    });
  });
});
