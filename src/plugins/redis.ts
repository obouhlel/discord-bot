import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { RedisClient } from "bun";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    redis: RedisClient;
  }
}

const redisPlugin = fp(function (
  server: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void,
) {
  const redisURL = Bun.env.REDIS_URL;
  if (!redisURL) {
    throw new Error("The Redis URL not set");
  }
  const redis = new RedisClient(redisURL);
  server.decorate("redis", redis);
  // eslint-disable-next-line
  server.addHook("onClose", async (server) => {
    server.redis.close();
  });
  done();
});

export default redisPlugin;
