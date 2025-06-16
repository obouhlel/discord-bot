import {
	ApplicationIntegrationType,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import type CustomDiscordClient from "types/custom-discord-client";

export const leaderboard = {
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("Top 10 users in the quiz")
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
			ApplicationIntegrationType.UserInstall,
		])
		.setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),

	async execute(interaction: ChatInputCommandInteraction) {
		const { prisma } = interaction.client as CustomDiscordClient;

		const topScores = await prisma.quizScore.findMany({
			orderBy: { scores: "desc" },
			include: { User: true },
			take: 10,
		});

		if (topScores.length === 0) {
			await interaction.reply("No scores available.");
			return;
		}

		const leaderboardLines: string[] = topScores.map(
			(score, index) =>
				`${(index + 1).toString()}. ${score.User.username} with **${score.scores.toString()}** points`,
		);

		const embed = new EmbedBuilder()
			.setColor("Gold")
			.setTitle("🏆 Quiz Leaderboard")
			.setDescription(leaderboardLines.join("\n"));

		await interaction.reply({ embeds: [embed] });
	},
};
