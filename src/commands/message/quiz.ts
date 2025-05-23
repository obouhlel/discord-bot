import type CustomDiscordClient from "types/custom-discord-client";
import type { MessageCommandContext } from "types/message-command";
import type { Message, TextChannel } from "discord.js";
import type { Anime } from "types/anime";
import type { Manga } from "types/manga";
import type { QuizType } from "types/quiz";
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
    const user = message.author;
    const channelId = message.channelId;

    const keys = await redis.keys(`quiz:*:${user.id}:${channelId}`);
    if (!keys[0]) return false;
    return true;
  }

  async execute({ client, message }: MessageCommandContext): Promise<void> {
    console.log("Quiz running");
    const channel = message.channel as TextChannel;
    try {
      const { redis } = client;
      const user = message.author;
      const channelId = message.channelId;
      const keys = await redis.keys(`quiz:*:${user.id}:${channelId}`);
      // eslint-disable-next-line
      const key = keys[0]!;
      const infos = key.split(":");
      // eslint-disable-next-line
      const type = infos[1]! as QuizType;
      const value = await redis.get(key);
      if (!value) return;
      const data: unknown = JSON.parse(value);
      if (type === "anime") {
        await this._animeQuiz(client, message, data as Anime);
      } else {
        await this._mangaQuiz(client, message, data as Manga);
      }
    } catch (error) {
      console.error(error);
      await channel.send("Error");
    }
  }

  private async _animeQuiz(
    client: CustomDiscordClient,
    message: Message,
    data: Anime,
  ): Promise<void> {
    const channel = message.channel as TextChannel;
    // eslint-disable-next-line
    const title = data.titles.find((title) => title.type === "Default")!.title;

    await channel.send(title);
  }

  private async _mangaQuiz(
    client: CustomDiscordClient,
    message: Message,
    data: Manga,
  ): Promise<void> {
    const channel = message.channel as TextChannel;
    // eslint-disable-next-line
    const title = data.titles.find((title) => title.type === "Default")!.title;

    await channel.send(title);
  }
}
