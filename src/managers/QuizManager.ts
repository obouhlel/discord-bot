import type { TitleMedia } from "types/responses/title";
// import type { PrismaClient } from "generated/prisma";
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
  // private _prisma: PrismaClient;

  private _cheater = new Set(["831543267194568744"]);

  private _min = 1;

  private readonly _hintParams = new Map([
    ["cover", "The cover of the anime/manga (-4)"],
    ["synopsis", "The plot summary of the anime/manga (-4)"],
    ["genres", "The genres of the anime/manga (-1)"],
    ["characters", "An other character of anime/manga (-1)"],
  ]);

  private readonly _hintNumberParams = new Map([
    [1, "cover" as keyof QuizHint],
    [2, "synopsis" as keyof QuizHint],
    [3, "genres" as keyof QuizHint],
    [4, "characters" as keyof QuizHint],
  ]);

  private readonly _hintScore = new Map([
    ["cover" as keyof QuizHint, 4],
    ["synopsis" as keyof QuizHint, 4],
    ["genres" as keyof QuizHint, 1],
    ["characters" as keyof QuizHint, 1],
  ]);

  private readonly _hintMapHandler = {
    cover: (key: string, value: string) => this._displayCover(key, value),
    synopsis: (key: string, value: string) => this._handlerSynopsis(key, value),
    genres: (key: string, value: string[]) => this._displayGenres(key, value),
    characters: (key: string, value: QuizCharacters[]) =>
      this._handlerCharacter(key, value as QuizCharacters[]),
  };

  private readonly _regex: RegExp =
    /[\s!~?.,"''\-_:;()[\]{}<>/\\|@#$%^&*+=×♀`©®™✓•]/;

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

  public getScore(): number {
    return this._data.score;
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

  // HINT SCORE MANAGEMENT

  private _canUseHint(param: keyof QuizHint): boolean {
    const value = this._hintScore.get(param)!;
    const score = this._data.score - value;

    if (score < 1) {
      return false;
    }
    this._data.score -= value;
    return true;
  }

  // HINT DISPLAY

  private async _displayCover(key: string, value: string) {
    const embed = new EmbedBuilder()
      .setTitle(capitalize(key))
      .setImage(value)
      .setColor("Random");
    await this._channel.send({ embeds: [embed] });
  }

  private async _displayGenres(key: string, value: string[]) {
    await this._channel.send(
      `**${capitalize(key)}:**\n${value.map((genre) => `- ${genre}\n`).join("")}`,
    );
  }

  private async _handlerCharacter(key: string, value: QuizCharacters[]) {
    if (value.length === 0) {
      await this._channel.send(`All ${key} have been sent`);
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
    await this._channel.send({
      embeds: [embed],
    });
  }

  private async _handlerSynopsis(key: string, value: string) {
    await this._channel.send(
      `# ${capitalize(key.toString())}\n>>> ${value.toString()}`,
    );
  }

  private async _hintHandler(key: keyof QuizHint, value: QuizHintType) {
    if (key === "characters") {
      await this._hintMapHandler[key](key, value as QuizCharacters[]);
    } else if (key === "genres") {
      await this._hintMapHandler[key](key, value as string[]);
    } else {
      await this._hintMapHandler[key](key, value as string);
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

  // Check title
  private _cleanTitle(title: string): string {
    let newTitle: string | undefined = title.toLowerCase() as string;
    const season =
      /\d+\w\s+season\s+\d+\w|part\s+\d+\w\s+|ova|ona|(the)\s+movie\s+\d*|\d+$/g;
    const regexMap = new Map([
      [/^.{5,}:/g, ":"],
      [/^\w+!!/g, "!!"],
    ]);

    for (const [regex, separator] of regexMap) {
      if (newTitle!.match(regex)) {
        newTitle = newTitle!.split(separator)[0];
      }
    }

    if (newTitle!.match(season)) {
      newTitle = newTitle!.split(season).join(" ");
    }

    return newTitle ?? title;
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

  private async _updateData(key: string) {
    await this._redis.set(key, this.toJSON());
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
    return this._data.titles.some((title) => {
      return (
        answer === title.title.toLowerCase() ||
        this._matchPercentage(answer, title.title) ||
        answer === this._cleanTitle(title.title)
      );
    });
  }

  // commands hint management
  public async hint(answer: string, quizId: string) {
    const [, param] = answer.split(" ");
    if (
      param &&
      param in this.getHints() &&
      this._canUseHint(param as keyof QuizHint)
    ) {
      const hint = this._getHintValue(param as keyof QuizHint);
      if (!hint) {
        await this._channel.send(`The \`${param}\` not found in database`);
        return;
      }
      await this._hintHandler(param as keyof QuizHint, hint);
      await this._updateData(quizId);
    } else if (
      param &&
      this._hintNumberParams.get(Number(param)) &&
      this._canUseHint(this._hintNumberParams.get(Number(param))!)
    ) {
      const result = this._getHintValueById(Number(param));
      if (!result) return;
      const [key, value] = result;
      await this._hintHandler(key, value);
      await this._updateData(quizId);
    } else {
      if (param) {
        await this._channel.send("You can't use more hint, use `!skip`.");
      } else {
        await this._channel.send({
          embeds: [this._getHintInfo()],
        });
      }
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
