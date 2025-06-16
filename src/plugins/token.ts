import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import TokenService from "services/tokens";

declare module "fastify" {
	interface FastifyInstance {
		token: TokenService;
	}
}

const tokenPlugin = fp(function (
	server: FastifyInstance,
	_opts: FastifyPluginOptions,
	done: () => void,
) {
	const token = new TokenService();
	server.decorate("token", token);
	done();
});

export default tokenPlugin;
