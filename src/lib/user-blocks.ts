import { prisma } from "@/lib/prisma";

/** Users the viewer has blocked (one-way: viewer does not see their content). */
export async function getBlockedUserIds(blockerId: string | null): Promise<Set<string>> {
  if (!blockerId) return new Set();
  const rows = await prisma.userBlock.findMany({
    where: { blockerId },
    select: { blockedId: true },
  });
  return new Set(rows.map((r) => r.blockedId));
}
