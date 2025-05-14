import type CustomDiscordClient from "types/custom-discord-client";
import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import type {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
} from "discord.js";

export const llm = {
  data: new SlashCommandBuilder()
    .setName("llm")
    .setDescription("Generate a prompt with AI")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("prompt")
        .setDescription("The prompt for the AI")
        .setRequired(true)
    )
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ]),
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const { llm } = interaction.client as CustomDiscordClient;
      const prompt = interaction.options.getString("prompt", true);
      const message = await llm.generateMessageSlash(prompt);
      await interaction.reply(message);
    } catch {
      console.error("Error with the command /llm");
      await interaction.reply("Error with the command /llm");
    }
  },
};
