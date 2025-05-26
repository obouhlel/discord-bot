import type { TitleMedia } from "types/responses/title";
import type { TextChannel, User } from "discord.js";
import type { RedisClient } from "bun";
import type {
  QuizData,
  QuizHint,
  QuizCharacter,
  QuizCharacters,
  QuizHintType,
} from "types/quiz";
import { EmbedBuilder } from "discord.js";
import { capitalize } from "utils/capitalize";

export class QuizDataManager {
  private _data: QuizData;
  private _redis: RedisClient;
  private _timeouts: Map<string, NodeJS.Timeout>;
  private _channel: TextChannel;

  private _cheater = new Set(["831543267194568744"]);

  private readonly _hintParams = new Map([
    ["cover", "The cover of the anime/manga"],
    ["synopsis", "The plot summary of the anime/manga"],
    ["genres", "The genres of the anime/manga"],
    ["characters", "An other character of anime/manga"],
  ]);

  private readonly _hintNumberParams = new Map([
    [1, "cover" as keyof QuizHint],
    [2, "synopsis" as keyof QuizHint],
    [3, "genres" as keyof QuizHint],
    [4, "characters" as keyof QuizHint],
  ]);

  private readonly _regex: RegExp =
    /[\s!~?.,"''\-_:;()[\]{}<>/\\|@#$%^&*+=×♀`©®™✓•]+|\s*\d+[a-z]*\s*season\s*\d+[a-z]*|part\s*\d*|oav|ona|(the\s*)?movie|\s*\d+$/;

  constructor(
    data: QuizData | string,
    redis: RedisClient,
    timeouts: Map<string, NodeJS.Timeout>,
    channel: TextChannel,
  ) {
    if (typeof data === "string") {
      this._data = JSON.parse(data) as QuizData;
    } else {
      this._data = data;
    }
    this._redis = redis;
    this._timeouts = timeouts;
    this._channel = channel;
  }

  public toJSON(): string {
    return JSON.stringify(this._data);
  }

  public getTitles(): TitleMedia[] {
    return this._data.titles;
  }

  public getTitle(): string {
    return (
      this._data.titles.find((title) => title.type === "English")?.title ??
      this._data.titles.find((title) => title.type === "Default")!.title
    );
  }

  public getUrl(): string {
    return this._data.url;
  }

  public getCharater(): QuizCharacter {
    return this._data.character;
  }

  public getHints(): QuizHint {
    return this._data.hint;
  }

  public getHint(hint: keyof QuizHint): QuizHintType {
    return this._data.hint[hint];
  }

  public getHintByNumber(index: number): [keyof QuizHint, QuizHintType] | null {
    const hint = this._hintNumberParams.get(index);
    if (!hint) return null;
    return [hint, this._data.hint[hint]];
  }

  public async sendHint(
    key: keyof QuizHint,
    value: QuizHintType,
    redisKey: string,
  ) {
    if (!value) return;
    if (key === "genres") {
      const v = value as string[];
      await this._channel.send(
        `**Genres:**\n${v.map((genre) => `- ${genre}\n`).join("")}`,
      );
    } else if (key === "cover") {
      const embed = new EmbedBuilder()
        .setImage(value as string)
        .setColor("Random");
      await this._channel.send({ embeds: [embed] });
    } else if (key === "characters") {
      const v = value as QuizCharacters[];
      if (v.length === 0) {
        await this._channel.send("All characters have been sent");
        return;
      }
      const random = Math.floor(Math.random() * (v.length - 1));
      const character = v[random]!;
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(character.name)
        .setImage(character.image);
      this._data.hint.characters = this._data.hint.characters.filter(
        (c) => character.id != c.id,
      );
      await this._channel.send({ embeds: [embed] });
      await this._redis.set(redisKey, this.toJSON());
    } else {
      const v = value as string;
      await this._channel.send(
        `# ${capitalize(key.toString())}\n>>> ${v.toString()}`,
      );
    }
  }

  public getHintInfo(): EmbedBuilder {
    const paramsList = Array.from(this._hintParams.entries())
      .map(([key, desc], i) => `${(i + 1).toString()} - \`${key}\`: ${desc}`)
      .join("\n");
    const embed = new EmbedBuilder()
      .setTitle("Available Hint Parameters")
      .setColor("Gold")
      .setDescription(
        `Use !hint with one or more of these parameters:\n${paramsList}\n**Example:** \`!hint synopsis\` or \`!hint 1\``,
      );
    return embed;
  }

  private _matchPercentage(answer: string, title: string): boolean {
    const answerWords = answer.toLowerCase().split(this._regex).filter(Boolean);
    const titleWords = title.toLowerCase().split(this._regex).filter(Boolean);
    const matchCount = titleWords.filter((word) =>
      answerWords.includes(word),
    ).length;
    if (titleWords.length <= 3) {
      const threshold = 100;
      const percentage = Math.floor((matchCount / titleWords.length) * 100);
      return percentage >= threshold;
    }
    const threshold = title.length > 30 ? 20 : 33;
    const percentage = Math.floor((matchCount / titleWords.length) * 100);
    return percentage >= threshold;
  }

  public checkTitles(answer: string): boolean {
    return this._data.titles.some(
      (title) =>
        answer === title.title.toLowerCase() ||
        this._matchPercentage(answer, title.title.toLowerCase()),
    );
  }

  public async start(key: string) {
    await this._redis.set(key, this.toJSON(), "EX", 60 * 60);
    this._startQuizCountdown(key);
  }

  private _startQuizCountdown(key: string) {
    const min = 3;
    const oneMinuteTimeout = setTimeout(
      () => {
        this._notifyOneMinuteLeft(key)
          .then()
          .catch((error: unknown) => {
            console.error(error);
          });
      },
      (min - 1) * 60 * 1000,
    );
    const endTimeout = setTimeout(
      () => {
        this._closeQuizSession(key)
          .then()
          .catch((error: unknown) => {
            console.error(error);
          });
      },
      min * 60 * 1000,
    );
    this._timeouts.set(key + ":one", oneMinuteTimeout);
    this._timeouts.set(key + ":end", endTimeout);
  }

  private async _notifyOneMinuteLeft(key: string) {
    const value = await this._redis.get(key);
    if (!value) return;
    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("⚠️ One minute remaining!")
      .setDescription("Hurry up! Only 60 seconds left to find the answer.");

    this._timeouts.delete(key + ":one");
    await this._channel.send({ embeds: [embed] });
  }

  private async _closeQuizSession(key: string) {
    const value = await this._redis.get(key);
    if (!value) return;

    const embed = new EmbedBuilder()
      .setColor("White")
      .setTitle(this.getTitle())
      .setDescription("⏰ Time's up! The quiz has ended.")
      .setURL(this.getUrl());

    this._timeouts.delete(key + ":end");
    await this._redis.del(key);
    await this._channel.send({ embeds: [embed] });
  }

  public async clear(key: string): Promise<void> {
    const timeoutOne = this._timeouts.get(key + ":one");
    if (timeoutOne) {
      clearTimeout(timeoutOne);
      this._timeouts.delete(key + ":one");
    }
    const timeoutEnd = this._timeouts.get(key + ":end");
    if (timeoutEnd) {
      clearTimeout(timeoutEnd);
      this._timeouts.delete(key + ":end");
    }
    await this._redis.del(key);
  }

  async hint(answer: string, redisKey: string) {
    const [, param] = answer.split(" ");
    if (param && param in this.getHints()) {
      const hint = this.getHint(param as keyof QuizHint);
      if (!hint) {
        await this._channel.send(`The \`${param}\` not found in database`);
        return;
      }
      await this.sendHint(param as keyof QuizHint, hint, redisKey);
    } else if (param && /^[1-4]$/.test(param)) {
      const result = this.getHintByNumber(Number(param));
      if (!result) return;
      const [key, value] = result;
      await this.sendHint(key, value, redisKey);
    } else {
      await this._channel.send({ embeds: [this.getHintInfo()] });
    }
  }

  async skip(key: string) {
    await this.clear(key);
    const title = this.getTitle();
    const url = this.getUrl();

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(title)
      .setDescription(`You gave up on this character.`)
      .setURL(url);

    await this._channel.send({ embeds: [embed] });
  }

  async cheat(user: User) {
    if (this._cheater.has(user.id)) {
      await user.send(
        `Cheat: The answers are:\n${this.getTitles()
          .map((t) => `- ${t.title}`)
          .join("\n")}`,
      );
    } else {
      await user.send(`# NOOBU !\nWhy are you trying to cheat? Do \`!skip\``);
    }
  }
}
