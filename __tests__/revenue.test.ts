import { describe, it, expect } from "vitest";
import {
  calcGrossRevenue,
  calcNetRevenue,
  calcNetUnitPrice,
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
  generally_available: "January",
  gross_annual_price: 10000,
  platform_support_services_pct: 0,
  professional_services_pct: 25,
  software_resale_pct: 25,
  cloud_consumption_pct: 25,
  eps_pct: 25,
  user_count: "",
  has_variants: false,
  status: "live",
};

const sampleMargins: Margins = {
  professional_services_margin_pct: 50,
  software_resale_margin_pct: 20,
  cloud_consumption_margin_pct: 30,
  epss_margin_pct: 60,
};

describe("calcNetUnitPrice", () => {
  it("returns gross annual price", () => {
    expect(calcNetUnitPrice(sampleProduct)).toBe(10000);
  });
});

describe("calcGrossRevenue", () => {
  it("multiplies annual price by quantity", () => {
    expect(calcGrossRevenue(sampleProduct, 5)).toBe(50000);
  });

  it("returns zero for zero quantity", () => {
    expect(calcGrossRevenue(sampleProduct, 0)).toBe(0);
  });
});

describe("calcNetRevenue", () => {
  it("returns gross revenue (no discount)", () => {
    expect(calcNetRevenue(sampleProduct, 5)).toBe(50000);
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
      eps_pct: 5,
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
    expect(r.net_revenue).toBe(50000);
    expect(r.net_unit_price).toBe(10000);
    expect(r.gross_components.professional_services).toBe(12500);
    expect(r.gross_gp.professional_services).toBe(6250);
    expect(r.total_gross_gp).toBe(20000);
    expect(r.gross_margin_pct).toBe(40);
  });

  it("returns zeroes for qty=0", () => {
    const r = calcFullRevenue(sampleProduct, sampleMargins, 0);
    expect(r.gross_revenue).toBe(0);
    expect(r.net_revenue).toBe(0);
    expect(r.total_gross_gp).toBe(0);
    expect(r.gross_margin_pct).toBe(0);
  });

  it("uses variant pricing when variant is selected", () => {
    const variantProduct: Product = {
      ...sampleProduct,
      has_variants: true,
      selected_variant: "large",
      variants: {
        small: { ...sampleProduct, gross_annual_price: 5000, platform_support_services_pct: 0, eps_pct: 25, user_count: "" },
        medium: { ...sampleProduct, gross_annual_price: 8000, platform_support_services_pct: 0, eps_pct: 25, user_count: "" },
        large: { gross_annual_price: 20000, platform_support_services_pct: 0, professional_services_pct: 25, software_resale_pct: 25, cloud_consumption_pct: 25, eps_pct: 25, user_count: "" },
      },
    };
    const r = calcFullRevenue(variantProduct, sampleMargins, 2);
    expect(r.gross_revenue).toBe(40000);
  });
});
