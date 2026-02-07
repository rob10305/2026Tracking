import { describe, it, expect } from "vitest";
import {
  offsetMonth,
  formatMonth,
  calcOppsNeeded,
  calcProspectsNeeded,
  calcPipelineMonth,
  calcProspectingStartMonth,
  calcWorkbackRow,
} from "@/lib/calc/workback";
import type { SalesMotion } from "@/lib/models/types";

describe("offsetMonth", () => {
  it("offsets forward within same year", () => {
    expect(offsetMonth("2026-01", 3)).toBe("2026-04");
  });

  it("offsets forward across year boundary", () => {
    expect(offsetMonth("2026-10", 4)).toBe("2027-02");
  });

  it("offsets backward within same year", () => {
    expect(offsetMonth("2026-06", -3)).toBe("2026-03");
  });

  it("offsets backward across year boundary", () => {
    expect(offsetMonth("2026-01", -2)).toBe("2025-11");
  });

  it("handles zero offset", () => {
    expect(offsetMonth("2026-07", 0)).toBe("2026-07");
  });

  it("offsets backward many months across years", () => {
    expect(offsetMonth("2026-01", -13)).toBe("2024-12");
  });
});

describe("formatMonth", () => {
  it("formats 2026-01 as Jan 2026", () => {
    expect(formatMonth("2026-01")).toBe("Jan 2026");
  });

  it("formats 2025-11 as Nov 2025", () => {
    expect(formatMonth("2025-11")).toBe("Nov 2025");
  });

  it("formats 2026-12 as Dec 2026", () => {
    expect(formatMonth("2026-12")).toBe("Dec 2026");
  });
});

describe("calcOppsNeeded", () => {
  it("rounds up correctly", () => {
    // 5 deals at 25% win rate → 5/0.25 = 20
    expect(calcOppsNeeded(5, 25)).toBe(20);
  });

  it("rounds up fractional results", () => {
    // 3 deals at 25% → 3/0.25 = 12
    expect(calcOppsNeeded(3, 25)).toBe(12);
    // 1 deal at 30% → 1/0.30 = 3.33 → ceil = 4
    expect(calcOppsNeeded(1, 30)).toBe(4);
  });

  it("returns 0 for 0% win rate", () => {
    expect(calcOppsNeeded(5, 0)).toBe(0);
  });
});

describe("calcProspectsNeeded", () => {
  it("rounds up correctly", () => {
    // 20 opps at 15% conversion → 20/0.15 = 133.33 → 134
    expect(calcProspectsNeeded(20, 15)).toBe(134);
  });

  it("handles exact division", () => {
    // 10 opps at 50% → 10/0.50 = 20
    expect(calcProspectsNeeded(10, 50)).toBe(20);
  });
});

describe("calcPipelineMonth", () => {
  it("offsets by sales cycle", () => {
    expect(calcPipelineMonth("2026-06", 3)).toBe("2026-03");
  });

  it("goes before Jan 2026 for early months", () => {
    expect(calcPipelineMonth("2026-01", 3)).toBe("2025-10");
  });
});

describe("calcProspectingStartMonth", () => {
  it("offsets pipeline month by lead time", () => {
    expect(calcProspectingStartMonth("2026-02", 1)).toBe("2026-01");
  });

  it("goes before pipeline month", () => {
    expect(calcProspectingStartMonth("2025-09", 1)).toBe("2025-08");
  });
});

describe("calcWorkbackRow", () => {
  const motion: SalesMotion = {
    sales_cycle_months: 3,
    opp_to_close_win_rate_pct: 25,
    prospect_to_opp_rate_pct: 15,
    prospecting_lead_time_months: 1,
  };

  it("computes full workback for a deal", () => {
    const row = calcWorkbackRow("p1", "Product 1", "2026-06", 5, motion);
    expect(row.deals_needed).toBe(5);
    expect(row.opps_needed).toBe(20); // ceil(5/0.25)
    expect(row.prospects_needed).toBe(134); // ceil(20/0.15)
    expect(row.pipeline_month).toBe("2026-03"); // 2026-06 - 3
    expect(row.prospecting_start_month).toBe("2026-02"); // 2026-03 - 1
  });

  it("computes pre-FY workback for January close", () => {
    const row = calcWorkbackRow("p1", "Product 1", "2026-01", 2, motion);
    expect(row.opps_needed).toBe(8); // ceil(2/0.25)
    expect(row.pipeline_month).toBe("2025-10"); // 2026-01 - 3
    expect(row.prospecting_start_month).toBe("2025-09"); // 2025-10 - 1
  });
});
