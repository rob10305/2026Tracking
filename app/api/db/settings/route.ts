import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  const body = await req.json();
  const { key, value } = body;

  await prisma.appSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json({ ok: true });
}
