import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CHAT_KINDS,
  isChatKind,
  looksLikeHttpUrl,
  MAX_MEDIA_CHARS,
  MAX_TEXT,
} from "@/lib/chat-media";
import { moderateUserText } from "@/lib/content-moderation";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUserForWrite } from "@/lib/session-guard";

async function getOrCreateGeneralRoom() {
  let room = await prisma.chatRoom.findFirst();
  if (!room) {
    room = await prisma.chatRoom.create({
      data: { name: "general" },
    });
  }
  return room;
}

export async function GET() {
  const room = await getOrCreateGeneralRoom();
  const messages = await prisma.chatMessage.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ roomId: room.id, messages });
}

const postSchema = z.object({
  kind: z.enum(CHAT_KINDS).optional(),
  text: z.string().max(MAX_TEXT).optional().default(""),
  mediaData: z.string().max(MAX_MEDIA_CHARS).optional().default(""),
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

  let kind = parsed.data.kind ?? "text";
  let text = parsed.data.text?.trim() ?? "";
  let mediaData = parsed.data.mediaData?.trim() ?? "";

  if (!isChatKind(kind)) kind = "text";

  if (["image", "video", "audio"].includes(kind)) {
    if (!mediaData.startsWith("data:")) {
      return NextResponse.json(
        { error: "Очікується файл (data URL)" },
        { status: 400 },
      );
    }
    if (mediaData.length > MAX_MEDIA_CHARS) {
      return NextResponse.json(
        { error: "Файл завеликий для чату" },
        { status: 400 },
      );
    }
  } else if (kind === "link") {
    if (!looksLikeHttpUrl(text)) {
      return NextResponse.json({ error: "Некоректне посилання" }, { status: 400 });
    }
    mediaData = "";
  } else {
    if (mediaData) {
      return NextResponse.json(
        { error: "Для тексту не використовуйте вкладення" },
        { status: 400 },
      );
    }
    if (!text) {
      return NextResponse.json({ error: "Порожнє повідомлення" }, { status: 400 });
    }
    kind = "text";
  }

  const check = await moderateUserText(text);
  if (!check.ok) {
    return NextResponse.json(
      { error: "moderation", code: "moderation", reason: check.reason },
      { status: 422 },
    );
  }

  const room = await getOrCreateGeneralRoom();
  const message = await prisma.chatMessage.create({
    data: {
      roomId: room.id,
      userId,
      kind,
      text,
      mediaData,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ message });
}
