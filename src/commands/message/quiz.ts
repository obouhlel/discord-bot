import type { MessageCommandContext } from "types/commands/message";
import type { TextChannel, User } from "discord.js";
import type { PrismaClient } from "generated/prisma";
import { QuizManager } from "managers/QuizManager";
import { EmbedBuilder } from "discord.js";
import { MessageCommand } from "types/commands/message";

export default class Quiz extends MessageCommand {
  public readonly data = {
    name: "Quiz Anime/Manga",
    description:
      "You need to register with /anilist first. After that, use /quiz to start playing.",
  };

  async shouldExecute({
    client,
    message,
  }: MessageCommandContext): Promise<boolean> {
    if (message.author.bot) return false;

    const { redis } = client;
    const channelId = message.channelId;

    const keys = await redis.keys(`quiz:*:${channelId}`);
    if (!keys[0]) return false;
    return true;
  }

  async execute({ client, message }: MessageCommandContext): Promise<void> {
    const { prisma, redis, timeouts } = client;
    const user = message.author;
    const channel = message.channel as TextChannel;
    const keys = await redis.keys(`quiz:*:${channel.id}`);
    const key = keys[0]!;
    const value = await redis.get(key);
    if (!value) return;

    const quiz = new QuizManager(value, redis, timeouts, channel);
    const answer = message.content.toLowerCase();

    if (answer === "!rules") {
      await channel.send(quiz.getRules());
    }

    if (answer.startsWith("!hint")) {
      await quiz.hint(answer, key);
      return;
    }

    if (answer === "!skip") {
      await quiz.skip(key);
      return;
    }

    if (answer === "!cheat") {
      await quiz.cheat(user);
      return;
    }

    const res = quiz.checkTitles(answer);

    if (res) {
      await quiz.clear(key);
      try {
        await updateScore(prisma, quiz.getScore(), user);
      } catch (error) {
        console.error(error);
      } finally {
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(quiz.getTitle())
          .setDescription(
            `Success! <@${user.id}> +${quiz.getScore().toString()} point!`,
          )
          .setImage(quiz.getHints().cover)
          .setURL(quiz.getUrl());

        const embedTitles = quiz.getTitlesEmbed();

        await channel.send({ embeds: [embed, embedTitles] });
      }
    }
  }
}

async function updateScore(prisma: PrismaClient, score: number, user: User) {
  if (!user.globalName || !user.avatar) return;
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
  });

  await prisma.quizScore.upsert({
    where: {
      userId: dbUser.id,
      discordId: user.id,
    },
    create: {
      discordId: user.id,
      scores: score,
      userId: dbUser.id,
    },
    update: {
      scores: { increment: score },
    },
  });
}
