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

    if (!channel || !channel.isSendable()) {
      await interaction.reply("I cannot interact with this channel.");
      return;
    }

    const key = `quiz:${user.id}:${channel.id}`;

    await interaction.reply({
      content: "The quiz will be sent...",
      flags: ["Ephemeral"],
    });

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
    const index = (RANDOM.next() * RANDOM.next()) % malIds.length;
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

    const embed = data.getQuizEmbed();

    await interaction.editReply("Type `!rules` to see the rules");

    await channel.send({ embeds: [embed] });
    await data.start(key);
  },
};
