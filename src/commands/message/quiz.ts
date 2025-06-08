import type { MessageCommandContext } from "types/commands/message";
import type { TextChannel } from "discord.js";
import { QuizManager } from "managers/quiz/QuizManager";
import { MessageCommand } from "types/commands/message";

export default class Quiz extends MessageCommand {
  public readonly data = {
    name: "Anime Quiz with Characters",
    description:
      "First, register with /register in bot DM. Then use /quiz to start playing.",
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

    const quiz = new QuizManager(value, redis, timeouts, channel, prisma);
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

    if (quiz.checkTitles(answer)) await quiz.end(key, user);
  }
}
