import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { moderateUserText } from "@/lib/content-moderation";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUserForWrite } from "@/lib/session-guard";

const bodySchema = z.object({
  reason: z.string().max(1000).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireVerifiedUserForWrite(req);
  if (!auth.ok) return auth.response;
  const { userId } = auth;
  const { id: newsPostId } = await params;

  const post = await prisma.newsPost.findUnique({
    where: { id: newsPostId },
    select: { userId: true, videoUrl: true },
  });
  if (!post) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const v = post.videoUrl?.trim();
  if (!v) {
    return NextResponse.json({ error: "no_video", code: "no_video" }, { status: 400 });
  }
  if (post.userId === userId) {
    return NextResponse.json({ error: "own_post", code: "own_post" }, { status: 400 });
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const reason = (parsed.data.reason ?? "").trim();
  if (reason.length > 0) {
    const mod = await moderateUserText(reason);
    if (!mod.ok) {
      return NextResponse.json(
        { error: "moderation", code: "moderation", reason: mod.reason },
        { status: 422 },
      );
    }
  }

  try {
    await prisma.newsVideoReport.create({
      data: {
        reporterId: userId,
        newsPostId,
        reason,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "already_reported", code: "already_reported" },
        { status: 409 },
      );
    }
    throw e;
  }

  return NextResponse.json({ ok: true });
}
