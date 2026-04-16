// Client-side PPT generator for AOP departments.
// Imported only from client components — pptxgenjs is browser-friendly.

import type { DepartmentConfig } from "@/components/aop/DepartmentView";
import { shortMonthLabel } from "./months";

// pptxgenjs ships its own types but mixes `export =` + ambient namespace, which
// makes it fiddly to consume them under our isolatedModules + esModuleInterop
// setup. We're not exposing these types to callers, so use loose internal types.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Slide = any;
type TableCell = any;
type TableRow = TableCell[];
/* eslint-enable @typescript-eslint/no-explicit-any */

// Hex color tokens that mirror the in-app accent palette.
const ACCENT_HEX: Record<DepartmentConfig["accent"], string> = {
  sky: "38BDF8",
  emerald: "34D399",
  amber: "FBBF24",
  violet: "A78BFA",
};

const SURFACE_BG = "050914";
const SURFACE_CARD = "0B1120";
const TEXT_PRIMARY = "F3F4F6";
const TEXT_MUTED = "9CA3AF";
const BORDER_SOFT = "1F2937";

type MetricEntry = {
  kind: "leading" | "lagging";
  metric: string;
  month: string;
  value: number;
  notes?: string;
};

export type ExportInput = {
  config: DepartmentConfig;
  months: string[]; // selected FY26 months in YYYY-MM
  metricEntries: MetricEntry[];
};

