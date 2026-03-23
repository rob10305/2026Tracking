import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET() {
  const rows = await prisma.contributorActual.findMany();
  const map: Record<string, number | string> = {};
  for (const r of rows) {
    const base = `${r.contributor_id}::${r.metric_id}::${r.month}`;
    map[base] = r.value;
    if (r.notes) map[`${base}::notes`] = r.notes;
    if (r.sources) map[`${base}::sources`] = r.sources;
  }
  return NextResponse.json(map);
}

export async function PUT(req: NextRequest) {
  const { contributorId, metricId, month, value, notes, sources } = await req.json();
  if (!contributorId || !metricId || !month) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const updateData: Prisma.ContributorActualUpdateInput = {};
  if (value !== undefined) updateData.value = value;
  if (notes !== undefined) updateData.notes = notes;
  if (sources !== undefined) updateData.sources = sources;

  await prisma.contributorActual.upsert({
    where: { contributor_id_metric_id_month: { contributor_id: contributorId, metric_id: metricId, month } },
    create: {
      contributor_id: contributorId,
      metric_id: metricId,
      month,
      value: value ?? 0,
      notes: notes ?? "",
      sources: sources ?? "",
    },
    update: updateData,
  });
  return NextResponse.json({ ok: true });
}
