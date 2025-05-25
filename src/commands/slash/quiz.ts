import type { RedisClient } from "bun";
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
import type { AnilistUser, PrismaClient } from "generated/prisma";
import JikanService from "services/jikan";
import type CustomDiscordClient from "types/custom-discord-client";
import {
  QuizDataBuilder,
  type QuizData,
  type QuizTimeout,
  type QuizType,
} from "types/quiz";
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

    const key = `quiz:${guild.id}:${channel.id}`;

    await interaction.deferReply();

    if (await alreadyRunning(redis, key)) {
      await interaction.editReply(
        `A quiz is already running in <#${channel.id}>`,
      );
      return;
    }

    const anilistUser = await getAnilistUser(prisma, user);
    if (!anilistUser) {
      await interaction.editReply("Please run the ``/anilist`` to register");
      return;
    }

    const data = await getQuizData(anilistUser, type);
    if (!data) {
      await interaction.editReply(`${capitalize(type)} not found`);
      return;
    }

    const content = `# ${capitalize(type)} Quiz\n- Using <@!${user.id}>'s AniList\n- Active in <#${channel.id}>\n- Guess the ${type} title (33% accuracy needed for long titles (over 3 words and 20 characters); season numbers and special characters are optional)\n- Commands: \`!hint\` for a hint, \`!skip\` to skip\n- Duration: **3 minutes**`;

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(data.getCharater().name)
      .setDescription(`Role: ${data.getCharater().role}`)
      .setImage(data.getCharater().images);

    await interaction.editReply({ content: content, embeds: [embed] });
    const timeouts = startQuizCountdown(redis, key, channel as TextChannel);
    data.setTimeout(timeouts);
    await redis.set(key, data.toJSON());
  },
};

async function alreadyRunning(
  redis: RedisClient,
  key: string,
): Promise<boolean> {
  const keys = await redis.keys(key);

  if (keys.length === 1) {
    return true;
  }
  return false;
}

async function getAnilistUser(
  prisma: PrismaClient,
  user: User,
): Promise<AnilistUser | null> {
  const dbUser = await prisma.user.findUnique({
    where: {
      discordId: user.id,
    },
  });

  if (!dbUser || !dbUser.anilistUserId) return null;

  const anilistUser = await prisma.anilistUser.findUnique({
    where: {
      id: dbUser.anilistUserId,
    },
  });

  return anilistUser;
}

async function getQuizData(
  anilistUser: AnilistUser,
  type: QuizType,
): Promise<QuizDataBuilder | null> {
  const malIds = type === "anime" ? anilistUser.animeId : anilistUser.mangaId;
  const index = Math.floor(Math.random() * (malIds.length - 1));
  const malId = malIds[index]!;
  const jikanService = new JikanService();

  const data: QuizData | null = await jikanService.getQuizData(malId, type);
  if (!data) return null;
  return new QuizDataBuilder(data);
}

function startQuizCountdown(
  redis: RedisClient,
  key: string,
  channel: TextChannel,
): QuizTimeout {
  const min = 3;
  const oneMinuteTimeout = setTimeout(
    () => {
      notifyOneMinuteLeft(redis, key, channel)
        .then()
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    (min - 1) * 60 * 1000,
  );
  const endTimeout = setTimeout(
    () => {
      closeQuizSession(redis, key, channel)
        .then()
        .catch((error: unknown) => {
          console.error(error);
        });
    },
    min * 60 * 1000,
  );
  return { oneMinuteTimeout, endTimeout };
}

async function notifyOneMinuteLeft(
  redis: RedisClient,
  key: string,
  channel: TextChannel,
) {
  const value = await redis.get(key);
  if (!value) return;
  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle("⚠️ One minute remaining!")
    .setDescription("Hurry up! Only 60 seconds left to find the answer.");

  await channel.send({ embeds: [embed] });
}

async function closeQuizSession(
  redis: RedisClient,
  key: string,
  channel: TextChannel,
) {
  const value = await redis.get(key);
  if (!value) return;

  const data = new QuizDataBuilder(value);

  const embed = new EmbedBuilder()
    .setColor("White")
    .setTitle(data.getTitle())
    .setDescription("⏰ Time's up! The quiz has ended.")
    .setURL(data.getUrl());

  await redis.del(key);
  await channel.send({ embeds: [embed] });
}
