import dotenv from "dotenv";
import Fastify from "fastify";
import discordPlugin from "./plugins/discord-plugin";
import routes from "./routes";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(discordPlugin);
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
