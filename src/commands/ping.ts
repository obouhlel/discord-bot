import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { RedisClient } from "bun";

export const ping = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),
  async execute(interaction: ChatInputCommandInteraction, redis: RedisClient) {
    await interaction.reply("Pong!");
  },
};
