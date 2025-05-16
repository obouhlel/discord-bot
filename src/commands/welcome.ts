import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type CustomDiscordClient from "types/custom-discord-client";

export const welcome = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Set welcome message on server in current channel")
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .setContexts([InteractionContextType.Guild]),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId || !interaction.channel) return;
    const client = interaction.client as CustomDiscordClient;
    const redis = client.redis;
    const channel = interaction.channel.toString();
    const channelId = interaction.channelId;
    const key = `welcome:${interaction.guildId}`;

    try {
      const value = await redis.get(key);
      if (value && value === channelId) {
        await interaction.reply(`Welcome message is already set in ${channel}`);
        return;
      }
      await redis.set(key, channelId);
      if (value) {
        await interaction.reply(
          `Welcome message is update to ${channel} (old: <#${value}>)`
        );
      } else {
        await interaction.reply(`Welcome message is set to ${channel}`);
      }
    } catch (error) {
      console.error("Error interacting with Redis:", error);
      await interaction.reply("Error setting the welcome message channel.");
    }
  },
};
