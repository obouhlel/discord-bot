import {
  ApplicationIntegrationType,
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
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction: ChatInputCommandInteraction) {
    const { prisma } = interaction.client as CustomDiscordClient;

    const user = interaction.options.getUser("user") ?? interaction.user;
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply("You are not in a server");
      return;
    }

    const quizScore = await prisma.quizScore.findUnique({
      where: {
        discordId_guildId: {
          discordId: user.id,
          guildId: guild.id,
        },
      },
    });

    if (!quizScore) {
      await interaction.reply(
        user.id === interaction.user.id
          ? "You don't have any points in this server."
          : `<@${user.id}> doesn't have any points in this server.`,
      );
      return;
    }

    await interaction.reply(
      user.id === interaction.user.id
        ? `Your score is **${quizScore.scores.toString()}** !`
        : `<@!${user.id}>'s score is **${quizScore.scores.toString()}** !`,
    );
  },
};
