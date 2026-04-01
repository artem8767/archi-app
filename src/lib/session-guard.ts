import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserIdFromRequest } from "@/lib/auth";

export type WriteAuth =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Ensures the session exists and phone is verified (email is trusted at signup).
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
    select: { phoneVerified: true },
  });
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Потрібен вхід" }, { status: 401 }),
    };
  }
  if (!user.phoneVerified) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Спочатку підтвердіть номер телефону (код з SMS)",
          needVerification: true,
        },
        { status: 403 }
      ),
    };
  }
  return { ok: true, userId };
}
