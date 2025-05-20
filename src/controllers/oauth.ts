import type { FastifyReply, FastifyRequest } from "fastify";
import type { TokenResponse } from "types/token-response";
import axios from "axios";

export function redirectDiscord(reply: FastifyReply) {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${Bun.env.CLIENT_ID}&redirect_uri=${Bun.env.REDIRECT_URI}&response_type=code&scope=identify+email`;
  reply.redirect(url);
}

export async function oauthDiscord(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { code } = request.query as { code?: string };
  if (!code) return reply.status(400).send("Missing code");

  try {
    const token = await axios.post<TokenResponse>(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: Bun.env.REDIRECT_URI,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        auth: {
          username: Bun.env.CLIENT_ID,
          password: Bun.env.CLIENT_SECRET,
        },
      },
    );

    const { access_token } = token.data;

    const user = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    reply.send(user.data);
  } catch {
    reply.status(500).send({ error: "OAuth failled" });
  }
}
