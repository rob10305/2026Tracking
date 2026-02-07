import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// GET /api/forecasts/:id/scenarios
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const scenarios = await prisma.scenario.findMany({
    where: { forecastId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(scenarios);
}

// POST /api/forecasts/:id/scenarios
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { name, color, isBaseline, sortOrder, cloneFromId } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Get next sort order if not provided
  let order = sortOrder;
  if (order === undefined) {
    const max = await prisma.scenario.aggregate({
      where: { forecastId: id },
      _max: { sortOrder: true },
    });
    order = (max._max.sortOrder ?? -1) + 1;
  }

  const scenario = await prisma.scenario.create({
    data: {
      forecastId: id,
      name,
      color: color ?? "#3b82f6",
      isBaseline: isBaseline ?? false,
      sortOrder: order,
    },
  });

  // Clone line items from another scenario if requested
  if (cloneFromId) {
    const sourceItems = await prisma.lineItem.findMany({
      where: { scenarioId: cloneFromId },
    });
    if (sourceItems.length > 0) {
      await prisma.lineItem.createMany({
        data: sourceItems.map((item) => ({
          scenarioId: scenario.id,
          timePeriodId: item.timePeriodId,
          category: item.category,
          subcategory: item.subcategory,
          value: item.value,
          metadata: item.metadata,
        })),
      });
    }
  }

  return NextResponse.json(scenario, { status: 201 });
}
