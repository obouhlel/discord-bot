import type { FastifyPluginAsync } from "fastify";
import DiscordService from "services/discord";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    discord: DiscordService;
  }
}

const discordPlugin: FastifyPluginAsync = fp(async (server) => {
  const discord = new DiscordService(server.redis, server.llm, server.prisma);
  server.decorate("discord", discord);
});

export default discordPlugin;
