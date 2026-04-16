import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDepartment } from "@/lib/aop/configs";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const VALID_RAG = new Set(["", "red", "amber", "green"]);

type InitiativeInput = {
  id?: string;
  order: number;
  number: string;
  description: string;
  owner: string;
  q1Rag: string;
  q2Rag: string;
  q3Rag: string;
  q4Rag: string;
  q1Note: string;
  q2Note: string;
  q3Note: string;
  q4Note: string;
};

type InsightInput = {
  id?: string;
  order: number;
  body: string;
};

function sanitizeRag(r: unknown): string {
  return typeof r === "string" && VALID_RAG.has(r) ? r : "";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dept: string }> }
) {
  const { dept } = await params;
  if (!getDepartment(dept)) {
    return NextResponse.json({ error: "Unknown department" }, { status: 404 });
  }
  try {
    const [initiatives, insights] = await Promise.all([
      prisma.aopInitiative.findMany({ where: { dept }, orderBy: { order: "asc" } }),
      prisma.aopInsight.findMany({ where: { dept }, orderBy: { order: "asc" } }),
    ]);
    return NextResponse.json({ initiatives, insights }, { headers: NO_CACHE });
  } catch (e) {
    console.error("[aop/initiatives GET]", e);
    return NextResponse.json({ initiatives: [], insights: [] }, { headers: NO_CACHE });
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

  let body: { initiatives?: InitiativeInput[]; insights?: InsightInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const initiatives = Array.isArray(body.initiatives) ? body.initiatives : [];
  const insights = Array.isArray(body.insights) ? body.insights : [];

  try {
    // --- Initiatives
    const keepInitiativeIds = initiatives
      .map((i) => i.id)
      .filter((id): id is string => !!id);
    await prisma.aopInitiative.deleteMany({
      where: {
        dept,
        id: keepInitiativeIds.length ? { notIn: keepInitiativeIds } : undefined,
      },
    });
    for (let idx = 0; idx < initiatives.length; idx++) {
      const i = initiatives[idx];
      const data = {
        order: idx,
        number: String(i.number ?? ""),
        description: String(i.description ?? ""),
        owner: String(i.owner ?? ""),
        q1Rag: sanitizeRag(i.q1Rag),
        q2Rag: sanitizeRag(i.q2Rag),
        q3Rag: sanitizeRag(i.q3Rag),
        q4Rag: sanitizeRag(i.q4Rag),
        q1Note: String(i.q1Note ?? ""),
        q2Note: String(i.q2Note ?? ""),
        q3Note: String(i.q3Note ?? ""),
        q4Note: String(i.q4Note ?? ""),
      };
      if (i.id) {
        await prisma.aopInitiative.update({ where: { id: i.id }, data });
      } else {
        await prisma.aopInitiative.create({ data: { dept, ...data } });
      }
    }

    // --- Insights
    const keepInsightIds = insights.map((x) => x.id).filter((id): id is string => !!id);
    await prisma.aopInsight.deleteMany({
      where: {
        dept,
        id: keepInsightIds.length ? { notIn: keepInsightIds } : undefined,
      },
    });
    for (let idx = 0; idx < insights.length; idx++) {
      const x = insights[idx];
      if (x.id) {
        await prisma.aopInsight.update({
          where: { id: x.id },
          data: { order: idx, body: String(x.body ?? "") },
        });
      } else {
        await prisma.aopInsight.create({
          data: { dept, order: idx, body: String(x.body ?? "") },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[aop/initiatives PUT]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
