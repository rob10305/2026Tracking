import { describe, it, expect } from "vitest";
import {
  calcNetUnitPrice,
  calcGrossRevenue,
  calcNetRevenue,
  calcComponentSplit,
  calcComponentGP,
  sumComponents,
  calcMarginPct,
  calcFullRevenue,
} from "@/lib/calc/revenue";
import type { Product, Margins } from "@/lib/models/types";

const sampleProduct: Product = {
  id: "test-1",
  name: "Test Product",
  description: "test",
  gross_unit_price: 10000,
  default_discount_pct: 10,
  component_mix_mode: "pct",
  professional_services_pct: 25,
  software_resale_pct: 25,
  cloud_consumption_pct: 25,
  epss_pct: 25,
};

const sampleMargins: Margins = {
  professional_services_margin_pct: 50,
  software_resale_margin_pct: 20,
  cloud_consumption_margin_pct: 30,
  epss_margin_pct: 60,
};

describe("calcNetUnitPrice", () => {
  it("applies discount correctly", () => {
    expect(calcNetUnitPrice(sampleProduct)).toBe(9000);
  });

  it("returns gross price when no discount", () => {
    const p = { ...sampleProduct, default_discount_pct: 0 };
    expect(calcNetUnitPrice(p)).toBe(10000);
  });

  it("returns zero for 100% discount", () => {
    const p = { ...sampleProduct, default_discount_pct: 100 };
    expect(calcNetUnitPrice(p)).toBe(0);
  });
});

describe("calcGrossRevenue", () => {
  it("multiplies unit price by quantity", () => {
    expect(calcGrossRevenue(sampleProduct, 5)).toBe(50000);
  });

  it("returns zero for zero quantity", () => {
    expect(calcGrossRevenue(sampleProduct, 0)).toBe(0);
  });
});

describe("calcNetRevenue", () => {
  it("applies discount then multiplies by quantity", () => {
    expect(calcNetRevenue(sampleProduct, 5)).toBe(45000);
  });
});

describe("calcComponentSplit", () => {
  it("splits revenue evenly for equal percentages", () => {
    const split = calcComponentSplit(40000, sampleProduct);
    expect(split.professional_services).toBe(10000);
    expect(split.software_resale).toBe(10000);
    expect(split.cloud_consumption).toBe(10000);
    expect(split.epss).toBe(10000);
  });

  it("handles uneven splits", () => {
    const p = {
      ...sampleProduct,
      professional_services_pct: 50,
      software_resale_pct: 30,
      cloud_consumption_pct: 15,
      epss_pct: 5,
    };
    const split = calcComponentSplit(100000, p);
    expect(split.professional_services).toBe(50000);
    expect(split.software_resale).toBe(30000);
    expect(split.cloud_consumption).toBe(15000);
    expect(split.epss).toBe(5000);
  });
});

describe("calcComponentGP", () => {
  it("applies margins to each component", () => {
    const components = {
      professional_services: 10000,
      software_resale: 10000,
      cloud_consumption: 10000,
      epss: 10000,
    };
    const gp = calcComponentGP(components, sampleMargins);
    expect(gp.professional_services).toBe(5000);
    expect(gp.software_resale).toBe(2000);
    expect(gp.cloud_consumption).toBe(3000);
    expect(gp.epss).toBe(6000);
  });
});

describe("sumComponents", () => {
  it("sums all four components", () => {
    const c = {
      professional_services: 5000,
      software_resale: 2000,
      cloud_consumption: 3000,
      epss: 6000,
    };
    expect(sumComponents(c)).toBe(16000);
  });
});

describe("calcMarginPct", () => {
  it("calculates margin percentage", () => {
    expect(calcMarginPct(16000, 40000)).toBe(40);
  });

  it("returns 0 for zero revenue", () => {
    expect(calcMarginPct(0, 0)).toBe(0);
  });
});

describe("calcFullRevenue", () => {
  it("produces complete revenue result for qty=5", () => {
    const r = calcFullRevenue(sampleProduct, sampleMargins, 5);
    expect(r.gross_revenue).toBe(50000);
    expect(r.net_revenue).toBe(45000);
    expect(r.net_unit_price).toBe(9000);
    // Components (gross): 25% of 50000 = 12500 each
    expect(r.gross_components.professional_services).toBe(12500);
    // GP: 12500 * 50% = 6250
    expect(r.gross_gp.professional_services).toBe(6250);
    // Total gross GP: 6250 + 2500 + 3750 + 7500 = 20000
    expect(r.total_gross_gp).toBe(20000);
    // Gross margin: 20000/50000 = 40%
    expect(r.gross_margin_pct).toBe(40);
  });

  it("returns zeroes for qty=0", () => {
    const r = calcFullRevenue(sampleProduct, sampleMargins, 0);
    expect(r.gross_revenue).toBe(0);
    expect(r.net_revenue).toBe(0);
    expect(r.total_gross_gp).toBe(0);
    expect(r.gross_margin_pct).toBe(0);
  });
});
