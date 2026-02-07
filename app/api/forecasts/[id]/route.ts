import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// GET /api/forecasts/:id
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const forecast = await prisma.forecast.findUnique({
    where: { id },
    include: {
      scenarios: { orderBy: { sortOrder: "asc" } },
      timePeriods: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!forecast) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(forecast);
}

// PUT /api/forecasts/:id
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { name, description, type, granularity, startDate, endDate, config } = body;

  const forecast = await prisma.forecast.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(type !== undefined && { type }),
      ...(granularity !== undefined && { granularity }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(config !== undefined && { config: JSON.stringify(config) }),
    },
    include: {
      scenarios: { orderBy: { sortOrder: "asc" } },
      timePeriods: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(forecast);
}

// DELETE /api/forecasts/:id
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.forecast.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
