import type {
	ChatInputCommandInteraction,
	ColorResolvable,
	TextChannel,
} from "discord.js";
import {
	ApplicationIntegrationType,
	EmbedBuilder,
	InteractionContextType,
	SlashCommandBuilder,
} from "discord.js";
import type { PrismaClient } from "generated/prisma";
import AnilistService from "services/anilist";
import type CustomDiscordClient from "types/custom-discord-client";
import { capitalize } from "utils/capitalize";

export const register = {
	data: new SlashCommandBuilder()
		.setName("register")
		.setDescription("Register the anilist or mal")
		.addStringOption((option) =>
			option
				.setName("service")
				.setDescription("Choose your anime list service")
				.setRequired(true)
				.addChoices(
					{ name: "Anilist", value: "anilist" },
					{ name: "MyAnimeList", value: "mal" },
				),
		)
		.addStringOption((option) =>
			option
				.setName("username")
				.setDescription("The username of service")
				.setRequired(true),
		)
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
			ApplicationIntegrationType.UserInstall,
		])
		.setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),

	async execute(interaction: ChatInputCommandInteraction) {
		const client = interaction.client as CustomDiscordClient;
		const service = interaction.options.getString("service", true);
		const username = interaction.options.getString("username", true);
		const channel = interaction.channel as TextChannel;
		const { prisma } = client;
		const user = interaction.user;

		if (!user.avatar || !user.globalName) {
			await interaction.reply("Please set an avatar or an globale name");
			return;
		}

		await interaction.reply("Register the user...");

		const dbUser = await prisma.user.upsert({
			where: {
				discordId: user.id,
			},
			update: {
				name: user.globalName,
				username: user.username,
				avatarId: user.avatar,
			},
			create: {
				discordId: user.id,
				name: user.globalName,
				username: user.username,
				avatarId: user.avatar,
			},
			include: {
				animeListUser: true,
			},
		});

		if (service === "anilist") {
			await this.anilist(username, channel, dbUser.id, prisma);
			return;
		}
	},

	async anilist(
		username: string,
		channel: TextChannel,
		dbUserId: number,
		prisma: PrismaClient,
	) {
		const anilist = new AnilistService();
		const anilistUser = await anilist.getUser(username);
		if (!anilistUser) {
			const embed = new EmbedBuilder()
				.setTitle("Error")
				.setColor("Red")
				.setDescription("User not found");
			await channel.send({ embeds: [embed] });
			return;
		}

		const animes = await anilist.getMalIds(anilistUser.id, anilistUser.name);
		if (!animes) {
			await channel.send("Please retry the command `/register`");
			return;
		}

		await prisma.animeListUser.upsert({
			where: {
				userId: dbUserId,
			},
			create: {
				type: "ANILIST",
				typeId: anilistUser.id,
				username: anilistUser.name,
				status: ["CURRENT", "COMPLETED", "DROPPED", "PAUSED", "PLANNING"],
				animes: {
					createMany: {
						data: animes,
					},
				},
				userId: dbUserId,
			},
			update: {
				type: "ANILIST",
				typeId: anilistUser.id,
				username: anilistUser.name,
				animes: {
					deleteMany: {},
					createMany: {
						data: animes,
					},
				},
				userId: dbUserId,
			},
		});

		const nbAnimes = animes
			.flatMap((status) => status.malId)
			.flat()
			.length.toString();

		const embed = new EmbedBuilder()
			.setTitle(capitalize(anilistUser.name))
			.setImage(anilistUser.avatar.large)
			.setColor(capitalize(anilistUser.options.profileColor) as ColorResolvable)
			.setDescription(
				`User found with ${nbAnimes}, if you want to sort please type \`/filter\``,
			)
			.setURL(anilistUser.siteUrl);

		await channel.send({ embeds: [embed] });
	},
};
