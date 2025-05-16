import type { FastifyInstance } from "fastify";
import { auth, status, getCommands, updateCommands } from "controllers";

// eslint-disable-next-line
export default async function routes(fastify: FastifyInstance) {
  const { discord, token } = fastify;

  fastify.get("/", async (_, reply) => {
    return status(discord, reply);
  });

  fastify.post("/auth", async (request, reply) => {
    await auth(token, request, reply);
  });

  fastify.get("/commands", async (_, reply) => {
    return getCommands(discord, reply);
  });

  fastify.put(
    "/commands/update",
    {
      // eslint-disable-next-line
      preHandler: async (request, reply) => { token.verifyToken(request, reply); },
    },
    async (_, reply) => {
      return updateCommands(discord, reply);
    }
  );
}
