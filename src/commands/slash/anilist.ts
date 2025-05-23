import type {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
} from "discord.js";
import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import type CustomDiscordClient from "types/custom-discord-client";
import AnilistService from "services/anilist";

export const anilist = {
  data: new SlashCommandBuilder()
    .setName("anilist")
    .setDescription("Setup an account anilist")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("username")
        .setDescription("The anlist username")
        .setRequired(true),
    )
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomDiscordClient;
    const { prisma } = client;
    const anilistUsername = interaction.options.getString("username", true);
    const anilistService = new AnilistService();
    const user = interaction.user;

    if (!user.avatar || !user.globalName) {
      await interaction.reply("Please set an avatar or an globale name");
      return;
    }

    await interaction.deferReply();

    const data = await anilistService.getUser(anilistUsername);
    if (!data) {
      await interaction.editReply("Username not found");
      return;
    }

    const anilistData = data.data.User;
    const animeId = await anilistService.getAnimesId(
      anilistData.id,
      anilistData.name,
    );
    const mangaId = await anilistService.getMangasId(
      anilistData.id,
      anilistData.name,
    );
    if (!animeId || !mangaId) {
      await interaction.editReply("Please try again in 1 minute");
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { discordId: user.id },
    });

    if (existingUser?.anilistUserId) {
      await prisma.anilistUser.delete({
        where: { id: existingUser.anilistUserId },
      });
    }

    const anilistRecord = await prisma.anilistUser.create({
      data: {
        anilistId: anilistData.id,
        anilistName: anilistData.name,
        animeId: animeId,
        mangaId: mangaId,
      },
    });

    await prisma.user.upsert({
      where: { discordId: user.id },
      update: {
        name: user.globalName,
        username: user.username,
        avatarId: user.avatar,
        anilistUserId: anilistRecord.id,
      },
      create: {
        name: user.globalName,
        username: user.username,
        discordId: user.id,
        anilistUserId: anilistRecord.id,
        avatarId: user.avatar,
      },
    });

    await interaction.editReply(
      `Your discord linked with this [anlist account](${anilistData.siteUrl}), ${animeId.length.toString()} animes, and ${mangaId.length.toString()} mangas.`,
    );
  },
};
