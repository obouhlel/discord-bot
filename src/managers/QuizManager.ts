import type { TitleMedia } from "types/responses/title";
import type { TextChannel, User } from "discord.js";
import type { RedisClient } from "bun";
import type { QuizData, QuizCharacter } from "types/quiz";
import { EmbedBuilder } from "discord.js";
import { QuizHintManager } from "./QuizHintManager";
import { QuizAnswerChecker } from "./QuizAnswerChecker";

export class QuizManager {
  private _data: QuizData;
  private _redis: RedisClient;
  private _timeouts: Map<string, NodeJS.Timeout>;
  private _channel: TextChannel;
  private _cheater = new Set(["831543267194568744"]);
  private _min = 1;

  private _hintManager: QuizHintManager;
  private _answerChecker: QuizAnswerChecker;

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
    this._hintManager = new QuizHintManager(
      this._data,
      this._channel,
      this._redis,
    );
    this._answerChecker = new QuizAnswerChecker(this._data);
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

  public getHints() {
    return this._data.hint;
  }

  public getScore(): number {
    return this._data.score;
  }

  public getRules(): string {
    return [
      `# Anime Quiz`,
      `- Guess the anime title`,
      "- **Answer Requirements:**",
      `  - No need to include season or part`,
      `    - Example: \`Attack on Titan season 3 part 2\` or \`Attack on Titan 2\``,
      "  - You can write only the name before `:` of `!!`:",
      `     - Example: ~~\`Hakyuu!! To the top\`~~ \`Haikyuu\` or ~~\`Magi: The Labyrinth of Magic\`~~ \`Magi\``,
      "- **Commands:**",
      "  - `!hint` for a hint",
      "  - `!skip` to skip current quiz",
      "- You start with 5 points, and some hints will consume points",
      `- Duration: **1 minute**`,
    ].join("\n");
  }

  public getQuizEmbed() {
    return new EmbedBuilder()
      .setColor("Random")
      .setTitle(this._data.character.name)
      .setImage(this._data.character.image);
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
      .setImage(this._data.hint.cover)
      .setURL(this.getUrl());

    this._timeouts.delete(key + ":end");
    await this._redis.del(key);
    await this._channel.send({ embeds: [embed] });
  }

  public cleanTitle(title: string): string {
    return this._answerChecker.cleanTitle(title);
  }

  public checkTitles(answer: string): boolean {
    return this._answerChecker.checkTitles(answer);
  }

  public async hint(answer: string, quizId: string) {
    await this._hintManager.hint(answer, quizId);
  }

  public async skip(key: string) {
    await this.clear(key);
    const title = this.getTitle();
    const url = this.getUrl();

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(title)
      .setDescription(`You gave up on this character.`)
      .setImage(this._data.hint.cover)
      .setURL(url);

    const titles = this.getTitles()
      .map((title) => `- **${title.type}**: ${title.title}`)
      .join("\n");

    await this._channel.send({ content: titles, embeds: [embed] });
  }

  public async cheat(user: User) {
    if (this._cheater.has(user.id)) {
      await user.send(
        `Cheat: The answers are:\n${this.getTitles()
          .map((t) => `- ${t.title}`)
          .join("\n")}`,
      );
    }
  }

  public async clear(key: string): Promise<void> {
    const timeoutEnd = this._timeouts.get(key + ":end");
    if (timeoutEnd) {
      clearTimeout(timeoutEnd);
      this._timeouts.delete(key + ":end");
    }
    await this._redis.del(key);
  }
}
