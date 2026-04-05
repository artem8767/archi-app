import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUserForWrite } from "@/lib/session-guard";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireVerifiedUserForWrite(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Невірні дані" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Не знайдено" }, { status: 404 });
  }
  if (listing.userId !== auth.userId) {
    return NextResponse.json({ error: "Заборонено" }, { status: 403 });
  }

  await prisma.comment.deleteMany({
    where: { targetType: "listing", targetId: id },
  });
  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
