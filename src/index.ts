import Fastify from "fastify";
import routes from "routes";

// plugins
import helmet from "@fastify/helmet";
import prismaPlugin from "plugins/prisma";
import redisPlugin from "plugins/redis";
import llmPlugin from "plugins/llm";
import discordPlugin from "plugins/discord";
import tokenPlugin from "plugins/token";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const fastify = Fastify({
  logger: envToLogger[Bun.env.NODE_ENV as keyof typeof envToLogger] ?? true,
});

fastify.register(helmet);
fastify.register(prismaPlugin);
fastify.register(redisPlugin);
fastify.register(llmPlugin);
fastify.register(discordPlugin);
fastify.register(tokenPlugin);
fastify.register(routes);

fastify.addHook("onReady", async function () {
  await fastify.discord.client.login();
  await fastify.discord.events();
});

async function start() {
  try {
    await fastify.listen({ host: "0.0.0.0", port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
