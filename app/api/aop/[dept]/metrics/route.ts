import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getConfig, getDepartment } from "@/lib/aop/configs";
import { isValidFy26Month } from "@/lib/aop/months";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

type Entry = {
  kind: "leading" | "lagging";
  metric: string;
  month: string;
  value: number;
  notes?: string;
};

function isKind(value: unknown): value is "leading" | "lagging" {
  return value === "leading" || value === "lagging";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dept: string }> }
) {
  const { dept } = await params;
  if (!getDepartment(dept)) {
    return NextResponse.json({ error: "Unknown department" }, { status: 404 });
  }

  try {
    const rows = await prisma.aopMonthlyMetric.findMany({ where: { dept } });
    return NextResponse.json({ entries: rows }, { headers: NO_CACHE_HEADERS });
  } catch (e) {
    console.error("[aop/metrics GET]", e);
    return NextResponse.json(
      { entries: [] },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ dept: string }> }
) {
  const { dept } = await params;
  const config = getConfig(dept);
  if (!config) {
    return NextResponse.json({ error: "Unknown department" }, { status: 404 });
  }

  let body: { entries?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.entries)) {
    return NextResponse.json(
      { error: "entries must be an array" },
      { status: 400 }
    );
  }

  // Validate each entry against the dept's known metrics + FY26 months.
  const validLeading = new Set(config.metrics.leading);
  const validLagging = new Set(config.metrics.lagging);

  const cleaned: Entry[] = [];
  for (const raw of body.entries) {
    if (typeof raw !== "object" || raw === null) continue;
    const r = raw as Record<string, unknown>;
    if (!isKind(r.kind)) continue;
    if (typeof r.metric !== "string") continue;
    if (typeof r.month !== "string" || !isValidFy26Month(r.month)) continue;
    const value = typeof r.value === "number" ? r.value : Number(r.value);
    if (Number.isNaN(value)) continue;

    const known = r.kind === "leading" ? validLeading : validLagging;
    if (!known.has(r.metric)) continue;

    cleaned.push({
      kind: r.kind,
      metric: r.metric,
      month: r.month,
      value,
      notes: typeof r.notes === "string" ? r.notes : "",
    });
  }

  try {
    // Upsert each entry by composite key.
    await prisma.$transaction(
      cleaned.map((e) =>
        prisma.aopMonthlyMetric.upsert({
          where: {
            dept_kind_metric_month: {
              dept,
              kind: e.kind,
              metric: e.metric,
              month: e.month,
            },
          },
          create: {
            dept,
            kind: e.kind,
            metric: e.metric,
            month: e.month,
            value: e.value,
            notes: e.notes ?? "",
          },
          update: {
            value: e.value,
            notes: e.notes ?? "",
          },
        })
      )
    );
    return NextResponse.json({ ok: true, count: cleaned.length });
  } catch (e) {
    console.error("[aop/metrics PUT]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
