// services
import type { RedisClient } from "bun";
import { buildMessageCommands } from "commands/message-command";
import { buildSlashCommand } from "commands/slash-command";
// discord settings
import { GatewayIntentBits, Partials } from "discord.js";
import { REST, Routes } from "discord.js";
import type { PrismaClient } from "generated/prisma";
// commands
import type { MessageCommand } from "types/commands/message";
import type { SlashCommand } from "types/commands/slash";
import CustomDiscordClient from "types/custom-discord-client";

export default class DiscordService {
	public client: CustomDiscordClient;
	public rest: REST;
	public readonly messageCommand: MessageCommand[];
	public readonly slashCommand: SlashCommand[];
	public readonly mapSlashCommand: Map<string, SlashCommand>;

	constructor(redis: RedisClient, prisma: PrismaClient) {
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

		this.slashCommand = buildSlashCommand();
		this.messageCommand = buildMessageCommands();

		this.mapSlashCommand = new Map(
			this.slashCommand.map((cmd) => [cmd.data.name, cmd]),
		);

		this.client.redis = redis;
		this.client.prisma = prisma;
		this.client.timeouts = new Map();
	}

	public async updateCommands() {
		try {
			console.log("🔄 | Updating slash commands...");
			await this.rest.put(Routes.applicationCommands(Bun.env.CLIENT_ID), {
				body: this.slashCommand.map((cmd) => cmd.data.toJSON()),
			});
			console.log("✅ | Slash commands updated successfully.");
		} catch (error) {
			console.error("❌ | Failed to update slash commands:", error);
		}
	}

	public getCommandData() {
		const messageCommandDatas = this.messageCommand.map(
			(command) => command.data,
		);
		const slashCommandDatas = this.slashCommand.map((command) =>
			command.data.toJSON(),
		);
		return {
			messageCommands: messageCommandDatas,
			slashCommands: slashCommandDatas,
		};
	}
}
