import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const digits6 = z
  .string()
  .transform((s) => s.replace(/\D/g, ""))
  .pipe(
    z
      .string()
      .length(6, "Код має складатися з 6 цифр")
      .regex(/^\d{6}$/, "Код має містити лише цифри")
  );

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Вкажіть email")
    .email("Некоректний формат email"),
  code: digits6,
});

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Некоректне тіло запиту (очікується JSON)" },
        { status: 400 }
      );
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message ?? "Перевірте код та email";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { email, code: submittedCode } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Користувача з таким email не знайдено" },
        { status: 404 }
      );
    }

    const now = new Date();
    const codes = await prisma.verificationCode.findMany({
      where: {
        userId: user.id,
        expiresAt: { gt: now },
      },
    });

    /* email — поточний канал; phone — лише старі записи до відмови від SMS */
    const pc = codes.find(
      (c) =>
        (c.kind === "email" || c.kind === "phone") &&
        c.code === submittedCode
    );
    if (!pc) {
      return NextResponse.json(
        { error: "Невірний або прострочений код з email" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, phoneVerified: true },
      }),
      prisma.verificationCode.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
