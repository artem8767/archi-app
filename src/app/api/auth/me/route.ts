import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserIdFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getSessionUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      phoneVerified: true,
      locale: true,
      autoTranslate: true,
      notificationLevel: true,
      lat: true,
      lng: true,
      addressLabel: true,
      wallpaperId: true,
      uiTheme: true,
    },
  });
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
