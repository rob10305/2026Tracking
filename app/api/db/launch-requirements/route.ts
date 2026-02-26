import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  const { productId, requirements } = await req.json();

  await prisma.launchRequirement.deleteMany({
    where: { product_id: productId },
  });

  const data = requirements.map((r: any, i: number) => ({
    product_id: productId,
    deliverable: r.deliverable,
    owner: r.owner ?? "",
    criticalPath: r.criticalPath ?? "",
    timeline: r.timeline ?? "",
    content: r.content ?? "",
    dependency: r.dependency ?? "",
    sort_order: i,
  }));

  await prisma.launchRequirement.createMany({ data });

  return NextResponse.json({ ok: true });
}
