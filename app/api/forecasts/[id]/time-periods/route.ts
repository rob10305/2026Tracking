import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTimePeriods } from "@/lib/calc/time-periods";

type Params = { params: Promise<{ id: string }> };

// GET /api/forecasts/:id/time-periods
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const timePeriods = await prisma.timePeriod.findMany({
    where: { forecastId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(timePeriods);
}

// POST /api/forecasts/:id/time-periods — regenerate time periods
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { startDate, endDate, granularity } = body;

  const forecast = await prisma.forecast.findUnique({ where: { id } });
  if (!forecast) {
    return NextResponse.json({ error: "Forecast not found" }, { status: 404 });
  }

  const sd = startDate ?? forecast.startDate;
  const ed = endDate ?? forecast.endDate;
  const gran = granularity ?? forecast.granularity;

  // Delete existing time periods (cascades to line items)
  await prisma.timePeriod.deleteMany({ where: { forecastId: id } });

  // Generate new periods
  const periods = generateTimePeriods(sd, ed, gran);
  if (periods.length > 0) {
    await prisma.timePeriod.createMany({
      data: periods.map((p) => ({
        forecastId: id,
        label: p.label,
        startDate: p.startDate,
        endDate: p.endDate,
        sortOrder: p.sortOrder,
      })),
    });
  }

  // Update forecast dates/granularity
  await prisma.forecast.update({
    where: { id },
    data: { startDate: sd, endDate: ed, granularity: gran },
  });

  const result = await prisma.timePeriod.findMany({
    where: { forecastId: id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(result, { status: 201 });
}
