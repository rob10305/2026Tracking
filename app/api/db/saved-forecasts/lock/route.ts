import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const FORECAST_LOCK_PASSWORD = process.env.FORECAST_LOCK_PASSWORD ?? "changeme";

export async function PUT(req: Request) {
  const { id, locked, password } = await req.json();

  if (password !== FORECAST_LOCK_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await prisma.savedForecast.update({
    where: { id },
    data: { locked: !!locked },
  });

  return NextResponse.json({ ok: true, locked: !!locked });
}
