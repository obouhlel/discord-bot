import type { FastifyPluginAsync } from "fastify";
import { RedisClient } from "bun";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    redis: RedisClient;
  }
}

const redisPlugin: FastifyPluginAsync = fp(async (server) => {
  const redisURL = Bun.env.REDIS_URL;
  if (!redisURL) {
    throw new Error("The Redis URL not set");
  }
  const redis = new RedisClient(redisURL);
  server.decorate("redis", redis);
  server.addHook("onClose", async (server) => {
    server.redis.close();
  });
});

export default redisPlugin;
