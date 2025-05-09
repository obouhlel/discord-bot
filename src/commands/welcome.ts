import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import type { FastifyInstance } from "fastify";
import type { ChatInputCommandInteraction } from "discord.js";

export const welcome = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Set welcome message on server in current channel")
    .setContexts([InteractionContextType.Guild]),
  async execute(
    interaction: ChatInputCommandInteraction,
    fastify: FastifyInstance
  ) {
    const channel = interaction.channel?.toString();
    const key = `welcome:${interaction.guildId!}`;
    try {
      const value = (await fastify.redis.get(key)) as
        | `<@${string}>`
        | `<#${string}>`
        | undefined;
      if (value && value === channel) {
        await interaction.reply(`Welcome message is already set in ${channel}`);
        return;
      }
      await fastify.redis.set(key, channel as string);
      if (value) {
        await interaction.reply(
          `Welcome message is update to ${channel} (old: ${value})`
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
