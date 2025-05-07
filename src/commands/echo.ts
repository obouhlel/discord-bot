import { SlashCommandBuilder } from "discord.js";
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
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString("message", true);
    await interaction.reply(message);
  },
};
