import type {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
} from "discord.js";
import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import AnilistService from "services/anilist";
import type CustomDiscordClient from "types/custom-discord-client";

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
    .setContexts([
      InteractionContextType.PrivateChannel,
      InteractionContextType.Guild,
    ]),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomDiscordClient;
    const { prisma } = client;
    const anilistUsername = interaction.options.getString("username", true);
    const anilistService = new AnilistService();

    await interaction.deferReply();

    const data = await anilistService.getUser(anilistUsername);

    if (!data) return await interaction.editReply("Username not found");

    const anilistData = data.data.User;
    const discordUser = interaction.user;

    if (!discordUser.avatar || !discordUser.globalName) {
      return await interaction.editReply(
        "Please set an avatar or an globale name",
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { discordId: discordUser.id },
    });

    if (!dbUser) {
      await prisma.user.create({
        data: {
          name: discordUser.globalName,
          username: discordUser.username,
          email: null,
          discordId: discordUser.id,
          anilistUser: anilistData.name,
          anilistId: anilistData.id.toString(),
          avatarId: discordUser.avatar,
        },
      });
    } else {
      await prisma.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          anilistId: anilistData.id.toString(),
          anilistUser: anilistData.name,
        },
      });
    }

    await interaction.editReply(
      `Your discord linked with this [anlist account](${anilistData.siteUrl})`,
    );
  },
};
