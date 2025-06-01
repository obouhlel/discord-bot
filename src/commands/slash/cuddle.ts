import type { ChatInputCommandInteraction } from "discord.js";
import {
  ApplicationIntegrationType,
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

export const cuddle = {
  data: new SlashCommandBuilder()
    .setName("cuddle")
    .setDescription("Send a cuddle")
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .setContexts([
      InteractionContextType.PrivateChannel,
      InteractionContextType.Guild,
    ]),

  async execute(interaction: ChatInputCommandInteraction) {
    const response = await fetch("https://api.waifu.pics/sfw/cuddle");
    if (!response.ok) {
      await interaction.reply("Cuddle not found");
      return;
    }
    const data = (await response.json()) as { url: string };
    const embed = new EmbedBuilder().setColor("Random").setImage(data.url);
    await interaction.reply({ embeds: [embed] });
  },
};
