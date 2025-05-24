import type {
  ChatInputCommandInteraction,
  Guild,
  SlashCommandStringOption,
  TextBasedChannel,
  User,
} from "discord.js";
import {
  ApplicationIntegrationType,
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import JikanService from "services/jikan";
import type CustomDiscordClient from "types/custom-discord-client";
import type { QuizData, QuizType } from "types/quiz";
import { capitalize } from "utils/capitalize";

export const quiz = {
  data: new SlashCommandBuilder()
    .setName("quiz")
    .setDescription(
      "Start an anime/manga quiz with a character in the current channel",
    )
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
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomDiscordClient;
    const { prisma, redis } = client;
    const user: User = interaction.user;
    const guild: Guild | null = interaction.guild;
    const channel: TextBasedChannel | null = interaction.channel;
    const type = interaction.options.getString("type", true) as QuizType;

    if (!channel || !guild) {
      await interaction.reply("Please use the quiz command in a valid channel");
      return;
    }

    await interaction.deferReply();

    const key = `quiz:${guild.id}:${channel.id}`;
    const keys = await redis.keys(key);

    if (keys.length === 1) {
      const channelId = keys[0]!.split(":")[2]!;
      await interaction.editReply(
        `A quiz is already running in <#${channelId}>`,
      );
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        discordId: user.id,
      },
    });

    if (!dbUser || !dbUser.anilistUserId) {
      await interaction.editReply("Please run the ``/anilist`` to register");
      return;
    }

    const anilistUser = await prisma.anilistUser.findUnique({
      where: {
        id: dbUser.anilistUserId,
      },
    });

    if (!anilistUser) {
      await interaction.reply("Please run the ``/anilist`` to register");
      return;
    }

    const malIds = type === "anime" ? anilistUser.animeId : anilistUser.mangaId;

    if (malIds.length === 0) {
      await interaction.editReply(`Your ${type} list is empty`);
      return;
    }

    const index = Math.floor(Math.random() * (malIds.length - 1));
    const malId = malIds[index]!;
    const jikanService = new JikanService();

    const quizData: QuizData | null = await jikanService.getQuizData(
      malId,
      type,
    );

    if (!quizData) {
      await interaction.editReply(`${capitalize(type)} not found`);
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(quizData.character.name)
      .setImage(quizData.character.images)
      .setDescription(
        `The quiz starts in <#${channel.id}>. Find the ${type} title. Type \`!hint\` for a clue, or \`!skip\` to skip. (The quiz will expire in 1h)`,
      );

    await interaction.editReply({
      content: `Anilist of <@!${user.id}> used.`,
      embeds: [embed],
    });
    await redis.set(key, JSON.stringify(quizData), "EX", 60 * 60);
  },
};
