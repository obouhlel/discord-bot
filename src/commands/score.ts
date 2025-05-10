import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { RedisClient } from "bun";

export const score = {
  data: new SlashCommandBuilder()
    .setName("score")
    .setDescription("Get the number of 'feur' triggered")
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .setContexts([InteractionContextType.Guild]),
  async execute(interaction: ChatInputCommandInteraction, redis: RedisClient) {
    try {
      const score = Number(await redis.get(`feur:${interaction.user.id}`));
      await interaction.reply(`You score of 'feur' is **${score}**`);
    } catch (error) {
      console.error(error);
      await interaction.reply("Error server");
    }
  },
};
