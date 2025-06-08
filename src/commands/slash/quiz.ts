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
} from "discord.js";
import type CustomDiscordClient from "types/custom-discord-client";
import { getAnimeListUser } from "utils/database/get-animes-list-user";
import { QuizBuilder } from "managers/quiz/QuizBuilder";
import { capitalize } from "utils/capitalize";

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
    const quizBuilder = new QuizBuilder();

    if (!channel || !channel.isSendable()) {
      await interaction.reply("I cannot interact with this channel.");
      return;
    }

    const key = `quiz:${user.id}:${channel.id}`;

    await interaction.reply({
      content: `The quiz will be sent by <@${user.id}>...`,
    });

    await interaction.editReply("Check if the quiz is already running...");
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

    await interaction.editReply("Get MAL/Anilist user...");
    const animeListUser = await getAnimeListUser(prisma, user);
    if (!animeListUser) {
      await interaction.editReply(
        "Please run the `/register` command in DM to register your anime list",
      );
      return;
    }

    const status = animeListUser.status;
    const malIds = animeListUser.animes
      .filter((media) => status.includes(media.name))
      .flatMap((status) => status.malId)
      .flat();
    if (malIds.length === 0) {
      await interaction.editReply(
        "Your list is empty please do `/register` or `/filter` commands",
      );
      return;
    }

    await interaction.editReply("Get the random anime");
    const random = Math.floor(Math.random() * (malIds.length - 1));
    const index = random % malIds.length;
    const malId = malIds[index]!;

    const data = await quizBuilder.buildQuizManager(
      malId,
      redis,
      timeouts,
      channel as TextChannel,
    );
    if (!data) {
      await interaction.editReply("Please retry the commands");
      return;
    }

    const embed = data.getQuizEmbed();

    await interaction.editReply(
      `# **${capitalize(animeListUser.type)}**: ${animeListUser.username} used\nType \`!rules\` to see the rules`,
    );

    await channel.send({ embeds: [embed] });
    await data.start(key);
  },
};
