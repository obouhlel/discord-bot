import type {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  TextBasedChannel,
  User,
} from "discord.js";
import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import JikanService from "services/jikan";
import type CustomDiscordClient from "types/custom-discord-client";
import { capitalize } from "utils/capitalize";

type Type = "anime" | "manga";

export const quiz = {
  data: new SlashCommandBuilder()
    .setName("quiz")
    .setDescription("Start or stop the quiz animes or mangas")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("type")
        .setDescription("Choose between anime or manga")
        .setRequired(true)
        .addChoices(
          { name: "Anime", value: "anime" },
          { name: "Manga", value: "manga" },
        ),
    )
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomDiscordClient;
    const { prisma, redis } = client;
    const user: User = interaction.user;
    const channel: TextBasedChannel | null = interaction.channel;
    const type = interaction.options.getString("type", true) as Type;

    if (!channel) {
      await interaction.reply("Please use the quiz command in a valid channel");
      return;
    }

    await interaction.deferReply();

    try {
      const dbUser = await prisma.user.findUnique({
        where: {
          discordId: user.id,
        },
      });

      if (!dbUser?.anilistUserId) {
        await interaction.reply("Please run the /anilist to register");
        return;
      }

      const anilistUser = await prisma.anilistUser.findUnique({
        where: {
          id: dbUser.anilistUserId,
        },
      });

      if (!anilistUser) {
        await interaction.reply("Please run the /anilist to register");
        return;
      }

      const malIds =
        type === "anime" ? anilistUser.animeId : anilistUser.mangaId;

      if (malIds.length === 0) {
        await interaction.reply(`Your ${type} list is empty`);
        return;
      }

      const index = Math.floor(Math.random() * malIds.length);
      // eslint-disable-next-line
      const malId = malIds[index]!;
      const jikanService = new JikanService();

      const random =
        type === "anime"
          ? await jikanService.getAnimeInfo(malId)
          : await jikanService.getMangaInfo(malId);

      if (!random) {
        await interaction.editReply(`${capitalize(type)} not found`);
        return;
      }

      const key = `quiz:${type}:${user.id}:${channel.id}`;
      await redis.set(key, JSON.stringify(random));

      await interaction.editReply(`The quiz start in <#${channel.id}>`);
    } catch (error) {
      console.error(error);
      await interaction.editReply(`Error`);
    }
  },
};
