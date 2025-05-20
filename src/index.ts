import Fastify from "fastify";
import routes from "routes";

// plugins
import helmet from "@fastify/helmet";
import prismaPlugin from "plugins/prisma";
import redisPlugin from "plugins/redis";
import llmPlugin from "plugins/llm";
import discordPlugin from "plugins/discord";
import tokenPlugin from "plugins/token";

// hooks
import { Events } from "discord.js";
import { messageCreate } from "events/message-create";
import { interactionCreate } from "events/interaction-create";
import { guildMemberAdd } from "events/guild-member-add";

// type
import type { Interaction, Message } from "discord.js";

const fastify = Fastify({
  logger: true,
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

  fastify.discord.client.once(Events.ClientReady, () => {
    if (!fastify.discord.client.user) return;
    console.log(`✅ | Client is ready ${fastify.discord.client.user.tag}`);
  });

  // New message
  // eslint-disable-next-line
  fastify.discord.client.on(Events.MessageCreate, async (message: Message) => {
    await messageCreate(message, fastify.discord.messageCommand);
  });

  // Slash commands
  fastify.discord.client.on(
    Events.InteractionCreate,
    // eslint-disable-next-line
    async (interaction: Interaction) => {
      await interactionCreate(interaction, fastify.discord.mapSlashCommand);
    },
  );

  // New member in server/guild
  // eslint-disable-next-line
  fastify.discord.client.on(Events.GuildMemberAdd, guildMemberAdd);
});

async function start() {
  try {
    await fastify.listen({ host: "0.0.0.0", port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start().catch((error: unknown) => {
  console.error(error);
});
