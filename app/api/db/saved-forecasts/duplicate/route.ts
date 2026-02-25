import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { sourceId, newId, newName } = await req.json();

  const source = await prisma.savedForecast.findUnique({
    where: { id: sourceId },
    include: { entries: true },
  });

  if (!source) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 });
  }

  const fc = await prisma.savedForecast.create({
    data: {
      id: newId,
      name: newName,
      entries: {
        create: source.entries.map((e) => ({
          key: e.key,
          quantity: e.quantity,
        })),
      },
    },
  });

  const quantities: Record<string, number> = {};
  for (const e of source.entries) {
    quantities[e.key] = e.quantity;
  }

  return NextResponse.json({
    id: fc.id,
    name: fc.name,
    createdAt: fc.createdAt.toISOString(),
    updatedAt: fc.updatedAt.toISOString(),
    quantities,
  });
}
