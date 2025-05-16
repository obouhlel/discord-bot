import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type CustomDiscordClient from "types/custom-discord-client";

export const score = {
  data: new SlashCommandBuilder()
    .setName("score")
    .setDescription("Get the number of 'feur' triggered")
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .setContexts([InteractionContextType.Guild]),
  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomDiscordClient;
    const redis = client.redis;
    try {
      const score = Number(await redis.get(`feur:${interaction.user.id}`));
      await interaction.reply(`You score of 'feur' is **${score.toString()}**`);
    } catch (error) {
      console.error(error);
      await interaction.reply("Error server");
    }
  },
};
