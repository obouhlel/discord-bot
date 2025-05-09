import type { RedisClient } from "bun";
import {
  Client,
  REST,
  Routes,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import {
  handlerMessageCreate,
  handlerInteractionCreate,
  handlerGuildMemberAdd,
} from "../events";
import { commandsInfo } from "../commands";

export default class DiscordService {
  public client: Client;
  public rest: REST;
  public redis: RedisClient;

  constructor(redis: RedisClient) {
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
  }

  public async updateCommands() {
    try {
      console.log("🔄 | Updating slash commands...");
      await this.rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
        body: commandsInfo,
      });
      console.log("✅ | Slash commands updated successfully.");
    } catch (error) {
      console.error("❌ | Failed to update slash commands:", error);
    }
  }

  public async events() {
    this.client.once(Events.ClientReady, async () => {
      console.log(`✅ | Client is ready ${this.client.user?.tag}`);
    });
    this.client.on(Events.MessageCreate, handlerMessageCreate);
    this.client.on(Events.InteractionCreate, async (interaction) => {
      handlerInteractionCreate(interaction, this.redis);
    });
    this.client.on(Events.GuildMemberAdd, async (member) => {
      handlerGuildMemberAdd(member, this.redis);
    });
  }
}
