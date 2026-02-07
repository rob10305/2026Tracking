import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTimePeriods } from "@/lib/calc/time-periods";

// GET /api/forecasts — list all forecasts
export async function GET() {
  const forecasts = await prisma.forecast.findMany({
    include: {
      _count: { select: { scenarios: true, timePeriods: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(forecasts);
}

// POST /api/forecasts — create a new forecast
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, type, granularity, startDate, endDate, config } = body;

  if (!name || !startDate || !endDate) {
    return NextResponse.json(
      { error: "name, startDate, and endDate are required" },
      { status: 400 },
    );
  }

  const forecast = await prisma.forecast.create({
    data: {
      name,
      description: description ?? "",
      type: type ?? "financial",
      granularity: granularity ?? "monthly",
      startDate,
      endDate,
      config: JSON.stringify(config ?? {}),
    },
  });

  // Auto-generate time periods
  const periods = generateTimePeriods(startDate, endDate, forecast.granularity);
  if (periods.length > 0) {
    await prisma.timePeriod.createMany({
      data: periods.map((p) => ({
        forecastId: forecast.id,
        label: p.label,
        startDate: p.startDate,
        endDate: p.endDate,
        sortOrder: p.sortOrder,
      })),
    });
  }

  // Auto-create a baseline scenario
  await prisma.scenario.create({
    data: {
      forecastId: forecast.id,
      name: "Baseline",
      isBaseline: true,
      sortOrder: 0,
    },
  });

  const result = await prisma.forecast.findUnique({
    where: { id: forecast.id },
    include: {
      scenarios: true,
      timePeriods: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(result, { status: 201 });
}
