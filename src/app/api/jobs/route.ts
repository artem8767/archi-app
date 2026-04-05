import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserIdFromRequest } from "@/lib/auth";
import { moderateCombinedText } from "@/lib/content-moderation";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUserForWrite } from "@/lib/session-guard";
import { getBlockedUserIds } from "@/lib/user-blocks";

export async function GET(req: Request) {
  const viewerId = await getSessionUserIdFromRequest(req);
  const blocked = await getBlockedUserIds(viewerId);
  const jobs = await prisma.job.findMany({
    where: blocked.size > 0 ? { userId: { notIn: [...blocked] } } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ jobs });
}

const postSchema = z.object({
  city: z.string().min(1).max(200),
  vacancy: z.string().min(1).max(300),
  pay: z.string().min(1).max(120),
  phone: z.string().min(5).max(40),
  photo: z.string().max(600_000).optional().nullable(),
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
  const mod = await moderateCombinedText([
    parsed.data.city,
    parsed.data.vacancy,
    parsed.data.pay,
  ]);
  if (!mod.ok) {
    return NextResponse.json(
      { error: "moderation", code: "moderation", reason: mod.reason },
      { status: 422 },
    );
  }
  const job = await prisma.job.create({
    data: {
      userId,
      city: parsed.data.city,
      vacancy: parsed.data.vacancy,
      pay: parsed.data.pay,
      phone: parsed.data.phone,
      photo: parsed.data.photo ?? null,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ job });
}
