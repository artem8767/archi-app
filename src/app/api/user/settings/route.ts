import { NextResponse } from "next/server";
import { z } from "zod";
import { LOCALE_CODES_FOR_ZOD } from "@/i18n/locale-config";
import { WALLPAPER_IDS_FOR_ZOD } from "@/lib/wallpapers";
import { UI_THEME_IDS_FOR_ZOD } from "@/lib/ui-theme";
import { prisma } from "@/lib/prisma";
import { requireVerifiedUserForWrite } from "@/lib/session-guard";

const patchSchema = z.object({
  locale: z.enum(LOCALE_CODES_FOR_ZOD).optional(),
  autoTranslate: z.boolean().optional(),
  notificationLevel: z.number().min(0).max(100).optional(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  addressLabel: z.string().max(500).optional().nullable(),
  wallpaperId: z.enum(WALLPAPER_IDS_FOR_ZOD).optional(),
  uiTheme: z.enum(UI_THEME_IDS_FOR_ZOD).optional(),
});

export async function PATCH(req: Request) {
  const auth = await requireVerifiedUserForWrite(req);
  if (!auth.ok) return auth.response;
  const { userId } = auth;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Невірні дані" }, { status: 400 });
  }
  const data = parsed.data;
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.locale !== undefined && { locale: data.locale }),
      ...(data.autoTranslate !== undefined && {
        autoTranslate: data.autoTranslate,
      }),
      ...(data.notificationLevel !== undefined && {
        notificationLevel: data.notificationLevel,
      }),
      ...(data.lat !== undefined && { lat: data.lat }),
      ...(data.lng !== undefined && { lng: data.lng }),
      ...(data.addressLabel !== undefined && {
        addressLabel: data.addressLabel,
      }),
      ...(data.wallpaperId !== undefined && { wallpaperId: data.wallpaperId }),
      ...(data.uiTheme !== undefined && { uiTheme: data.uiTheme }),
    },
    select: {
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
  return NextResponse.json({ user });
}
