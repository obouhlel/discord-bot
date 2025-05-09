import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import {
  handlerMessageCreate,
  handlerInteractionCreate,
  handlerGuildMemberAdd,
} from "../events";

declare module "fastify" {
  interface FastifyInstance {
    discord: Client;
  }
}

const discordPlugin: FastifyPluginAsync = fp(async (server) => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
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
  client.on(Events.InteractionCreate, async (interaction) => {
    return handlerInteractionCreate(interaction, server);
  });
  client.on(Events.MessageCreate, handlerMessageCreate);
  client.on(Events.GuildMemberAdd, async (member) => {
    return handlerGuildMemberAdd(member, server);
  });
});

export default discordPlugin;
