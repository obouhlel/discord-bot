import {
	ApplicationIntegrationType,
	InteractionContextType,
	SlashCommandBuilder,
} from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export const ping = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with Pong!")
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
			ApplicationIntegrationType.UserInstall,
		])
		.setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply("Pong!");
	},
};
