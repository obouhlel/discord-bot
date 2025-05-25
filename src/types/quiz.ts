import type { RedisClient } from "bun";
import { EmbedBuilder, TextChannel } from "discord.js";
import { capitalize } from "utils/capitalize";

export type QuizType = "anime" | "manga";

export type QuizHintType = string | number | string[] | undefined;

export interface QuizCharacter {
  name: string;
  images: string;
  role: string;
}

export interface QuizHint {
  synopsis?: string;
  number?: number;
  year?: number;
  genres?: string[];
  cover?: string;
}

export interface TitleMedia {
  type: string;
  title: string;
}

export interface QuizData {
  character: QuizCharacter;
  hint: QuizHint;
  titles: TitleMedia[];
  url: string;
}

export class QuizDataBuilder {
  private _data: QuizData;

  private readonly _hintParams = new Map([
    ["cover", "The cover of the anime/manga"],
    ["synopsis", "The plot summary of the anime/manga"],
    ["genres", "The genres of the anime/manga"],
    ["year", "The release year"],
    ["number", "The number of episodes/chapters"],
  ]);

  private readonly _hintNumberParams = new Map([
    [1, "cover" as keyof QuizHint],
    [2, "synopsis" as keyof QuizHint],
    [3, "genres" as keyof QuizHint],
    [4, "year" as keyof QuizHint],
    [5, "number" as keyof QuizHint],
  ]);

  private readonly _regex: RegExp =
    /[\s!~?.,"''\-_:;()[\]{}<>/\\|@#$%^&*+=×♀`©®™✓•→←↑↓∞≠≈≤≥±÷§¤¢£¥€₩₽₹†‡‰‱※‼⁂⁑⁇⁈⁉₤₧₨₩₪₫₭₮₯₰₱₲₳₴₵₸₺₼₽₾₿₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₸₺₼₽₾₿←↑→↓↔↕↖↗↘↙↚↛↜↝↞↟↠↡↢↣↤↥↦↧↨↩↪↫↬↭↮↯↰↱↲↳↴↵↶↷↸↹↺↻↼↽↾↿⇀⇁⇂⇃⇄⇅⇆⇇⇈⇉⇊⇋⇌⇍⇎⇏⇐⇑⇒⇓⇔⇕⇖⇗⇘⇙⇚⇛⇜⇝⇞⇟⇠⇡⇢⇣⇤⇥⇦⇧⇨⇩⇪⇫⇬⇭⇮⇯⇰⇱⇲⇳⇴⇵⇶⇷⇸⇹⇺⇻⇼⇽⇾⇿]+|\s*\d+[a-z]*\s*season\s*\d+[a-z]*|part\s*\d*|oav|ona|(the\s*)?movie/;

  constructor(data: QuizData | string) {
    if (typeof data === "string") {
      this._data = JSON.parse(data) as QuizData;
    } else {
      this._data = data;
    }
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
    channel: TextChannel,
    key: keyof QuizHint,
    value: QuizHintType,
  ) {
    if (!value) return;
    if (key === "genres") {
      const v = value as string[];
      await channel.send(
        `**Genres:**\n${v.map((genre) => `- ${genre}\n`).join("")}`,
      );
    } else if (key === "cover") {
      const embed = new EmbedBuilder()
        .setImage(value as string)
        .setColor("Random");
      await channel.send({ embeds: [embed] });
    } else if (key === "number") {
      await channel.send(`**Number of episode/chapter:** ${value.toString()}`);
    } else if (key === "year") {
      await channel.send(`**Started at:** ${value.toString()}`);
    } else {
      await channel.send(
        `# ${capitalize(key.toString())}\n>>> ${value.toString()}`,
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
    const threshold = title.length > 20 ? 10 : 33;
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

  public async clear(
    key: string,
    redis: RedisClient,
    timeouts: Map<string, NodeJS.Timeout>,
  ): Promise<void> {
    const timeoutOne = timeouts.get(key + ":one");
    console.log(timeoutOne);
    if (timeoutOne) {
      clearTimeout(timeoutOne);
      timeouts.delete(key + ":one");
    }
    const timeoutEnd = timeouts.get(key + ":end");
    console.log(timeoutEnd);
    if (timeoutEnd) {
      clearTimeout(timeoutEnd);
      timeouts.delete(key + ":end");
    }
    await redis.del(key);
  }
}
