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
        .setRequired(true),
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
    const { llm } = interaction.client as CustomDiscordClient;
    const prompt = interaction.options.getString("prompt", true);
    await interaction.deferReply();
    const message = await llm.generateMessageSlash(prompt);
    await interaction.editReply(message);
  },
};
