import type { FastifyPluginAsync } from "fastify";
import TokenService from "services/tokens";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    token: TokenService;
  }
}

const tokenPlugin: FastifyPluginAsync = fp(async (server) => {
  const token = new TokenService();

  server.decorate("token", token);
});

export default tokenPlugin;
