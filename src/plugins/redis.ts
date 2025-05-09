import { fastify, type FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import Redis from "ioredis";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}

const redisPlugin: FastifyPluginAsync = fp(async (server) => {
  const redisURL = process.env.REDIS_URL;
  if (!redisURL) {
    throw new Error("The Redis URL not set");
  }
  const redis = new Redis(redisURL);
  server.decorate("redis", redis);
  server.addHook("onClose", async (server) => {
    server.redis.disconnect();
  });
});

export default redisPlugin;
