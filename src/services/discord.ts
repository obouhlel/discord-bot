import type LLMService from "./llm";
import type { RedisClient } from "bun";
import type { PrismaClient } from "generated/prisma/index-browser";
import CustomDiscordClient from "types/custom-discord-client";
import { GatewayIntentBits, Partials } from "discord.js";
import { REST, Routes } from "discord.js";
import { commandsDatas } from "commands";
import Random from "utils/random";

export default class DiscordService {
  public client: CustomDiscordClient;
  public rest: REST;

  constructor(redis: RedisClient, llm: LLMService, prisma: PrismaClient) {
    this.client = new CustomDiscordClient({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.User, Partials.Channel, Partials.Message],
    });

    this.rest = new REST({ version: "10" }).setToken(Bun.env.DISCORD_TOKEN);

    const random = new Random();

    this.client.redis = redis;
    this.client.llm = llm;
    this.client.prisma = prisma;
    this.client.random = random;
  }

  public async updateCommands() {
    try {
      console.log("🔄 | Updating slash commands...");
      await this.rest.put(Routes.applicationCommands(Bun.env.CLIENT_ID), {
        body: commandsDatas,
      });
      console.log("✅ | Slash commands updated successfully.");
    } catch (error) {
      console.error("❌ | Failed to update slash commands:", error);
    }
  }
}
