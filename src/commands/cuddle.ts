import type { ChatInputCommandInteraction } from "discord.js";
import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import axios from "axios";

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
    try {
      const { data } = await axios.get("https://api.waifu.pics/sfw/cuddle");
      await interaction.reply(data.url);
    } catch {
      await interaction.reply("Error in server");
    }
  },
};
