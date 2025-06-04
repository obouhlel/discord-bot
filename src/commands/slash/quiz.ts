import type {
  ChatInputCommandInteraction,
  SlashCommandStringOption,
  TextBasedChannel,
  TextChannel,
  Guild,
  User,
} from "discord.js";
import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import type CustomDiscordClient from "types/custom-discord-client";
import type { QuizType } from "types/quiz";
import { capitalize } from "utils/capitalize";
import { getAnilistUser } from "utils/database/get-anilist-user";
import { buildQuizDataManager } from "utils/builders/quiz";
import Random from "utils/random";

const RANDOM = new Random();

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
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomDiscordClient;
    const { prisma, redis, timeouts } = client;
    const user: User = interaction.user;
    const guild: Guild | null = interaction.guild;
    const channel: TextBasedChannel | null = interaction.channel;
    const type = interaction.options.getString("type", true) as QuizType;

    if (!channel || !guild) {
      await interaction.reply("You are not in a server");
      return;
    }

    const key = `quiz:${guild.id}:${channel.id}`;

    await interaction.deferReply();

    const keys = await redis.keys(key);
    if (keys.length >= 1) {
      await interaction.editReply(
        `A quiz is already running in <#${channel.id}>`,
      );
      if (keys.length > 1) {
        for (const key of keys) {
          await redis.del(key);
        }
      }
      return;
    }

    const anilistUser = await getAnilistUser(prisma, user);
    if (!anilistUser) {
      await interaction.editReply("Please run the ``/anilist`` to register");
      return;
    }

    const malIds = type === "anime" ? anilistUser.animeId : anilistUser.mangaId;
    const index = RANDOM.next() % malIds.length;
    const malId = malIds[index]!;

    const data = await buildQuizDataManager(
      malId,
      type,
      redis,
      timeouts,
      channel as TextChannel,
    );
    if (!data) {
      await interaction.editReply(`${capitalize(type)} not found`);
      return;
    }

    const content = [
      `# ${capitalize(type)} Quiz`,
      `- Using <@!${user.id}>'s AniList`,
      `- Active in <#${channel.id}>`,
      `- Guess the ${type} title`,
      "- **Answer Requirements:**",
      `  - No need to include season or part`,
      `    - Example: \`Attack on Titan season 3 part 2\` or \`Attack on Titan 2\``,
      `  - Short titles (3 words or less): 100% match`,
      "  - Long titles (more than 3 words):",
      `    - Over 30 chars: 20% word match`,
      `    - Under 30 chars: 33% word match`,
      "- **Commands:**",
      "  - `!hint` for a hint",
      "  - `!skip` to skip current quiz",
      "- You start with 5 points, and some hints will consume points",
      `- Duration: **1 minute**`,
    ].join("\n");

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(data.getCharater().name)
      .setImage(data.getCharater().image);

    await interaction.editReply({ content: content, embeds: [embed] });
    await data.start(key);
  },
};
