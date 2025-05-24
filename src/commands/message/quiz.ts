import type { MessageCommandContext } from "types/message-command";
import type { HintQuiz, QuizData } from "types/quiz";
import type { RedisClient } from "bun";
import { EmbedBuilder, type TextChannel } from "discord.js";
import { MessageCommand } from "types/message-command";
import { capitalize } from "utils/capitalize";

export default class Quiz extends MessageCommand {
  public readonly data = {
    name: "Quiz Anime/Manga",
    description:
      "You need to register with /anilist first. After that, use /quiz to start playing.",
  };

  private readonly _hintParams = new Map([
    ["synopsis", "The plot summary of the anime/manga"],
    ["number", "The number of episodes/chapters"],
    ["year", "The release year"],
    ["genres", "The genres of the anime/manga"],
  ]);

  async shouldExecute({
    client,
    message,
  }: MessageCommandContext): Promise<boolean> {
    if (message.author.bot) return false;

    const { redis } = client;
    const guild = message.guild;
    const channelId = message.channelId;

    if (!guild) return false;

    const keys = await redis.keys(`quiz:*:${guild.id}:${channelId}`);
    if (!keys[0]) return false;
    return true;
  }

  async execute({ client, message }: MessageCommandContext): Promise<void> {
    const { redis } = client;
    const guild = message.guild!;
    const user = message.author;
    const channel = message.channel as TextChannel;
    const keys = await redis.keys(`quiz:*:${guild.id}:${channel.id}`);
    const key = keys[0]!;
    const value = await redis.get(key);
    if (!value) return;

    const data = JSON.parse(value) as QuizData;
    const answer = message.content.toLowerCase();

    if (answer.startsWith("!hint")) {
      await this._hint(data, answer, channel);
      return;
    }

    if (answer === "!skip") {
      await this._skip(data, key, redis, channel);
      return;
    }

    if (answer === "!cheat" && user.id === "831543267194568744") {
      await user.send(
        `Cheat: The answers are:\n${data.titles.map((t) => `- ${t.title}`).join("\n")}`,
      );
      return;
    }

    const res = data.titles.some(
      (title) =>
        this._matchPercentage(answer, title.title.toLowerCase()) ||
        answer === title.title.toLowerCase(),
    );

    if (res) {
      const title =
        data.titles.find((title) => title.type === "English")?.title ??
        data.titles.find((title) => title.type === "Default")!.title;
      const url = data.url;

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(title)
        .setDescription(`Success! <@${user.id}> +1 point!`)
        .setURL(url);

      await channel.send({ embeds: [embed] });
      await redis.del(key);
    }
  }

  private _matchPercentage(answer: string, title: string): boolean {
    const answerWords = answer
      .toLowerCase()
      .split(/[ !~?.,"'’\-_:;()\]{}<>/\\|@#$%^&*+=`]+/)
      .filter(Boolean);
    const titleWords = title
      .toLowerCase()
      .split(/[ !~?.,"'’\-_:;()\]{}<>/\\|@#$%^&*+=`]+/)
      .filter(Boolean);
    const matchCount = titleWords.filter((word) =>
      answerWords.includes(word),
    ).length;
    const threshold = titleWords.length > 3 ? 33 : 80;
    const percentage = (matchCount / titleWords.length) * 100;
    return percentage >= threshold;
  }

  private async _hint(
    data: QuizData,
    answer: string,
    channel: TextChannel,
  ): Promise<void> {
    const params = answer.split(" ").slice(1);
    const validParams = params.filter((p) => this._hintParams.has(p));

    if (validParams.length === 0) {
      const paramsList = Array.from(this._hintParams.entries())
        .map(([key, desc]) => `• **${key}:** ${desc}`)
        .join("\n");
      const embed = new EmbedBuilder()
        .setTitle("Available Hint Parameters")
        .setColor("Gold")
        .setDescription(
          `Use !hint with one or more of these parameters:\n${paramsList}`,
        );
      await channel.send({ embeds: [embed] });
      return;
    }

    for (const param of validParams) {
      const hintValue = data.hint[
        param.toLowerCase() as keyof typeof data.hint
      ] as HintQuiz;

      if (!hintValue) {
        await channel.send(`**${param.toLowerCase()}** not found in database`);
        continue;
      }

      if (Array.isArray(hintValue)) {
        await channel.send(
          `>>> **${capitalize(param)}** :\n${hintValue.map((v) => `- ${v}`).join("\n")}`,
        );
      } else {
        await channel.send(
          `>>> **${capitalize(param)}** : ${String(hintValue)}`,
        );
      }
    }
  }

  private async _skip(
    data: QuizData,
    key: string,
    redis: RedisClient,
    channel: TextChannel,
  ) {
    const title =
      data.titles.find((title) => title.type === "English")?.title ??
      data.titles.find((title) => title.type === "Default")!.title;
    const url = data.url;

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(title)
      .setDescription(`You gave up on this character.`)
      .setURL(url);

    await channel.send({ embeds: [embed] });
    await redis.del(key);
  }
}
