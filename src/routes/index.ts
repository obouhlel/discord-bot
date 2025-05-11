import type { FastifyInstance } from "fastify";
import { status, commandsGET, commandsPUT } from "controllers";

export default async function routes(fastify: FastifyInstance) {
  const { discord } = fastify;

  fastify.get("/", async (_, reply) => {
    return status(discord, reply);
  });

  fastify.get("/commands", async (_, reply) => {
    return commandsGET(discord, reply);
  });

  fastify.put("/commands", async (_, reply) => {
    return commandsPUT(discord, reply);
  });
}
