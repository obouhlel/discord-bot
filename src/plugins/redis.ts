import { RedisClient } from "bun";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
	interface FastifyInstance {
		redis: RedisClient;
	}
}

const redisPlugin = fp(function (
	server: FastifyInstance,
	_opts: FastifyPluginOptions,
	done: () => void,
) {
	const redisURL = Bun.env.REDIS_URL;
	if (!redisURL) {
		throw new Error("The Redis URL not set");
	}
	const redis = new RedisClient(redisURL);
	server.decorate("redis", redis);
	server.addHook("onClose", (server) => {
		server.redis.close();
	});
	done();
});

export default redisPlugin;
