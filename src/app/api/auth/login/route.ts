import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Невірні дані" }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Невірний email або пароль" },
        { status: 401 }
      );
    }

    if (!user.phoneVerified) {
      return NextResponse.json(
        {
          error: "Спочатку підтвердіть номер телефону (код з SMS)",
          needVerification: true,
        },
        { status: 403 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Невірний email або пароль" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user.id);
    await setSessionCookie(token);

    const mobile = req.headers.get("x-archi-client") === "mobile";

    return NextResponse.json({
      ok: true,
      ...(mobile ? { accessToken: token } : {}),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        locale: user.locale,
        autoTranslate: user.autoTranslate,
        notificationLevel: user.notificationLevel,
        lat: user.lat,
        lng: user.lng,
        addressLabel: user.addressLabel,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
