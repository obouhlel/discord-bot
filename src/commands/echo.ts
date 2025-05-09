import type { RedisClient } from "bun";
import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import type {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
} from "discord.js";

export const echo = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Repeats what you say")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("message")
        .setDescription("The message to repeat")
        .setRequired(true)
    )
    .setContexts([InteractionContextType.Guild]),
  async execute(interaction: ChatInputCommandInteraction, redis: RedisClient) {
    const message = interaction.options.getString("message", true);
    await interaction.reply(message);
  },
};
