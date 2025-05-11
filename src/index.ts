import dotenv from "dotenv";
import Fastify from "fastify";
import routes from "routes";
import redisPlugin from "plugins/redis";
import prismaPlugin from "plugins/prisma";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

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
fastify.register(routes);

async function start() {
  try {
    await fastify.listen({ host: "0.0.0.0", port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
