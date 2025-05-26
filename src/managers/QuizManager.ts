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

export class QuizManager {
  private _data: QuizData;
  private _redis: RedisClient;
  private _timeouts: Map<string, NodeJS.Timeout>;
  private _channel: TextChannel;

  private _cheater = new Set(["831543267194568744"]);

  private _min = 1;

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

  private readonly _hintHandler = {
    cover: (key: string, value: string) => this._handlerCover(key, value),
    synopsis: (key: string, value: string) => this._handlerSynopsis(key, value),
    genres: (key: string, value: string[]) => this._handlerGenres(key, value),
    characters: (key: string, value: QuizCharacters[], redisKey: string) =>
      this._handlerCharacter(key, value as QuizCharacters[], redisKey),
  };

  private readonly _regex: RegExp =
    /[\s!~?.,"''\-_:;()[\]{}<>/\\|@#$%^&*+=×♀`©®™✓•]+|\s*\d+[a-z]*\s*season\s*\d+[a-z]*|part\s*\d*|oav|specials|ona|(the\s*)?movie|\s*\d+$/;

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

  // GETTERS

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

  // PRIVATE

  private _getHintValue(hint: keyof QuizHint): QuizHintType {
    return this._data.hint[hint];
  }

  private _getHintValueById(
    index: number,
  ): [keyof QuizHint, QuizHintType] | null {
    const hint = this._hintNumberParams.get(index);
    if (!hint) return null;
    return [hint, this._data.hint[hint]];
  }

  // HINT DISPLAY

  private async _handlerCover(key: string, value: string) {
    const embed = new EmbedBuilder()
      .setImage(value as string)
      .setColor("Random");
    await this._channel.send({ embeds: [embed] });
  }

  private async _handlerGenres(key: string, value: string[]) {
    await this._channel.send(
      `**Genres:**\n${value.map((genre) => `- ${genre}\n`).join("")}`,
    );
  }

  private async _handlerCharacter(
    key: string,
    value: QuizCharacters[],
    redisKey: string,
  ) {
    if (value.length === 0) {
      await this._channel.send("All characters have been sent");
      return;
    }
    const random = Math.floor(Math.random() * (value.length - 1));
    const character: QuizCharacter = value[random]!;
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(character.name)
      .setImage(character.image);
    this._data.hint.characters = this._data.hint.characters.filter(
      (c) => character.id != c.id,
    );
    await this._channel.send({ embeds: [embed] });
    await this._redis.set(redisKey, this.toJSON());
  }

  private async _handlerSynopsis(key: string, value: string) {
    await this._channel.send(
      `# ${capitalize(key.toString())}\n>>> ${value.toString()}`,
    );
  }

  private async _sendHint(
    key: keyof QuizHint,
    value: QuizHintType,
    redisKey: string,
  ) {
    if (key === "characters") {
      await this._hintHandler[key](key, value as QuizCharacters[], redisKey);
    } else if (key === "genres") {
      await this._hintHandler[key](key, value as string[]);
    } else {
      await this._hintHandler[key](key, value as string);
    }
  }

  // generate hints message
  private _getHintInfo(): EmbedBuilder {
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

  // Match percentage
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

  // PUBLIC

  // Start quiz
  public async start(key: string) {
    await this._redis.set(key, this.toJSON(), "EX", 60 * 60);
    const endTimeout = setTimeout(
      () => {
        this._closeQuizSession(key)
          .then()
          .catch((error: unknown) => {
            console.error(error);
          });
      },
      this._min * 60 * 1000,
    );
    this._timeouts.set(key + ":end", endTimeout);
  }

  // timers message
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

  // check the answer
  public checkTitles(answer: string): boolean {
    return this._data.titles.some(
      (title) =>
        answer === title.title.toLowerCase() ||
        this._matchPercentage(answer, title.title.toLowerCase()),
    );
  }

  // commands hint
  public async hint(answer: string, redisKey: string) {
    const [, param] = answer.split(" ");
    if (param && param in this.getHints()) {
      const hint = this._getHintValue(param as keyof QuizHint);
      if (!hint) {
        await this._channel.send(`The \`${param}\` not found in database`);
        return;
      }
      await this._sendHint(param as keyof QuizHint, hint, redisKey);
    } else if (param && /^[1-4]$/.test(param)) {
      const result = this._getHintValueById(Number(param));
      if (!result) return;
      const [key, value] = result;
      await this._sendHint(key, value, redisKey);
    } else {
      await this._channel.send({ embeds: [this._getHintInfo()] });
    }
  }

  // commands skip
  public async skip(key: string) {
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

  // commands cheat
  public async cheat(user: User) {
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

  // destroy the data in redis and stop the timer
  public async clear(key: string): Promise<void> {
    const timeoutEnd = this._timeouts.get(key + ":end");
    if (timeoutEnd) {
      clearTimeout(timeoutEnd);
      this._timeouts.delete(key + ":end");
    }
    await this._redis.del(key);
  }
}
