import type { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import axios from "axios";

export const cuddle = {
  data: new SlashCommandBuilder()
    .setName("cuddle")
    .setDescription("Send a cuddle"),
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const { data } = await axios.get("https://api.waifu.pics/sfw/cuddle");
      await interaction.reply(data.url);
    } catch {
      await interaction.reply("Error in server");
    }
  },
};
