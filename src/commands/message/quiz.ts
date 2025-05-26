import type { MessageCommandContext } from "types/commands/message";
import type { TextChannel } from "discord.js";
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
    const guild = message.guild;
    const channelId = message.channelId;

    if (!guild) return false;

    const keys = await redis.keys(`quiz:${guild.id}:${channelId}`);
    if (!keys[0]) return false;
    return true;
  }

  async execute({ client, message }: MessageCommandContext): Promise<void> {
    const { redis, timeouts } = client;
    const guild = message.guild!;
    const user = message.author;
    const channel = message.channel as TextChannel;
    const keys = await redis.keys(`quiz:${guild.id}:${channel.id}`);
    const key = keys[0]!;
    const value = await redis.get(key);
    if (!value) return;

    const quiz = new QuizManager(value, redis, timeouts, channel);
    const answer = message.content.toLowerCase();

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
      const title = quiz.getTitle();
      const url = quiz.getUrl();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(title)
        .setDescription(`Success! <@${user.id}> +5 point!`)
        .setURL(url);

      await channel.send({ embeds: [embed] });
    }
  }
}
