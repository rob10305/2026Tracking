"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type Handsontable from "handsontable";
import { useStore } from "@/lib/store/context";
import { useSavedForecasts } from "@/lib/store/saved-forecasts-context";
import {
  MONTHS_2026,
  MONTH_LABELS,
  forecastKey,
} from "@/lib/models/types";
import type { RevenueMode, Product, RevenueResult } from "@/lib/models/types";
import { calcFullRevenue } from "@/lib/calc/revenue";
import { calcWorkbackRow } from "@/lib/calc/workback";
import { formatMonth } from "@/lib/calc/workback";

const HotTable = dynamic(
  () =>
    import("handsontable/registry").then((reg) => {
      reg.registerAllModules();
      return import("@handsontable/react").then((mod) => mod.HotTable);
    }),
  {
    ssr: false,
    loading: () => <div className="p-8 text-gray-400">Loading grid...</div>,
  }
);

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function num(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

interface MonthlyProductData {
  product: Product;
  months: { qty: number; result: RevenueResult | null }[];
  annualQty: number;
  annualResult: RevenueResult | null;
}

export default function ForecastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const forecastId = params.id as string;
  const { state } = useStore();
  const { getForecast, setQtyBulk, isLoaded } = useSavedForecasts();
  const [mode, setMode] = useState<RevenueMode>("net");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    revenue: true,
    components: false,
    gp: false,
    pipeline: true,
    contribution: false,
  });
  const hotRef = useRef<InstanceType<typeof import("@handsontable/react").HotTable> | null>(null);

  const forecast = getForecast(forecastId);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const products = state.products;
  const quantities = forecast?.quantities ?? {};

  const gridData = useMemo(() => {
    const rows: (string | number)[][] = [];
    for (const p of products) {
      const row: (string | number)[] = [p.name];
      let total = 0;
      for (const m of MONTHS_2026) {
        const qty = quantities[forecastKey(p.id, m)] ?? 0;
        row.push(qty);
        total += qty;
      }
      row.push(total);
      rows.push(row);
    }
    const totalRow: (string | number)[] = ["TOTAL"];
    let grandTotal = 0;
    for (let col = 0; col < 12; col++) {
      let colSum = 0;
      for (const r of rows) {
        colSum += (r[col + 1] as number) || 0;
      }
      totalRow.push(colSum);
      grandTotal += colSum;
    }
    totalRow.push(grandTotal);
    rows.push(totalRow);
    return rows;
  }, [products, quantities]);

  const colHeaders = useMemo(() => ["Product", ...MONTH_LABELS, "Total"], []);

  const columns = useMemo(() => {
    const cols: Handsontable.ColumnSettings[] = [
      { type: "text", readOnly: true, width: 180 },
    ];
    for (let i = 0; i < 12; i++) {
      cols.push({ type: "numeric", width: 65 });
    }
    cols.push({ type: "numeric", readOnly: true, width: 70 });
    return cols;
  }, []);

  const handleAfterChange = useCallback(
    (changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => {
      if (!changes || source === "loadData" || !forecast) return;
      const entries: { productId: string; month: string; qty: number }[] = [];
      for (const [row, col, , newVal] of changes) {
        if (row >= products.length) continue;
        if (typeof col !== "number" || col < 1 || col > 12) continue;
        const product = products[row];
        const month = MONTHS_2026[col - 1];
        const qty = parseInt(String(newVal), 10);
        entries.push({
          productId: product.id,
          month,
          qty: isNaN(qty) ? 0 : qty,
        });
      }
      if (entries.length > 0) {
        setQtyBulk(forecastId, entries);
      }
    },
    [products, forecast, forecastId, setQtyBulk]
  );

  const cells = useCallback(
    (row: number, col: number): Handsontable.CellProperties => {
      const props: Partial<Handsontable.CellProperties> = {};
      if (row === products.length) {
        props.readOnly = true;
        props.className = "font-semibold bg-gray-100";
      }
      return props as Handsontable.CellProperties;
    },
    [products.length]
  );

  const monthlyProductData: MonthlyProductData[] = useMemo(() => {
    return products.map((product) => {
      let annualQty = 0;
      const months = MONTHS_2026.map((m) => {
        const qty = quantities[forecastKey(product.id, m)] ?? 0;
        annualQty += qty;
        return {
          qty,
          result: qty > 0 ? calcFullRevenue(product, state.margins, qty) : null,
        };
      });
      return {
        product,
        months,
        annualQty,
        annualResult: annualQty > 0 ? calcFullRevenue(product, state.margins, annualQty) : null,
      };
    });
  }, [products, quantities, state.margins]);

  const monthlyTotals = useMemo(() => {
    return MONTHS_2026.map((_, mi) => {
      let grossRev = 0, netRev = 0, grossGP = 0, netGP = 0;
      let ps = 0, sr = 0, cc = 0, epss = 0;
      let gpPs = 0, gpSr = 0, gpCc = 0, gpEpss = 0;

      for (const pd of monthlyProductData) {
        const r = pd.months[mi].result;
        if (!r) continue;
        const comp = mode === "gross" ? r.gross_components : r.net_components;
        const gp = mode === "gross" ? r.gross_gp : r.net_gp;
        grossRev += r.gross_revenue;
        netRev += r.net_revenue;
        grossGP += r.total_gross_gp;
        netGP += r.total_net_gp;
        ps += comp.professional_services;
        sr += comp.software_resale;
        cc += comp.cloud_consumption;
        epss += comp.epss;
        gpPs += gp.professional_services;
        gpSr += gp.software_resale;
        gpCc += gp.cloud_consumption;
        gpEpss += gp.epss;
      }

      const rev = mode === "gross" ? grossRev : netRev;
      const totalGP = mode === "gross" ? grossGP : netGP;
      return { grossRev, netRev, grossGP, netGP, ps, sr, cc, epss, gpPs, gpSr, gpCc, gpEpss, rev, totalGP };
    });
  }, [monthlyProductData, mode]);

  const annualTotals = useMemo(() => {
    const t = { grossRev: 0, netRev: 0, grossGP: 0, netGP: 0, ps: 0, sr: 0, cc: 0, epss: 0, gpPs: 0, gpSr: 0, gpCc: 0, gpEpss: 0 };
    for (const mt of monthlyTotals) {
      t.grossRev += mt.grossRev;
      t.netRev += mt.netRev;
      t.grossGP += mt.grossGP;
      t.netGP += mt.netGP;
      t.ps += mt.ps;
      t.sr += mt.sr;
      t.cc += mt.cc;
      t.epss += mt.epss;
      t.gpPs += mt.gpPs;
      t.gpSr += mt.gpSr;
      t.gpCc += mt.gpCc;
      t.gpEpss += mt.gpEpss;
    }
    return { ...t, rev: mode === "gross" ? t.grossRev : t.netRev, totalGP: mode === "gross" ? t.grossGP : t.netGP };
  }, [monthlyTotals, mode]);

  const pipelineData = useMemo(() => {
    const rows: {
      productName: string;
      closeMonth: string;
      qty: number;
      dealsNeeded: number;
      oppsNeeded: number;
      prospectsNeeded: number;
      pipelineMonth: string;
      prospectingStart: string;
    }[] = [];

    for (const p of products) {
      const motion = state.salesMotionByProductId[p.id];
      if (!motion) continue;
      for (const m of MONTHS_2026) {
        const qty = quantities[forecastKey(p.id, m)] ?? 0;
        if (qty === 0) continue;
        const wb = calcWorkbackRow(p.id, p.name, m, qty, motion);
        rows.push({
          productName: p.name,
          closeMonth: m,
          qty,
          dealsNeeded: wb.deals_needed,
          oppsNeeded: wb.opps_needed,
          prospectsNeeded: wb.prospects_needed,
          pipelineMonth: wb.pipeline_month,
          prospectingStart: wb.prospecting_start_month,
        });
      }
    }
    return rows;
  }, [products, quantities, state.salesMotionByProductId]);

  const pipelineByMonth = useMemo(() => {
    const byMonth: Record<string, { opps: number; prospects: number; deals: number }> = {};
    for (const r of pipelineData) {
      if (!byMonth[r.pipelineMonth]) byMonth[r.pipelineMonth] = { opps: 0, prospects: 0, deals: 0 };
      byMonth[r.pipelineMonth].opps += r.oppsNeeded;
      byMonth[r.pipelineMonth].prospects += r.prospectsNeeded;
      byMonth[r.pipelineMonth].deals += r.dealsNeeded;
    }
    return byMonth;
  }, [pipelineData]);

  const contributionData = useMemo(() => {
    const pc = state.pipelineContribution;
    const totalProspects = pipelineData.reduce((sum, r) => sum + r.prospectsNeeded, 0);
    const totalOpps = pipelineData.reduce((sum, r) => sum + r.oppsNeeded, 0);

    if (pc.mode === "pct") {
      return {
        channels: [
          { label: "Website Inbound", pct: pc.website_inbound, prospects: Math.ceil(totalProspects * pc.website_inbound / 100), opps: Math.ceil(totalOpps * pc.website_inbound / 100) },
          { label: "Sales Team Generated", pct: pc.sales_team_generated, prospects: Math.ceil(totalProspects * pc.sales_team_generated / 100), opps: Math.ceil(totalOpps * pc.sales_team_generated / 100) },
          { label: "Event Sourced", pct: pc.event_sourced, prospects: Math.ceil(totalProspects * pc.event_sourced / 100), opps: Math.ceil(totalOpps * pc.event_sourced / 100) },
          { label: "ABM/Thought Leadership", pct: pc.abm_thought_leadership, prospects: Math.ceil(totalProspects * pc.abm_thought_leadership / 100), opps: Math.ceil(totalOpps * pc.abm_thought_leadership / 100) },
        ],
        totalProspects,
        totalOpps,
      };
    }
    const totalNum = pc.website_inbound + pc.sales_team_generated + pc.event_sourced + pc.abm_thought_leadership;
    const pctOf = (v: number) => totalNum > 0 ? (v / totalNum) * 100 : 0;
    return {
      channels: [
        { label: "Website Inbound", pct: pctOf(pc.website_inbound), prospects: Math.ceil(totalProspects * pctOf(pc.website_inbound) / 100), opps: Math.ceil(totalOpps * pctOf(pc.website_inbound) / 100) },
        { label: "Sales Team Generated", pct: pctOf(pc.sales_team_generated), prospects: Math.ceil(totalProspects * pctOf(pc.sales_team_generated) / 100), opps: Math.ceil(totalOpps * pctOf(pc.sales_team_generated) / 100) },
        { label: "Event Sourced", pct: pctOf(pc.event_sourced), prospects: Math.ceil(totalProspects * pctOf(pc.event_sourced) / 100), opps: Math.ceil(totalOpps * pctOf(pc.event_sourced) / 100) },
        { label: "ABM/Thought Leadership", pct: pctOf(pc.abm_thought_leadership), prospects: Math.ceil(totalProspects * pctOf(pc.abm_thought_leadership) / 100), opps: Math.ceil(totalOpps * pctOf(pc.abm_thought_leadership) / 100) },
      ],
      totalProspects,
      totalOpps,
    };
  }, [pipelineData, state.pipelineContribution]);

  if (!isLoaded) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  if (!forecast) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="font-semibold text-gray-700 mb-2">Forecast not found</h2>
        <p className="text-sm text-gray-500 mb-4">This forecast may have been deleted.</p>
        <Link href="/forecast" className="text-blue-600 hover:underline text-sm">
          Back to forecasts
        </Link>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/forecast" className="text-blue-600 hover:underline text-sm">&larr; All Forecasts</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold">{forecast.name}</h1>
        </div>
        <div className="text-gray-500 p-8 text-center bg-white border border-gray-200 rounded-lg">
          No products configured. Go to{" "}
          <a href="/settings/products" className="text-blue-600 underline">Settings &gt; Products</a>{" "}
          to add products first.
        </div>
      </div>
    );
  }

  const hasData = Object.values(quantities).some((v) => v > 0);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/forecast" className="text-blue-600 hover:underline text-sm">&larr; All Forecasts</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold">{forecast.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Mode:</span>
          <button
            onClick={() => setMode("gross")}
            className={`px-3 py-1 text-sm rounded ${mode === "gross" ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Gross
          </button>
          <button
            onClick={() => setMode("net")}
            className={`px-3 py-1 text-sm rounded ${mode === "net" ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Net
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold text-sm mb-3">Unit Quantity by Month</h2>
        <HotTable
          ref={hotRef as React.RefObject<never>}
          data={gridData}
          colHeaders={colHeaders}
          columns={columns}
          rowHeaders={false}
          width="100%"
          height="auto"
          stretchH="all"
          licenseKey="non-commercial-and-evaluation"
          afterChange={handleAfterChange}
          cells={cells}
          contextMenu={false}
          manualColumnResize={true}
          autoWrapRow={true}
          autoWrapCol={true}
          fillHandle={true}
          undo={true}
          className="htLeft"
        />
        <p className="text-xs text-gray-400 mt-2">
          Enter the number of units expected to close each month. All tables below update automatically.
        </p>
      </div>

      {hasData && (
        <>
          <SectionToggle title={`${mode === "gross" ? "Gross" : "Net"} Revenue by Product`} sectionKey="revenue" expanded={expandedSections.revenue} onToggle={toggleSection}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="px-3 py-2 font-medium sticky left-0 bg-gray-50 min-w-[160px]">Product</th>
                    {MONTH_LABELS.map((m) => (
                      <th key={m} className="px-3 py-2 font-medium text-right min-w-[90px]">{m}</th>
                    ))}
                    <th className="px-3 py-2 font-medium text-right min-w-[100px]">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyProductData.map((pd, i) => (
                    <tr key={pd.product.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-3 py-2 font-medium sticky left-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>{pd.product.name}</td>
                      {pd.months.map((m, mi) => {
                        const rev = m.result ? (mode === "gross" ? m.result.gross_revenue : m.result.net_revenue) : 0;
                        return (
                          <td key={mi} className="px-3 py-2 text-right">
                            {m.qty > 0 ? fmt(rev) : <span className="text-gray-300">-</span>}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right font-semibold">
                        {pd.annualResult ? fmt(mode === "gross" ? pd.annualResult.gross_revenue : pd.annualResult.net_revenue) : <span className="text-gray-300">-</span>}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-semibold bg-gray-100 border-t">
                    <td className="px-3 py-2 sticky left-0 bg-gray-100">TOTAL</td>
                    {monthlyTotals.map((mt, mi) => (
                      <td key={mi} className="px-3 py-2 text-right">{fmt(mt.rev)}</td>
                    ))}
                    <td className="px-3 py-2 text-right">{fmt(annualTotals.rev)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionToggle>

          <SectionToggle title="Revenue Component Breakdown" sectionKey="components" expanded={expandedSections.components} onToggle={toggleSection}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="px-3 py-2 font-medium sticky left-0 bg-gray-50 min-w-[160px]">Component</th>
                    {MONTH_LABELS.map((m) => (
                      <th key={m} className="px-3 py-2 font-medium text-right min-w-[90px]">{m}</th>
                    ))}
                    <th className="px-3 py-2 font-medium text-right min-w-[100px]">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Professional Services", key: "ps" as const },
                    { label: "Software Resale", key: "sr" as const },
                    { label: "Cloud Consumption", key: "cc" as const },
                    { label: "EPS", key: "epss" as const },
                  ].map((comp, i) => (
                    <tr key={comp.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-3 py-2 font-medium sticky left-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>{comp.label}</td>
                      {monthlyTotals.map((mt, mi) => (
                        <td key={mi} className="px-3 py-2 text-right">{fmt(mt[comp.key])}</td>
                      ))}
                      <td className="px-3 py-2 text-right font-semibold">{fmt(annualTotals[comp.key])}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold bg-gray-100 border-t">
                    <td className="px-3 py-2 sticky left-0 bg-gray-100">Total Revenue</td>
                    {monthlyTotals.map((mt, mi) => (
                      <td key={mi} className="px-3 py-2 text-right">{fmt(mt.rev)}</td>
                    ))}
                    <td className="px-3 py-2 text-right">{fmt(annualTotals.rev)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionToggle>

          <SectionToggle title="Gross Profit & Margin" sectionKey="gp" expanded={expandedSections.gp} onToggle={toggleSection}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="px-3 py-2 font-medium sticky left-0 bg-gray-50 min-w-[160px]">Metric</th>
                    {MONTH_LABELS.map((m) => (
                      <th key={m} className="px-3 py-2 font-medium text-right min-w-[90px]">{m}</th>
                    ))}
                    <th className="px-3 py-2 font-medium text-right min-w-[100px]">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "PS GP$", key: "gpPs" as const },
                    { label: "Resale GP$", key: "gpSr" as const },
                    { label: "Cloud GP$", key: "gpCc" as const },
                    { label: "EPS GP$", key: "gpEpss" as const },
                  ].map((row, i) => (
                    <tr key={row.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className={`px-3 py-2 font-medium sticky left-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>{row.label}</td>
                      {monthlyTotals.map((mt, mi) => (
                        <td key={mi} className="px-3 py-2 text-right">{fmt(mt[row.key])}</td>
                      ))}
                      <td className="px-3 py-2 text-right font-semibold">{fmt(annualTotals[row.key])}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold bg-gray-100 border-t">
                    <td className="px-3 py-2 sticky left-0 bg-gray-100">Total GP$</td>
                    {monthlyTotals.map((mt, mi) => (
                      <td key={mi} className="px-3 py-2 text-right">{fmt(mt.totalGP)}</td>
                    ))}
                    <td className="px-3 py-2 text-right">{fmt(annualTotals.totalGP)}</td>
                  </tr>
                  <tr className="font-semibold bg-blue-50 border-t">
                    <td className="px-3 py-2 sticky left-0 bg-blue-50">Blended Margin %</td>
                    {monthlyTotals.map((mt, mi) => (
                      <td key={mi} className="px-3 py-2 text-right">
                        {mt.rev > 0 ? pct((mt.totalGP / mt.rev) * 100) : <span className="text-gray-300">-</span>}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      {annualTotals.rev > 0 ? pct((annualTotals.totalGP / annualTotals.rev) * 100) : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionToggle>

          <SectionToggle title="Pipeline Requirements" sectionKey="pipeline" expanded={expandedSections.pipeline} onToggle={toggleSection}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium">Close Month</th>
                    <th className="px-3 py-2 font-medium text-right">Deals</th>
                    <th className="px-3 py-2 font-medium text-right">Opps Needed</th>
                    <th className="px-3 py-2 font-medium text-right">Prospects Needed</th>
                    <th className="px-3 py-2 font-medium">Pipeline Must Start</th>
                    <th className="px-3 py-2 font-medium">Prospecting Start</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelineData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                        Enter quantities above to see pipeline requirements.
                      </td>
                    </tr>
                  ) : (
                    pipelineData.map((r, i) => {
                      const pipelineBefore = r.pipelineMonth < "2026-01";
                      const prospectBefore = r.prospectingStart < "2026-01";
                      return (
                        <tr key={`${r.productName}-${r.closeMonth}`} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-3 py-2">{r.productName}</td>
                          <td className="px-3 py-2">{formatMonth(r.closeMonth)}</td>
                          <td className="px-3 py-2 text-right">{num(r.dealsNeeded)}</td>
                          <td className="px-3 py-2 text-right">{num(r.oppsNeeded)}</td>
                          <td className="px-3 py-2 text-right">{num(r.prospectsNeeded)}</td>
                          <td className={`px-3 py-2 ${pipelineBefore ? "text-orange-600 font-medium" : ""}`}>
                            {formatMonth(r.pipelineMonth)}
                            {pipelineBefore && <span className="text-xs ml-1">(pre-FY)</span>}
                          </td>
                          <td className={`px-3 py-2 ${prospectBefore ? "text-orange-600 font-medium" : ""}`}>
                            {formatMonth(r.prospectingStart)}
                            {prospectBefore && <span className="text-xs ml-1">(pre-FY)</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {Object.keys(pipelineByMonth).length > 0 && (
              <div className="border-t mt-4 pt-4 px-4 pb-4">
                <h3 className="font-semibold text-sm mb-2">Pipeline Summary by Month</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b text-left">
                        <th className="px-3 py-2 font-medium">Pipeline Month</th>
                        <th className="px-3 py-2 font-medium text-right">Total Opps Needed</th>
                        <th className="px-3 py-2 font-medium text-right">Total Prospects Needed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(pipelineByMonth)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([month, data], i) => {
                          const before = month < "2026-01";
                          return (
                            <tr key={month} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className={`px-3 py-2 ${before ? "text-orange-600 font-medium" : ""}`}>
                                {formatMonth(month)}
                                {before && <span className="text-xs ml-1">(pre-FY)</span>}
                              </td>
                              <td className="px-3 py-2 text-right">{num(data.opps)}</td>
                              <td className="px-3 py-2 text-right">{num(data.prospects)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SectionToggle>

          <SectionToggle title="Pipeline Contribution by Channel" sectionKey="contribution" expanded={expandedSections.contribution} onToggle={toggleSection}>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-3">
                Based on your pipeline contribution settings, here is how the total pipeline requirement breaks down by channel.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b text-left">
                      <th className="px-3 py-2 font-medium">Channel</th>
                      <th className="px-3 py-2 font-medium text-right">Contribution %</th>
                      <th className="px-3 py-2 font-medium text-right">Prospects to Generate</th>
                      <th className="px-3 py-2 font-medium text-right">Opps to Generate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributionData.channels.map((ch, i) => (
                      <tr key={ch.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 font-medium">{ch.label}</td>
                        <td className="px-3 py-2 text-right">{pct(ch.pct)}</td>
                        <td className="px-3 py-2 text-right">{num(ch.prospects)}</td>
                        <td className="px-3 py-2 text-right">{num(ch.opps)}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold bg-gray-100 border-t">
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2 text-right">100.0%</td>
                      <td className="px-3 py-2 text-right">{num(contributionData.totalProspects)}</td>
                      <td className="px-3 py-2 text-right">{num(contributionData.totalOpps)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </SectionToggle>
        </>
      )}

      {!hasData && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-400">
          Enter product quantities in the grid above to see revenue breakdown, pipeline requirements, and contribution analysis.
        </div>
      )}
    </div>
  );
}

function SectionToggle({
  title,
  sectionKey,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <h2 className="font-semibold text-sm">{title}</h2>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="border-t">{children}</div>}
    </div>
  );
}
