import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { FastifyInstance } from "fastify";

export const ping = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .setContexts([InteractionContextType.BotDM]),
  async execute(
    interaction: ChatInputCommandInteraction,
    fastify: FastifyInstance
  ) {
    await interaction.reply("Pong!");
  },
};
