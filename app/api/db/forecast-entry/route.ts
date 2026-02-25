import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  const { productId, month, quantity } = await req.json();
  const qty = Math.max(0, Math.round(quantity));

  if (qty === 0) {
    await prisma.forecastEntry.deleteMany({
      where: { product_id: productId, month },
    });
  } else {
    await prisma.forecastEntry.upsert({
      where: { product_id_month: { product_id: productId, month } },
      update: { quantity: qty },
      create: { product_id: productId, month, quantity: qty },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const { entries } = await req.json();

  for (const e of entries) {
    const qty = Math.max(0, Math.round(e.qty));
    if (qty === 0) {
      await prisma.forecastEntry.deleteMany({
        where: { product_id: e.productId, month: e.month },
      });
    } else {
      await prisma.forecastEntry.upsert({
        where: { product_id_month: { product_id: e.productId, month: e.month } },
        update: { quantity: qty },
        create: { product_id: e.productId, month: e.month, quantity: qty },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
