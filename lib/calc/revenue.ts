import type {
  Product,
  Margins,
  ComponentBreakdown,
  RevenueResult,
} from "@/lib/models/types";

export function getEffectivePricing(product: Product) {
  if (product.has_variants && product.selected_variant && product.variants) {
    const v = product.variants[product.selected_variant];
    return {
      gross_annual_price: v.gross_annual_price,
      platform_support_services_pct: v.platform_support_services_pct,
      professional_services_pct: v.professional_services_pct,
      software_resale_pct: v.software_resale_pct,
      cloud_consumption_pct: v.cloud_consumption_pct,
      pss_pct: v.pss_pct,
      user_count: v.user_count,
    };
  }
  return {
    gross_annual_price: product.gross_annual_price,
    platform_support_services_pct: product.platform_support_services_pct,
    professional_services_pct: product.professional_services_pct,
    software_resale_pct: product.software_resale_pct,
    cloud_consumption_pct: product.cloud_consumption_pct,
    pss_pct: product.pss_pct,
    user_count: product.user_count,
  };
}

export function calcGrossRevenue(product: Product, qty: number): number {
  const p = getEffectivePricing(product);
  return qty * p.gross_annual_price;
}

export function calcNetRevenue(product: Product, margins: Margins, qty: number): number {
  const grossRev = calcGrossRevenue(product, qty);
  const components = calcComponentSplit(grossRev, product);
  const netPs = components.professional_services * (margins.professional_services_margin_pct / 100);
  const netSr = components.software_resale * (margins.software_resale_margin_pct / 100);
  const netCc = components.cloud_consumption * (margins.cloud_consumption_margin_pct / 100);
  const netPss = components.pss * (margins.pss_margin_pct / 100);
  return netPs + netSr + netCc + netPss;
}

export function calcNetUnitPrice(product: Product, margins: Margins): number {
  const grossPrice = getEffectivePricing(product).gross_annual_price;
  if (grossPrice === 0) return 0;
  const tempProduct = { ...product };
  const grossRev = grossPrice;
  const components = calcComponentSplit(grossRev, tempProduct);
  const netPs = components.professional_services * (margins.professional_services_margin_pct / 100);
  const netSr = components.software_resale * (margins.software_resale_margin_pct / 100);
  const netCc = components.cloud_consumption * (margins.cloud_consumption_margin_pct / 100);
  const netPss = components.pss * (margins.pss_margin_pct / 100);
  return netPs + netSr + netCc + netPss;
}

export function getComponentPcts(product: Product): {
  platSupport: number;
  ps: number;
  sr: number;
  cc: number;
  pss: number;
} {
  const p = getEffectivePricing(product);
  return {
    platSupport: p.platform_support_services_pct,
    ps: p.professional_services_pct,
    sr: p.software_resale_pct,
    cc: p.cloud_consumption_pct,
    pss: p.pss_pct,
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
    pss: revenue * (pcts.pss / 100),
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
    pss: components.pss * (margins.pss_margin_pct / 100),
  };
}

export function sumComponents(c: ComponentBreakdown): number {
  return (
    c.professional_services + c.software_resale + c.cloud_consumption + c.pss
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
  const net_unit_price = calcNetUnitPrice(product, margins);
  const net_revenue = calcNetRevenue(product, margins, qty);

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
