import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  const { forecastId, key, quantity } = await req.json();
  const qty = Math.max(0, Math.round(quantity));

  if (qty === 0) {
    await prisma.savedForecastEntry.deleteMany({
      where: { forecast_id: forecastId, key },
    });
  } else {
    await prisma.savedForecastEntry.upsert({
      where: { forecast_id_key: { forecast_id: forecastId, key } },
      update: { quantity: qty },
      create: { forecast_id: forecastId, key, quantity: qty },
    });
  }

  await prisma.savedForecast.update({
    where: { id: forecastId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
