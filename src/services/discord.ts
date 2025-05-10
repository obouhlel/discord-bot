import type LLMService from "./llm";
import type { RedisClient } from "bun";
import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { REST, Routes } from "discord.js";
import { commandsDatas } from "../commands";
import {
  handlerMessageCreate,
  handlerInteractionCreate,
  handlerGuildMemberAdd,
} from "../events";

export default class DiscordService {
  public client: Client;
  public rest: REST;
  public redis: RedisClient;
  public llm: LLMService;

  constructor(redis: RedisClient, llm: LLMService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.User, Partials.Channel, Partials.Message],
    });

    this.rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_TOKEN!
    );

    this.redis = redis;

    this.llm = llm;
  }

  public async updateCommands() {
    try {
      console.log("🔄 | Updating slash commands...");
      await this.rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
        body: commandsDatas,
      });
      console.log("✅ | Slash commands updated successfully.");
    } catch (error) {
      console.error("❌ | Failed to update slash commands:", error);
    }
  }

  public async events() {
    // At start
    this.client.once(Events.ClientReady, async () => {
      console.log(`✅ | Client is ready ${this.client.user?.tag}`);
    });

    // New message
    this.client.on(Events.MessageCreate, async (message) => {
      handlerMessageCreate(message, this.redis, this.llm);
    });

    // Slash commands
    this.client.on(Events.InteractionCreate, async (interaction) => {
      handlerInteractionCreate(interaction, this.redis);
    });

    // New member in server/guild
    this.client.on(Events.GuildMemberAdd, async (member) => {
      handlerGuildMemberAdd(member, this.redis);
    });
  }
}
