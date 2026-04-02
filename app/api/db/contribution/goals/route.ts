import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GOALS } from "@/lib/contribution/data";
import type { ContributorId, MetricId } from "@/lib/contribution/data";
import { CONTRIBUTION_MONTHS } from "@/lib/contribution/data";

// GET returns merged goals: DB overrides on top of hardcoded defaults
export async function GET() {
  const dbRows = await prisma.contributorGoal.findMany();

  // Start with hardcoded defaults
  const map: Record<string, number> = {};
  for (const [cid, metrics] of Object.entries(GOALS)) {
    for (const [mid, values] of Object.entries(metrics)) {
      for (let i = 0; i < CONTRIBUTION_MONTHS.length; i++) {
        const key = `${cid}::${mid}::${CONTRIBUTION_MONTHS[i]}`;
        map[key] = values[i];
      }
    }
  }

  // Override with DB values
  for (const r of dbRows) {
    const key = `${r.contributor_id}::${r.metric_id}::${r.month}`;
    map[key] = r.value;
  }

  return NextResponse.json(map);
}

// PUT upserts a single goal value
export async function PUT(req: NextRequest) {
  const { contributorId, metricId, month, value } = await req.json();
  if (!contributorId || !metricId || !month || value === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.contributorGoal.upsert({
    where: {
      contributor_id_metric_id_month: {
        contributor_id: contributorId,
        metric_id: metricId,
        month,
      },
    },
    create: {
      contributor_id: contributorId,
      metric_id: metricId,
      month,
      value,
    },
    update: { value },
  });

  return NextResponse.json({ ok: true });
}
