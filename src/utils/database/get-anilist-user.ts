import type { User } from "discord.js";
import type { AnilistUser, PrismaClient } from "generated/prisma";

export async function getAnilistUser(
  prisma: PrismaClient,
  user: User,
): Promise<AnilistUser | null> {
  const dbUser = await prisma.user.findUnique({
    where: {
      discordId: user.id,
    },
  });

  if (!dbUser || !dbUser.anilistUserId) return null;

  const anilistUser = await prisma.anilistUser.findUnique({
    where: {
      id: dbUser.anilistUserId,
    },
  });

  return anilistUser;
}
