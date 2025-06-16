import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import DiscordService from "services/discord";

declare module "fastify" {
	interface FastifyInstance {
		discord: DiscordService;
	}
}

const discordPlugin = fp(function (
	server: FastifyInstance,
	_opts: FastifyPluginOptions,
	done: () => void,
) {
	const discord = new DiscordService(server.redis, server.prisma);
	server.decorate("discord", discord);
	done();
});

export default discordPlugin;
