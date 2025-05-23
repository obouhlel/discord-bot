import type { MessageCommandContext } from "types/message-command";
import { EmbedBuilder, type TextChannel } from "discord.js";
import type { QuizData } from "types/quiz";
import { MessageCommand } from "types/message-command";

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

    const keys = await redis.keys(`quiz:*:${guild.id}:${channelId}`);
    if (!keys[0]) return false;
    return true;
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
    console.log("% = ", percentage);
    return percentage >= threshold;
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

    if (answer === "!hint") {
      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("Hint")
        .setDescription(
          `📖 **Synopsis:** ${data.media.synopsis}\n🗓️ **Year:** ${data.media.year.toString()}\n🏷️ **Genres:** ${data.media.genres.join(", ")}`,
        );
      await channel.send({ embeds: [embed] });
      return;
    }

    if (answer === "!skip") {
      const res = data.media.titles.find(
        (title) => title.type === "Default",
      )!.title;
      await channel.send(
        `You gave up on this character. The response is : **${res}**`,
      );
      await redis.del(key);
      return;
    }

    console.log(data.media.titles);

    const res = data.media.titles.some((title) =>
      this._matchPercentage(answer, title.title.toLowerCase()),
    );

    if (res) {
      const title = data.media.titles.find(
        (title) => title.type === "Default",
      )!.title;
      await channel.send(
        `Success! <@!${user.id}> +1 point! The title by default is : **${title}**.`,
      );
      await redis.del(key);
    }
  }
}
