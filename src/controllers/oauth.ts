import type { PrismaClient } from "generated/prisma";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { DiscordUser } from "types/discord-user";
import type { TokenResponse } from "types/token-response";
import type { RedisClient } from "bun";

export async function redirectDiscord(reply: FastifyReply) {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${Bun.env.CLIENT_ID}&redirect_uri=${Bun.env.REDIRECT_URI}&response_type=code&scope=identify+email`;
  await reply.redirect(url);
}

export async function oauthDiscord(
  request: FastifyRequest,
  reply: FastifyReply,
  prisma: PrismaClient,
  redis: RedisClient,
) {
  const { code } = request.query as { code?: string };
  if (!code) return reply.status(400).send("Missing code");

  try {
    const requestToken = new Request("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: Bun.env.REDIRECT_URI,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${Bun.env.CLIENT_ID}:${Bun.env.CLIENT_SECRET}`)}`,
      },
    });
    const responseToken = await fetch(requestToken);
    if (!responseToken.ok) {
      throw new Error("Auth discord failled");
    }

    const token = (await responseToken.json()) as TokenResponse;

    const requestUser = new Request("https://discord.com/api/users/@me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    const responseUser = await fetch(requestUser);
    if (!responseUser.ok) {
      throw new Error("Discord user not found");
    }

    const discordUser = (await responseUser.json()) as DiscordUser;

    const dbUser = await prisma.user.upsert({
      where: {
        discordId: discordUser.id,
      },
      update: {
        name: discordUser.global_name,
        username: discordUser.username,
        email: discordUser.email,
        avatarId: discordUser.avatar,
      },
      create: {
        name: discordUser.global_name,
        username: discordUser.username,
        email: discordUser.email,
        discordId: discordUser.id,
        avatarId: discordUser.avatar,
        tokens: {
          create: {
            provider: "DISCORD",
            accessToken: token.access_token,
            type: token.token_type,
            expiresIn: token.expires_in,
            refreshToken: token.refresh_token,
            scope: token.scope,
          },
        },
      },
    });

    const sessionId = crypto.randomUUID();
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify(dbUser),
      "EX",
      60 * 60 * 24,
    );

    reply.setCookie("session_id", sessionId, {
      path: "/",
      httpOnly: true,
      secure: Bun.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      domain: Bun.env.NODE_ENV === "production" ? ".neko.oustopie.xyz" : "",
    });

    await reply.redirect(Bun.env.FRONT_URL);
  } catch (error) {
    console.error(error);
    await reply.status(500).send({ error: "OAuth failled" });
    await reply.redirect(Bun.env.FRONT_URL);
  }
}
