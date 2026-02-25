import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { forecasts } = body;

    if (!Array.isArray(forecasts)) {
      return NextResponse.json({ error: "forecasts array is required" }, { status: 400 });
    }

    let synced = 0;
    for (const fc of forecasts) {
      if (!fc.id || !fc.name) continue;

      const existing = await prisma.savedForecast.findUnique({
        where: { id: fc.id },
      });

      if (existing) {
        await prisma.savedForecastEntry.deleteMany({
          where: { forecast_id: fc.id },
        });

        await prisma.savedForecast.update({
          where: { id: fc.id },
          data: { name: fc.name },
        });
      } else {
        await prisma.savedForecast.create({
          data: { id: fc.id, name: fc.name },
        });
      }

      const entries = Object.entries(fc.quantities || {});
      if (entries.length > 0) {
        await prisma.savedForecastEntry.createMany({
          data: entries.map(([key, qty]) => ({
            forecast_id: fc.id,
            key,
            quantity: qty as number,
          })),
        });
      }
      synced++;
    }

    return NextResponse.json({ success: true, synced });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
