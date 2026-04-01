import { NextResponse } from "next/server";
import { z } from "zod";
import { moderateUserText } from "@/lib/content-moderation";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUserForWrite } from "@/lib/session-guard";

const types = ["news", "listing", "job"] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");
  if (
    !targetType ||
    !targetId ||
    !types.includes(targetType as (typeof types)[number])
  ) {
    return NextResponse.json({ error: "Невірні параметри" }, { status: 400 });
  }
  const comments = await prisma.comment.findMany({
    where: { targetType, targetId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ comments });
}

const postSchema = z.object({
  targetType: z.enum(types),
  targetId: z.string().min(1),
  body: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  const auth = await requireVerifiedUserForWrite(req);
  if (!auth.ok) return auth.response;
  const { userId } = auth;
  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Невірні дані" }, { status: 400 });
  }
  const mod = await moderateUserText(parsed.data.body);
  if (!mod.ok) {
    return NextResponse.json(
      { error: "moderation", code: "moderation", reason: mod.reason },
      { status: 422 },
    );
  }
  const comment = await prisma.comment.create({
    data: {
      userId,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      body: parsed.data.body,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ comment });
}
