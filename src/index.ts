import dotenv from "dotenv";
import Fastify from "fastify";
import routes from "routes";
import prismaPlugin from "plugins/prisma";
import redisPlugin from "plugins/redis";
import llmPlugin from "plugins/llm";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import discordPlugin from "plugins/discord";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: ["http://localhost:3000"],
});
fastify.register(helmet);
fastify.register(prismaPlugin);
fastify.register(redisPlugin);
fastify.register(llmPlugin);
fastify.register(discordPlugin);
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