export async function exportDepartmentPPTX({
  config,
  months,
  metricEntries,
}: ExportInput): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches
  pptx.title = `${config.name} — FY2026 AOP`;

  const accent = ACCENT_HEX[config.accent];

  const setBg = (s: Slide) => {
    s.background = { color: SURFACE_BG };
  };

  // ---------- Slide 1: Cover ----------
  {
    const s = pptx.addSlide();
    setBg(s);
    s.addShape("rect" as never, {
      x: 0, y: 0, w: 0.2, h: 7.5,
      fill: { color: accent }, line: { color: accent },
    });
    s.addText("FY2026 ANNUAL OPERATING PLAN", {
      x: 0.6, y: 1.2, w: 12, h: 0.4,
      fontSize: 12, bold: true, color: accent, charSpacing: 4,
    });
    s.addText(config.number, {
      x: 0.6, y: 1.7, w: 3, h: 2,
      fontSize: 96, bold: true, color: accent,
    });
    s.addText(config.name, {
      x: 3.5, y: 1.7, w: 9, h: 2,
      fontSize: 80, bold: true, color: TEXT_PRIMARY,
    });
    s.addText(config.tagline, {
      x: 0.6, y: 4.4, w: 11, h: 1,
      fontSize: 22, color: TEXT_MUTED,
    });
    s.addText(
      `Months covered: ${months.length === 12 ? "Full FY2026" : months.map(shortMonthLabel).join(" · ")}`,
      { x: 0.6, y: 6.6, w: 12, h: 0.3, fontSize: 11, color: TEXT_MUTED, italic: true }
    );
  }

  // ---------- Slide 2: Goals ----------
  {
    const s = pptx.addSlide();
    setBg(s);
    addEyebrow(s, "FY2026 GOALS", accent);
    addTitle(s, config.goals.headline);
    addSubhead(s, config.goals.subhead);

    const tileW = 4.0;
    const tileH = 3.2;
    const startX = 0.6;
    const y = 2.5;
    config.goals.items.forEach((g, i) => {
      const x = startX + i * (tileW + 0.2);
      drawCard(s, { x, y, w: tileW, h: tileH, accent });
      s.addText(g.number, {
        x: x + 0.3, y: y + 0.3, w: tileW - 0.6, h: 0.7,
        fontSize: 32, bold: true, color: accent,
      });
      s.addText(g.title, {
        x: x + 0.3, y: y + 1.1, w: tileW - 0.6, h: 0.6,
        fontSize: 18, bold: true, color: TEXT_PRIMARY,
      });
      s.addText(g.description, {
        x: x + 0.3, y: y + 1.8, w: tileW - 0.6, h: 1.2,
        fontSize: 11, color: TEXT_MUTED,
      });
    });
  }

  // ---------- Slide 3: Retrospect ----------
  {
    const s = pptx.addSlide();
    setBg(s);
    addEyebrow(s, "FY25 RETROSPECT", accent);
    addTitle(s, "What worked, what didn't, what changes");

    const cards: Array<{ label: string; color: string; items: string[] }> = [
      { label: "On Target Results", color: ACCENT_HEX.emerald, items: config.retrospect.onTarget },
      { label: "Off Target Results", color: ACCENT_HEX.amber, items: config.retrospect.offTarget },
      { label: "In Need of Change", color: ACCENT_HEX.sky, items: config.retrospect.needChange },
      { label: "Lessons Learned", color: ACCENT_HEX.violet, items: config.retrospect.lessons },
    ];
    const cardW = 6.1;
    const cardH = 2.0;
    cards.forEach((c, i) => {
      const x = 0.6 + (i % 2) * (cardW + 0.2);
      const y = 2.4 + Math.floor(i / 2) * (cardH + 0.2);
      drawCard(s, { x, y, w: cardW, h: cardH, accent: c.color });
      s.addText(c.label, {
        x: x + 0.25, y: y + 0.2, w: cardW - 0.5, h: 0.4,
        fontSize: 12, bold: true, color: c.color, charSpacing: 2,
      });
      s.addText(c.items.join("\n"), {
        x: x + 0.25, y: y + 0.7, w: cardW - 0.5, h: cardH - 0.9,
        fontSize: 12, color: TEXT_PRIMARY,
      });
    });
  }

  // ---------- Slide 4: Initiatives ----------
  {
    const s = pptx.addSlide();
    setBg(s);
    addEyebrow(s, "DEPARTMENTAL INITIATIVES", accent);
    addTitle(s, "Cross-quarter execution");

    const headers = ["Area", "#", "Description", "Q1", "Q2", "Q3", "Q4", "Who"];
    const rows: TableRow[] = [
      headers.map<TableCell>((h) => ({
        text: h,
        options: {
          bold: true, color: TEXT_PRIMARY, fill: { color: BORDER_SOFT },
          fontSize: 10, align: "left", valign: "middle",
        },
      })),
    ];
    for (let i = 0; i < 6; i++) {
      rows.push(
        headers.map<TableCell>(() => ({
          text: " ",
          options: { color: TEXT_MUTED, fill: { color: SURFACE_CARD }, fontSize: 10 },
        }))
      );
    }
    s.addTable(rows, {
      x: 0.5, y: 2.3, w: 12.3,
      colW: [1.6, 0.6, 4.1, 1, 1, 1, 1, 2],
      border: { type: "solid", color: BORDER_SOFT, pt: 0.5 },
    });
  }

  // ---------- Slide 5: Key Metrics ----------
  {
    const s = pptx.addSlide();
    setBg(s);
    addEyebrow(s, "KEY METRICS & INTELLIGENCE", accent);
    addTitle(s, "Leading and lagging indicators");

    const valueOf = (kind: "leading" | "lagging", metric: string, month: string) => {
      const m = metricEntries.find(
        (e) => e.kind === kind && e.metric === metric && e.month === month
      );
      return m && m.value !== 0 ? formatNumber(m.value) : "—";
    };

    const buildSection = (
      label: string,
      color: string,
      metrics: string[],
      kind: "leading" | "lagging",
      yStart: number
    ): number => {
      s.addText(label, {
        x: 0.5, y: yStart, w: 12, h: 0.3,
        fontSize: 11, bold: true, color, charSpacing: 2,
      });
      const headers = ["Metric", ...months.map(shortMonthLabel)];
      const rows: TableRow[] = [
        headers.map<TableCell>((h, idx) => ({
          text: h,
          options: {
            bold: true, color: TEXT_PRIMARY, fill: { color: BORDER_SOFT },
            fontSize: 9, align: idx === 0 ? "left" : "center",
          },
        })),
      ];
      for (const metric of metrics) {
        const cells: TableRow = [
          {
            text: metric,
            options: { color: TEXT_PRIMARY, fill: { color: SURFACE_CARD }, fontSize: 9, align: "left" },
          },
          ...months.map<TableCell>((m) => ({
            text: valueOf(kind, metric, m),
            options: { color: TEXT_MUTED, fill: { color: SURFACE_CARD }, fontSize: 9, align: "center" },
          })),
        ];
        rows.push(cells);
      }
      const colW = computeColWidths(months.length);
      s.addTable(rows, {
        x: 0.5, y: yStart + 0.35, w: 12.3, colW,
        border: { type: "solid", color: BORDER_SOFT, pt: 0.5 },
      });
      const rowHeight = 0.28;
      return yStart + 0.35 + rows.length * rowHeight + 0.2;
    };

    const next = buildSection("LEADING METRICS", accent, config.metrics.leading, "leading", 2.3);
    buildSection("LAGGING METRICS", ACCENT_HEX.amber, config.metrics.lagging, "lagging", next + 0.2);
  }

  // ---------- Slide 6: Operating Plan ----------
  {
    const s = pptx.addSlide();
    setBg(s);
    addEyebrow(s, "OPERATING PLAN", accent);
    addTitle(s, config.plan.title);
    addSubhead(s, config.plan.subtitle);

    drawCard(s, { x: 0.5, y: 3.0, w: 12.3, h: 3.5, accent, dashed: true });
    s.addText("Data to be Inserted", {
      x: 0.5, y: 3.5, w: 12.3, h: 0.5,
      fontSize: 14, bold: true, color: TEXT_MUTED, align: "center", charSpacing: 4,
    });
    s.addText(config.plan.body, {
      x: 1.5, y: 4.3, w: 10.3, h: 1.5,
      fontSize: 14, color: TEXT_PRIMARY, align: "center",
    });
  }

  // ---------- Slide 7: Compensation ----------
  {
    const s = pptx.addSlide();
    setBg(s);
    addEyebrow(s, "VARIABLE BONUS STRUCTURE", accent);
    addTitle(s, "How performance ties to compensation");

    const count = config.bonusStructures.length;
    const cardW = (12.4 - 0.2 * (count - 1)) / Math.max(count, 1);
    const cardH = 4.0;
    config.bonusStructures.forEach((b, i) => {
      const x = 0.5 + i * (cardW + 0.2);
      const y = 2.5;
      drawCard(s, { x, y, w: cardW, h: cardH, accent });
      s.addText(b.title, {
        x: x + 0.25, y: y + 0.25, w: cardW - 0.5, h: 0.5,
        fontSize: 18, bold: true, color: TEXT_PRIMARY,
      });
      s.addText(
        b.bullets.map((line) => ({ text: line, options: { bullet: true, color: TEXT_PRIMARY } })),
        {
          x: x + 0.25, y: y + 0.85, w: cardW - 0.5, h: cardH - 1,
          fontSize: 11, color: TEXT_PRIMARY,
        }
      );
    });
  }

  // ---------- Slide 8: Organisation ----------
  {
    const s = pptx.addSlide();
    setBg(s);
    addEyebrow(s, "ORGANISATION", accent);
    addTitle(s, "Department lead, headcount, and teams");

    drawCard(s, { x: 0.5, y: 2.3, w: 6.0, h: 1.8, accent });
    s.addText(config.organisation.lead.role.toUpperCase(), {
      x: 0.7, y: 2.5, w: 5.6, h: 0.4, fontSize: 10, bold: true, color: accent, charSpacing: 3,
    });
    s.addText(config.organisation.lead.name, {
      x: 0.7, y: 2.95, w: 5.6, h: 0.8, fontSize: 28, bold: true, color: TEXT_PRIMARY,
    });

    drawCard(s, { x: 6.7, y: 2.3, w: 3.0, h: 1.8, accent });
    s.addText("CURRENT", { x: 6.85, y: 2.5, w: 2.7, h: 0.3, fontSize: 9, bold: true, color: TEXT_MUTED, charSpacing: 2 });
    s.addText(String(config.organisation.headcount.current), { x: 6.85, y: 2.85, w: 2.7, h: 1.0, fontSize: 36, bold: true, color: accent });

    drawCard(s, { x: 9.85, y: 2.3, w: 3.0, h: 1.8, accent: ACCENT_HEX.amber });
    s.addText("FY26 PLANNED", { x: 10.0, y: 2.5, w: 2.7, h: 0.3, fontSize: 9, bold: true, color: TEXT_MUTED, charSpacing: 2 });
    s.addText(String(config.organisation.headcount.planned), { x: 10.0, y: 2.85, w: 2.7, h: 1.0, fontSize: 36, bold: true, color: ACCENT_HEX.amber });

    s.addText("TEAMS", { x: 0.5, y: 4.3, w: 12, h: 0.3, fontSize: 11, bold: true, color: accent, charSpacing: 3 });
    const teamCount = config.organisation.teams.length;
    const teamW = (12.4 - 0.2 * Math.max(teamCount - 1, 0)) / Math.max(teamCount, 1);
    config.organisation.teams.forEach((t, i) => {
      const x = 0.5 + i * (teamW + 0.2);
      drawCard(s, { x, y: 4.7, w: teamW, h: 1.8, accent });
      s.addText(t.name, { x: x + 0.2, y: 4.85, w: teamW - 0.4, h: 0.5, fontSize: 14, bold: true, color: TEXT_PRIMARY });
      s.addText(t.description, { x: x + 0.2, y: 5.4, w: teamW - 0.4, h: 1.0, fontSize: 11, color: TEXT_MUTED });
    });
  }

  await pptx.writeFile({ fileName: `AOP-${config.name}-FY2026.pptx` });
}

