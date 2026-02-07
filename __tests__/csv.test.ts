import { describe, it, expect } from "vitest";
import { exportForecastCSV, exportSummaryCSV, exportWorkbackCSV } from "@/lib/calc/csv";
import { createSeedData } from "@/lib/store/seed";

describe("CSV exports", () => {
  const state = createSeedData();

  it("exportForecastCSV produces valid header and rows", () => {
    const csv = exportForecastCSV(state);
    const lines = csv.split("\n");
    // Header + 3 products
    expect(lines.length).toBe(4);
    expect(lines[0]).toContain("Product");
    expect(lines[0]).toContain("Jan");
    expect(lines[0]).toContain("Dec");
    expect(lines[0]).toContain("Total");
    // First product row
    expect(lines[1]).toContain("Managed Cloud Platform");
  });

  it("exportSummaryCSV produces 13 lines (header + 12 months)", () => {
    const csv = exportSummaryCSV(state);
    const lines = csv.split("\n");
    expect(lines.length).toBe(13);
    expect(lines[0]).toContain("Gross Revenue");
    expect(lines[0]).toContain("Net Margin %");
  });

  it("exportWorkbackCSV includes all products with non-zero forecast", () => {
    const csv = exportWorkbackCSV(state);
    const lines = csv.split("\n");
    // Header + data rows (all 3 products × 12 months = 36 data rows)
    expect(lines.length).toBe(37);
    expect(lines[0]).toContain("Product");
    expect(lines[0]).toContain("Opps Needed");
    expect(lines[0]).toContain("Prospecting Start");
  });
});
