import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type { RedisClient } from "bun";

export const score = {
  data: new SlashCommandBuilder()
    .setName("score")
    .setDescription("Get the number of 'feur' triggered")
    .setContexts([InteractionContextType.Guild]),
  async execute(interaction: ChatInputCommandInteraction, redis: RedisClient) {
    const score = Number(
      await redis.get(`feur:${interaction.member?.user.id}`)
    );
    await interaction.reply(`Ton score de feur est de : ${score}`);
  },
};
