import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const forecasts = await prisma.savedForecast.findMany({
    include: { entries: true },
    orderBy: { createdAt: "asc" },
  });

  const result = forecasts.map((f) => {
    const quantities: Record<string, number> = {};
    for (const e of f.entries) {
      quantities[e.key] = e.quantity;
    }
    return {
      id: f.id,
      name: f.name,
      locked: f.locked,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
      quantities,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const { id, name, quantities } = await req.json();

  const fc = await prisma.savedForecast.create({
    data: {
      id,
      name,
      entries: quantities
        ? {
            create: Object.entries(quantities).map(([key, qty]) => ({
              key,
              quantity: qty as number,
            })),
          }
        : undefined,
    },
  });

  return NextResponse.json({
    id: fc.id,
    name: fc.name,
    locked: fc.locked,
    createdAt: fc.createdAt.toISOString(),
    updatedAt: fc.updatedAt.toISOString(),
    quantities: quantities ?? {},
  });
}

export async function PUT(req: Request) {
  const { id, name } = await req.json();

  const fc = await prisma.savedForecast.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json({ ok: true, updatedAt: fc.updatedAt.toISOString() });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.savedForecast.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
