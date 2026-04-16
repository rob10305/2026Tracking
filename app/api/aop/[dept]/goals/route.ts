import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDepartment } from "@/lib/aop/configs";
import { isValidFy26Month } from "@/lib/aop/months";

export const dynamic = "force-dynamic";

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

type GoalInput = {
  id?: string;
  order: number;
  number: string;
  title: string;
  description: string;
};

type ProgressInput = {
  month: string;
  rag: string;
  note: string;
};

const VALID_RAG = new Set(["", "red", "amber", "green"]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dept: string }> }
) {
  const { dept } = await params;
  if (!getDepartment(dept)) {
    return NextResponse.json({ error: "Unknown department" }, { status: 404 });
  }
  try {
    const goals = await prisma.aopGoal.findMany({
      where: { dept },
      orderBy: { order: "asc" },
      include: { progress: true },
    });
    return NextResponse.json({ goals }, { headers: NO_CACHE });
  } catch (e) {
    console.error("[aop/goals GET]", e);
    return NextResponse.json({ goals: [] }, { headers: NO_CACHE });
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

  let body: {
    goals?: Array<GoalInput & { progress?: ProgressInput[] }>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.goals)) {
    return NextResponse.json({ error: "goals must be an array" }, { status: 400 });
  }

  try {
    // Delete goals not in the incoming list.
    const keepIds = body.goals.map((g) => g.id).filter((id): id is string => !!id);
    await prisma.aopGoal.deleteMany({
      where: {
        dept,
        id: keepIds.length ? { notIn: keepIds } : undefined,
      },
    });

    for (let idx = 0; idx < body.goals.length; idx++) {
      const g = body.goals[idx];
      const progress = Array.isArray(g.progress) ? g.progress : [];
      const cleanedProgress = progress.filter(
        (p) => isValidFy26Month(p.month) && VALID_RAG.has(p.rag)
      );

      if (g.id) {
        await prisma.aopGoal.update({
          where: { id: g.id },
          data: {
            order: idx,
            number: String(g.number ?? ""),
            title: String(g.title ?? ""),
            description: String(g.description ?? ""),
          },
        });
      } else {
        const created = await prisma.aopGoal.create({
          data: {
            dept,
            order: idx,
            number: String(g.number ?? ""),
            title: String(g.title ?? ""),
            description: String(g.description ?? ""),
          },
        });
        g.id = created.id;
      }

      // Upsert progress for this goal.
      for (const p of cleanedProgress) {
        await prisma.aopGoalProgress.upsert({
          where: { goalId_month: { goalId: g.id!, month: p.month } },
          create: {
            goalId: g.id!,
            month: p.month,
            rag: p.rag,
            note: String(p.note ?? ""),
          },
          update: {
            rag: p.rag,
            note: String(p.note ?? ""),
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[aop/goals PUT]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
