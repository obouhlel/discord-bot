import dotenv from "dotenv";
import Fastify from "fastify";
import routes from "./routes";
import redisPlugin from "./plugins/redis";
import prismaPlugin from "./plugins/prisma";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

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
