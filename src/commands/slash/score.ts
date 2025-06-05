import {
  ApplicationIntegrationType,
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import type {
  ChatInputCommandInteraction,
  SlashCommandUserOption,
} from "discord.js";
import type CustomDiscordClient from "types/custom-discord-client";

export const score = {
  data: new SlashCommandBuilder()
    .setName("score")
    .setDescription("Get the scores point in the current guild")
    .addUserOption((option: SlashCommandUserOption) =>
      option
        .setName("user")
        .setDescription("Show a score of another user")
        .setRequired(false),
    )
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .setContexts([InteractionContextType.BotDM]),

  async execute(interaction: ChatInputCommandInteraction) {
    const { prisma } = interaction.client as CustomDiscordClient;

    const user = interaction.options.getUser("user") ?? interaction.user;

    const quizScore = await prisma.quizScore.findUnique({
      where: {
        discordId: user.id,
      },
    });

    const embed = new EmbedBuilder().setColor("Gold").setTitle("Score");

    if (!quizScore) {
      if (user.id === interaction.user.id) {
        embed.setDescription("You don't have any points.");
      } else {
        embed.setDescription(`<@${user.id}> doesn't have any points.`);
      }

      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (user.id === interaction.user.id) {
      embed.setDescription(
        `Your score is **${quizScore.scores.toString()}** !`,
      );
    } else {
      embed.setDescription(
        `<@${user.id}>'s score is **${quizScore.scores.toString()}** !`,
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};
