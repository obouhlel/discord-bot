import type { FastifyInstance } from "fastify";
import { status } from "../controllers";
import DiscordService from "../services/discord";

export default async function routes(fastify: FastifyInstance) {
  const discord = new DiscordService(fastify.redis);

  await discord.client.login();

  discord.events();

  fastify.get("/", async (_, reply) => {
    return status(discord.client, reply);
  });
}
