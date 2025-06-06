import type { User } from "discord.js";
import type { Prisma, PrismaClient } from "generated/prisma";

type AnimeListUserWithAnimes = Prisma.AnimeListUserGetPayload<{
  include: { animes: true };
}>;

export async function getAnimeListUser(
  prisma: PrismaClient,
  user: User,
): Promise<AnimeListUserWithAnimes | null> {
  const dbUser = await prisma.user.findUnique({
    where: {
      discordId: user.id,
    },
  });

  if (!dbUser) return null;

  const animeListUser = await prisma.animeListUser.findUnique({
    where: {
      userId: dbUser.id,
    },
    include: {
      animes: true,
    },
  });

  return animeListUser;
}
