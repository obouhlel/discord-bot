import type { FastifyInstance } from "fastify";
import { status, commandsGET, commandsPUT } from "controllers";
import DiscordService from "services/discord";
import LLMService from "services/llm";

export default async function routes(fastify: FastifyInstance) {
  const llm = new LLMService();
  const discord = new DiscordService(fastify.redis, llm, fastify.prisma);

  await discord.client.login();

  discord.events();

  fastify.get("/", async (_, reply) => {
    return status(discord.client, discord.rest, reply);
  });

  fastify.get("/commands", async (_, reply) => {
    return commandsGET(discord.rest, reply);
  });

  fastify.put("/commands", async (_, reply) => {
    return commandsPUT(discord, reply);
  });
}
