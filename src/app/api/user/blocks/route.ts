import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUserForWrite } from "@/lib/session-guard";

const postSchema = z.object({
  email: z.string().email().max(320),
});

export async function GET(req: Request) {
  const auth = await requireVerifiedUserForWrite(req);
  if (!auth.ok) return auth.response;
  const { userId } = auth;
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      blocked: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({
    blocks: blocks.map((b) => ({
      id: b.id,
      blockedId: b.blockedId,
      user: b.blocked,
      createdAt: b.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireVerifiedUserForWrite(req);
  if (!auth.ok) return auth.response;
  const { userId } = auth;
  const body = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", code: "invalid" }, { status: 400 });
  }
  const email = parsed.data.email.trim();
  let target = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!target && email.toLowerCase() !== email) {
    target = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
  }
  if (!target) {
    return NextResponse.json({ error: "not_found", code: "not_found" }, { status: 404 });
  }
  if (target.id === userId) {
    return NextResponse.json({ error: "self", code: "self" }, { status: 400 });
  }
  try {
    await prisma.userBlock.create({
      data: { blockerId: userId, blockedId: target.id },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "already", code: "already" }, { status: 409 });
    }
    throw e;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await requireVerifiedUserForWrite(req);
  if (!auth.ok) return auth.response;
  const { userId } = auth;
  const { searchParams } = new URL(req.url);
  const blockedId = searchParams.get("blockedId")?.trim();
  if (!blockedId) {
    return NextResponse.json({ error: "missing_blockedId" }, { status: 400 });
  }
  const result = await prisma.userBlock.deleteMany({
    where: { blockerId: userId, blockedId },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
