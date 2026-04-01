import { NextResponse } from "next/server";
import { z } from "zod";
import { moderateCombinedText } from "@/lib/content-moderation";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUserForWrite } from "@/lib/session-guard";

export async function GET() {
  const posts = await prisma.newsPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ posts });
}

const postSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(1).max(20000),
  images: z.array(z.string()).max(6).optional(),
  videoUrl: z.string().url().max(2000).optional().nullable(),
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
  const images = parsed.data.images ?? [];
  for (const img of images) {
    if (img.length > 600_000) {
      return NextResponse.json({ error: "Фото занадто велике" }, { status: 400 });
    }
  }
  const videoUrl =
    parsed.data.videoUrl?.trim() === "" ? null : parsed.data.videoUrl?.trim() ?? null;

  const mod = await moderateCombinedText([
    parsed.data.title,
    parsed.data.body,
    videoUrl ?? "",
  ]);
  if (!mod.ok) {
    return NextResponse.json(
      { error: "moderation", code: "moderation", reason: mod.reason },
      { status: 422 },
    );
  }

  const post = await prisma.newsPost.create({
    data: {
      userId,
      title: parsed.data.title,
      body: parsed.data.body,
      imagesJson: JSON.stringify(images),
      videoUrl,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ post });
}
