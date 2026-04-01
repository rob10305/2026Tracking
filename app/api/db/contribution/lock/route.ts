import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "changeme";

export async function GET() {
  const locks = await prisma.contributorLock.findMany();
  const map: Record<string, { isLocked: boolean; hasPassword: boolean }> = {};
  for (const l of locks) {
    map[l.contributor_id] = { isLocked: l.is_locked, hasPassword: l.password !== "" };
  }
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  const { action, contributorId, password, currentPassword, adminPassword } = await req.json();

  if (!contributorId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.contributorLock.findUnique({
    where: { contributor_id: contributorId },
  });

  if (action === "set-lock") {
    if (!password || password.trim() === "") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }
    if (existing?.is_locked && existing.password !== "" && currentPassword !== existing.password) {
      return NextResponse.json({ error: "Current password incorrect" }, { status: 403 });
    }
    await prisma.contributorLock.upsert({
      where: { contributor_id: contributorId },
      create: { contributor_id: contributorId, password: password.trim(), is_locked: true },
      update: { password: password.trim(), is_locked: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "verify") {
    if (!existing || !existing.is_locked) {
      return NextResponse.json({ ok: true, adminOverride: false });
    }
    if (password === existing.password) {
      return NextResponse.json({ ok: true, adminOverride: false });
    }
    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ ok: true, adminOverride: true });
    }
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (action === "unlock") {
    if (!existing) return NextResponse.json({ ok: true });
    const isCorrectPassword = password === existing.password;
    const isAdmin = password === ADMIN_PASSWORD;
    if (!isCorrectPassword && !isAdmin) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
    }
    await prisma.contributorLock.update({
      where: { contributor_id: contributorId },
      data: { is_locked: false, password: "" },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "admin-reset") {
    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Admin password incorrect" }, { status: 403 });
    }
    await prisma.contributorLock.upsert({
      where: { contributor_id: contributorId },
      create: { contributor_id: contributorId, password: "", is_locked: false },
      update: { password: "", is_locked: false },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
