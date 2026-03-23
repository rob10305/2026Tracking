import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const rows = await prisma.contributorActual.findMany();
  const map: Record<string, number> = {};
  for (const r of rows) {
    map[`${r.contributor_id}::${r.metric_id}::${r.month}`] = r.value;
  }
  return NextResponse.json(map);
}

export async function PUT(req: NextRequest) {
  const { contributorId, metricId, month, value } = await req.json();
  if (!contributorId || !metricId || !month) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  await prisma.contributorActual.upsert({
    where: { contributor_id_metric_id_month: { contributor_id: contributorId, metric_id: metricId, month } },
    create: { contributor_id: contributorId, metric_id: metricId, month, value: value ?? 0 },
    update: { value: value ?? 0 },
  });
  return NextResponse.json({ ok: true });
}
