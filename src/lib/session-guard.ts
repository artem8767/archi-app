import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserIdFromRequest } from "@/lib/auth";

export type WriteAuth =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Ensures the session exists and signup verification is complete (email code; phoneVerified лише для сумісності зі старими акаунтами).
 */
export async function requireVerifiedUserForWrite(
  req: Request
): Promise<WriteAuth> {
  const userId = await getSessionUserIdFromRequest(req);
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Потрібен вхід" }, { status: 401 }),
    };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, phoneVerified: true },
  });
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Потрібен вхід" }, { status: 401 }),
    };
  }
  if (!user.emailVerified && !user.phoneVerified) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Спочатку підтвердіть обліковий запис (код з email на сторінці після реєстрації)",
          needVerification: true,
        },
        { status: 403 }
      ),
    };
  }
  return { ok: true, userId };
}
