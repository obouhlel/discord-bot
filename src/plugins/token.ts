import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import TokenService from "services/tokens";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    token: TokenService;
  }
}

const tokenPlugin = fp(function (
  server: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void,
) {
  const token = new TokenService();
  server.decorate("token", token);
  done();
});

export default tokenPlugin;
