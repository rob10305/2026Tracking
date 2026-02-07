import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; scenarioId: string }> };

// GET /api/forecasts/:id/scenarios/:scenarioId/line-items
export async function GET(_request: NextRequest, { params }: Params) {
  const { scenarioId } = await params;
  const lineItems = await prisma.lineItem.findMany({
    where: { scenarioId },
    include: { timePeriod: true },
    orderBy: [{ category: "asc" }, { subcategory: "asc" }, { timePeriod: { sortOrder: "asc" } }],
  });
  return NextResponse.json(lineItems);
}

// PUT /api/forecasts/:id/scenarios/:scenarioId/line-items — bulk upsert
export async function PUT(request: NextRequest, { params }: Params) {
  const { scenarioId } = await params;
  const body = await request.json();
  const { items } = body as {
    items: Array<{
      timePeriodId: string;
      category: string;
      subcategory?: string;
      value: number;
      metadata?: Record<string, unknown>;
    }>;
  };

  if (!Array.isArray(items)) {
    return NextResponse.json(
      { error: "items array is required" },
      { status: 400 },
    );
  }

  const results = await prisma.$transaction(
    items.map((item) =>
      prisma.lineItem.upsert({
        where: {
          scenarioId_timePeriodId_category_subcategory: {
            scenarioId,
            timePeriodId: item.timePeriodId,
            category: item.category,
            subcategory: item.subcategory ?? "",
          },
        },
        update: {
          value: item.value,
          ...(item.metadata !== undefined && {
            metadata: JSON.stringify(item.metadata),
          }),
        },
        create: {
          scenarioId,
          timePeriodId: item.timePeriodId,
          category: item.category,
          subcategory: item.subcategory ?? "",
          value: item.value,
          metadata: JSON.stringify(item.metadata ?? {}),
        },
      }),
    ),
  );

  return NextResponse.json(results);
}
