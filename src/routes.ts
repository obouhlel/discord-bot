import type { FastifyInstance } from "fastify";
import { auth } from "controllers/auth";
import { status } from "controllers/status";
import { getCommands, updateCommands } from "controllers/commands";
import { oauthDiscord, redirectDiscord } from "controllers/oauth";

// eslint-disable-next-line
export default async function routes(fastify: FastifyInstance) {
  const { discord, token } = fastify;

  // Status for heathcheck
  fastify.get("/", async (_, reply) => {
    status(discord, reply);
  });

  // OAuth Discord
  fastify.get("/auth/login", async (_, reply) => {
    redirectDiscord(reply);
  });

  fastify.get("/auth/callback", oauthDiscord);

  // Get Commands for the front
  fastify.get("/commands", async (_, reply) => {
    return getCommands(discord, reply);
  });

  // Auth in api to get token
  fastify.post("/auth", async (request, reply) => {
    await auth(token, request, reply);
  });

  // Update command with token if it's not in localhost
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
