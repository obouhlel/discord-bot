import type { FastifyPluginAsync } from "fastify";
import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import fp from "fastify-plugin";
import { handlerMessageCreate, handlerInteractionCreate } from "../events";

declare module "fastify" {
  interface FastifyInstance {
    discord: Client;
  }
}

const discordPlugin: FastifyPluginAsync = fp(async (server) => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.User, Partials.Channel, Partials.Message],
  });
  server.decorate("discord", client);

  await client.login(process.env.DISCORD_TOKEN);

  client.once(Events.ClientReady, async () => {
    console.log(`✅ | Client is ready ${client.user?.tag}`);
  });
  client.on(Events.InteractionCreate, handlerInteractionCreate);
  client.on(Events.MessageCreate, handlerMessageCreate);
});

export default discordPlugin;
