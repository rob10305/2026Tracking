import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDepartment } from "@/lib/aop/configs";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const VALID_KINDS = new Set(["onTarget", "offTarget", "needChange", "lessons"]);

type RetroItem = { id?: string; kind: string; order: number; body: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dept: string }> }
) {
  const { dept } = await params;
  if (!getDepartment(dept)) {
    return NextResponse.json({ error: "Unknown department" }, { status: 404 });
  }
  try {
    const items = await prisma.aopRetrospect.findMany({
      where: { dept },
      orderBy: [{ kind: "asc" }, { order: "asc" }],
    });
    return NextResponse.json({ items }, { headers: NO_CACHE });
  } catch (e) {
    console.error("[aop/retrospect GET]", e);
    return NextResponse.json({ items: [] }, { headers: NO_CACHE });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ dept: string }> }
) {
  const { dept } = await params;
  if (!getDepartment(dept)) {
    return NextResponse.json({ error: "Unknown department" }, { status: 404 });
  }

  let body: { items?: RetroItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = (Array.isArray(body.items) ? body.items : []).filter((i) =>
    VALID_KINDS.has(i.kind)
  );

  try {
    const keepIds = incoming.map((x) => x.id).filter((id): id is string => !!id);
    await prisma.aopRetrospect.deleteMany({
      where: { dept, id: keepIds.length ? { notIn: keepIds } : undefined },
    });
    // Assign a per-kind sequential order so UI reordering works.
    const perKindOrder: Record<string, number> = {};
    for (const item of incoming) {
      const order = perKindOrder[item.kind] ?? 0;
      perKindOrder[item.kind] = order + 1;
      if (item.id) {
        await prisma.aopRetrospect.update({
          where: { id: item.id },
          data: { kind: item.kind, order, body: String(item.body ?? "") },
        });
      } else {
        await prisma.aopRetrospect.create({
          data: { dept, kind: item.kind, order, body: String(item.body ?? "") },
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[aop/retrospect PUT]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