// ---------- Helpers ----------

function addEyebrow(s: Slide, text: string, color: string) {
  s.addText(text, {
    x: 0.5, y: 0.5, w: 12, h: 0.3,
    fontSize: 11, bold: true, color, charSpacing: 4,
  });
}

function addTitle(s: Slide, text: string) {
  s.addText(text, {
    x: 0.5, y: 0.85, w: 12, h: 0.7,
    fontSize: 30, bold: true, color: TEXT_PRIMARY,
  });
}

function addSubhead(s: Slide, text: string) {
  s.addText(text, {
    x: 0.5, y: 1.6, w: 12, h: 0.5,
    fontSize: 14, color: TEXT_MUTED,
  });
}

function drawCard(
  s: Slide,
  opts: { x: number; y: number; w: number; h: number; accent: string; dashed?: boolean }
) {
  s.addShape("rect" as never, {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    fill: { color: SURFACE_CARD },
    line: opts.dashed
      ? { color: BORDER_SOFT, width: 1, dashType: "dash" }
      : { color: BORDER_SOFT, width: 0.5 },
  });
  if (!opts.dashed) {
    s.addShape("rect" as never, {
      x: opts.x, y: opts.y, w: 0.06, h: opts.h,
      fill: { color: opts.accent }, line: { color: opts.accent },
    });
  }
}

function formatNumber(n: number): string {
  if (n === 0) return "—";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function computeColWidths(monthCount: number): number[] {
  const totalW = 12.3;
  const metricW = 2.5;
  const remainder = totalW - metricW;
  const cellW = remainder / Math.max(monthCount, 1);
  return [metricW, ...Array(monthCount).fill(cellW)];
}
