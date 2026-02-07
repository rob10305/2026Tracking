import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string; scenarioId: string }> };

// GET /api/forecasts/:id/scenarios/:scenarioId
export async function GET(_request: NextRequest, { params }: Params) {
  const { scenarioId } = await params;
  const scenario = await prisma.scenario.findUnique({
    where: { id: scenarioId },
    include: { lineItems: true },
  });

  if (!scenario) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(scenario);
}

// PUT /api/forecasts/:id/scenarios/:scenarioId
export async function PUT(request: NextRequest, { params }: Params) {
  const { scenarioId } = await params;
  const body = await request.json();
  const { name, color, isBaseline, sortOrder } = body;

  const scenario = await prisma.scenario.update({
    where: { id: scenarioId },
    data: {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
      ...(isBaseline !== undefined && { isBaseline }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });

  return NextResponse.json(scenario);
}

// DELETE /api/forecasts/:id/scenarios/:scenarioId
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { scenarioId } = await params;
  await prisma.scenario.delete({ where: { id: scenarioId } });
  return NextResponse.json({ ok: true });
}
