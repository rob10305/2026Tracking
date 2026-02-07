import type {
  Product,
  Margins,
  ComponentBreakdown,
  RevenueResult,
} from "@/lib/models/types";

export function calcNetUnitPrice(product: Product): number {
  return product.gross_unit_price * (1 - product.default_discount_pct / 100);
}

export function calcGrossRevenue(product: Product, qty: number): number {
  return qty * product.gross_unit_price;
}

export function calcNetRevenue(product: Product, qty: number): number {
  return qty * calcNetUnitPrice(product);
}

export function getComponentPcts(product: Product): {
  ps: number;
  sr: number;
  cc: number;
  epss: number;
} {
  if (product.component_mix_mode === "dollar") {
    const total =
      product.professional_services_pct +
      product.software_resale_pct +
      product.cloud_consumption_pct +
      product.epss_pct;
    if (total === 0) return { ps: 0, sr: 0, cc: 0, epss: 0 };
    return {
      ps: (product.professional_services_pct / total) * 100,
      sr: (product.software_resale_pct / total) * 100,
      cc: (product.cloud_consumption_pct / total) * 100,
      epss: (product.epss_pct / total) * 100,
    };
  }
  return {
    ps: product.professional_services_pct,
    sr: product.software_resale_pct,
    cc: product.cloud_consumption_pct,
    epss: product.epss_pct,
  };
}

export function calcComponentSplit(
  revenue: number,
  product: Product,
): ComponentBreakdown {
  const pcts = getComponentPcts(product);
  return {
    professional_services: revenue * (pcts.ps / 100),
    software_resale: revenue * (pcts.sr / 100),
    cloud_consumption: revenue * (pcts.cc / 100),
    epss: revenue * (pcts.epss / 100),
  };
}

export function calcComponentGP(
  components: ComponentBreakdown,
  margins: Margins,
): ComponentBreakdown {
  return {
    professional_services:
      components.professional_services *
      (margins.professional_services_margin_pct / 100),
    software_resale:
      components.software_resale *
      (margins.software_resale_margin_pct / 100),
    cloud_consumption:
      components.cloud_consumption *
      (margins.cloud_consumption_margin_pct / 100),
    epss: components.epss * (margins.epss_margin_pct / 100),
  };
}

export function sumComponents(c: ComponentBreakdown): number {
  return (
    c.professional_services + c.software_resale + c.cloud_consumption + c.epss
  );
}

export function calcMarginPct(gp: number, revenue: number): number {
  if (revenue === 0) return 0;
  return (gp / revenue) * 100;
}

export function calcFullRevenue(
  product: Product,
  margins: Margins,
  qty: number,
): RevenueResult {
  const gross_revenue = calcGrossRevenue(product, qty);
  const net_unit_price = calcNetUnitPrice(product);
  const net_revenue = calcNetRevenue(product, qty);

  const gross_components = calcComponentSplit(gross_revenue, product);
  const net_components = calcComponentSplit(net_revenue, product);

  const gross_gp = calcComponentGP(gross_components, margins);
  const net_gp = calcComponentGP(net_components, margins);

  const total_gross_gp = sumComponents(gross_gp);
  const total_net_gp = sumComponents(net_gp);

  return {
    gross_revenue,
    net_revenue,
    net_unit_price,
    gross_components,
    net_components,
    gross_gp,
    net_gp,
    total_gross_gp,
    total_net_gp,
    gross_margin_pct: calcMarginPct(total_gross_gp, gross_revenue),
    net_margin_pct: calcMarginPct(total_net_gp, net_revenue),
  };
}
