import type { MessageCommandContext } from "types/message-command";
import type { QuizHint } from "types/quiz";
import type { RedisClient } from "bun";
import type { TextChannel } from "discord.js";
import { QuizDataBuilder } from "types/quiz";
import { EmbedBuilder, User } from "discord.js";
import { MessageCommand } from "types/message-command";

export default class Quiz extends MessageCommand {
  public readonly data = {
    name: "Quiz Anime/Manga",
    description:
      "You need to register with /anilist first. After that, use /quiz to start playing.",
  };

  private _cheater = new Set(["831543267194568744"]);

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

    const data = new QuizDataBuilder(value);
    const answer = message.content.toLowerCase();

    if (answer.startsWith("!hint")) {
      await this._hint(answer, channel, data);
      return;
    }

    if (answer === "!skip") {
      await this._skip(data, key, redis, channel);
      return;
    }

    if (answer === "!cheat") {
      await this._cheat(user, data);
      return;
    }

    const res = data.checkTitles(answer);

    if (res) {
      await data.clear(key, redis, timeouts);
      const title = data.getTitle();
      const url = data.getUrl();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(title)
        .setDescription(`Success! <@${user.id}> +1 point!`)
        .setURL(url);

      await channel.send({ embeds: [embed] });
    }
  }

  private async _hint(
    answer: string,
    channel: TextChannel,
    data: QuizDataBuilder,
  ) {
    const [, param] = answer.split(" ");
    if (param && param in data.getHints()) {
      const hint = data.getHint(param as keyof QuizHint);
      if (!hint) {
        await channel.send(`The \`${param}\` not found in database`);
        return;
      }
      await data.sendHint(channel, param as keyof QuizHint, hint);
    } else if (param && /^[1-5]$/.test(param)) {
      const result = data.getHintByNumber(Number(param));
      if (!result) return;
      const [key, value] = result;
      await data.sendHint(channel, key, value);
    } else {
      const embed = data.getHintInfo();
      await channel.send({ embeds: [embed] });
    }
  }

  private async _cheat(user: User, data: QuizDataBuilder) {
    if (this._cheater.has(user.id)) {
      await user.send(
        `Cheat: The answers are:\n${data
          .getTitles()
          .map((t) => `- ${t.title}`)
          .join("\n")}`,
      );
    } else {
      await user.send(`# NOOBU !\nWhy are you trying to cheat? Do \`!skip\``);
    }
  }

  private async _skip(
    data: QuizDataBuilder,
    key: string,
    redis: RedisClient,
    channel: TextChannel,
  ) {
    const title = data.getTitle();
    const url = data.getUrl();

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(title)
      .setDescription(`You gave up on this character.`)
      .setURL(url);

    await channel.send({ embeds: [embed] });
    await redis.del(key);
  }
}
