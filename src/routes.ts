import type { FastifyInstance } from "fastify";
import type { TokenResponse } from "types/token-response";
import { auth, status, getCommands, updateCommands } from "controllers";
import axios from "axios";

// eslint-disable-next-line
export default async function routes(fastify: FastifyInstance) {
  const { discord, token } = fastify;

  fastify.get("/", async (_, reply) => {
    status(discord, reply);
  });

  fastify.post("/auth", async (request, reply) => {
    await auth(token, request, reply);
  });

  fastify.get("/auth/login", async (request, reply) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${Bun.env.CLIENT_ID}&redirect_uri=${Bun.env.REDIRECT_URI}&response_type=code&scope=identify+email`;
    reply.redirect(url);
  });

  fastify.get("/auth/callback", async (request, reply) => {
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
    } catch (error) {
      console.error(error);
      reply.status(500).send("OAuth error");
    }
  });

  fastify.get("/commands", async (_, reply) => {
    return getCommands(discord, reply);
  });

  fastify.put(
    "/commands/update",
    {
      // eslint-disable-next-line
      preHandler: async (request, reply) => {
        token.verifyToken(request, reply);
      },
    },
    async (_, reply) => {
      return updateCommands(discord, reply);
    },
  );
}
