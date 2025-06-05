import {
  ApplicationIntegrationType,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type CustomDiscordClient from "types/custom-discord-client";

export const leaderboard = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("The top 5 in the server")
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction: ChatInputCommandInteraction) {
    const { prisma } = interaction.client as CustomDiscordClient;
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply("You are not in a server");
      return;
    }

    const topScores = await prisma.quizScore.findMany({
      where: { guildId: guild.id },
      orderBy: { scores: "desc" },
      take: 5,
    });

    if (topScores.length === 0) {
      await interaction.reply("There are no scores in this server yet.");
      return;
    }

    const leaderboardLines: string[] = topScores.map(
      (score, index) =>
        `${(index + 1).toString()} - <@${score.discordId}> **${score.scores.toString()}**`,
    );

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("🏆 Leaderboard Quiz")
      .setDescription(leaderboardLines.join("\n"));

    await interaction.reply({ embeds: [embed] });
  },
};
