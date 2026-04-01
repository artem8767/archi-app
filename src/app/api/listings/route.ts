import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isListingSectionId,
  LISTING_SECTION_IDS,
} from "@/lib/marketplace-sections";
import { moderateCombinedText } from "@/lib/content-moderation";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUserForWrite } from "@/lib/session-guard";

const categories = [
  "sell",
  "buy",
  "rent",
  "service_offer",
  "service_seek",
] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const section = searchParams.get("section");
  const baseWhere =
    category && categories.includes(category as (typeof categories)[number])
      ? { category }
      : {};
  const where =
    section && section !== "all" && isListingSectionId(section)
      ? { ...baseWhere, section }
      : baseWhere;
  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ listings });
}

const postSchema = z.object({
  category: z.enum(categories),
  section: z.enum(LISTING_SECTION_IDS).optional(),
  title: z.string().min(1).max(300),
  description: z.string().min(1).max(20000),
  price: z.string().min(1).max(120),
  phone: z.string().min(5).max(40),
  photos: z.array(z.string()).max(8).optional(),
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
  const photos = parsed.data.photos ?? [];
  for (const p of photos) {
    if (p.length > 600_000) {
      return NextResponse.json({ error: "Фото занадто велике" }, { status: 400 });
    }
  }
  const mod = await moderateCombinedText([
    parsed.data.title,
    parsed.data.description,
    parsed.data.price,
  ]);
  if (!mod.ok) {
    return NextResponse.json(
      { error: "moderation", code: "moderation", reason: mod.reason },
      { status: 422 },
    );
  }
  const listing = await prisma.listing.create({
    data: {
      userId,
      category: parsed.data.category,
      section: parsed.data.section ?? "general",
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      phone: parsed.data.phone,
      photosJson: JSON.stringify(photos),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ listing });
}
