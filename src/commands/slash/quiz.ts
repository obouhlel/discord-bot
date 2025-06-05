import type {
  ChatInputCommandInteraction,
  TextBasedChannel,
  TextChannel,
  User,
} from "discord.js";
import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import type CustomDiscordClient from "types/custom-discord-client";
import { getAnilistUser } from "utils/database/get-anilist-user";
import { buildQuizDataManager } from "utils/builders/quiz";
import Random from "utils/random";

const RANDOM = new Random();

export const quiz = {
  data: new SlashCommandBuilder()
    .setName("quiz")
    .setDescription(
      "Start an anime quiz with a character in the current channel",
    )
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .setContexts([InteractionContextType.BotDM, InteractionContextType.Guild]),

  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as CustomDiscordClient;
    const { prisma, redis, timeouts } = client;
    const user: User = interaction.user;
    const channel: TextBasedChannel | null = interaction.channel;

    if (!channel) {
      await interaction.reply("You are not in a server");
      return;
    }

    const key = `quiz:${user.id}:${channel.id}`;

    await interaction.deferReply();

    const keys = await redis.keys(`quiz:*:${channel.id}`);
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
      await interaction.editReply(
        "Please run the `/register` command in DM to register your anime list",
      );
      return;
    }

    const malIds = anilistUser.animes.flatMap((status) => status.malId).flat();
    const index = RANDOM.next() % malIds.length;
    const malId = malIds[index]!;

    const data = await buildQuizDataManager(
      malId,
      redis,
      timeouts,
      channel as TextChannel,
    );
    if (!data) {
      await interaction.editReply(`Anime character not found`);
      return;
    }

    const content = [
      `# Anime Quiz`,
      `- Using <@!${user.id}>'s AniList`,
      `- Active in <#${channel.id}>`,
      `- Guess the anime title`,
      "- **Answer Requirements:**",
      `  - No need to include season or part`,
      `    - Example: \`Attack on Titan season 3 part 2\` or \`Attack on Titan 2\``,
      `  - Short titles (3 words or less): 100% match`,
      "  - Long titles (more than 3 words):",
      `    - Over 30 chars: 25% word match`,
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
