import type { FastifyPluginOptions, FastifyInstance } from "fastify";
import DiscordService from "services/discord";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    discord: DiscordService;
  }
}

const discordPlugin = fp(function (
  server: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) {
  const discord = new DiscordService(server.redis, server.llm, server.prisma);
  server.decorate("discord", discord);
  done();
});

export default discordPlugin;
