import { EmbedBuilder } from "discord.js";

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
    ["synopsis", "The plot summary of the anime/manga"],
    ["number", "The number of episodes/chapters"],
    ["year", "The release year"],
    ["genres", "The genres of the anime/manga"],
  ]);

  private readonly _hintNumberParams = new Map([
    [1, "synopsis" as keyof QuizHint],
    [2, "number" as keyof QuizHint],
    [3, "year" as keyof QuizHint],
    [4, "genres" as keyof QuizHint],
  ]);

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

  public getHintByNumber(index: number): [string, QuizHintType] | null {
    const hint = this._hintNumberParams.get(index);
    if (!hint) return null;
    return [String(hint), this._data.hint[hint]];
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
    const regex =
      /[\s!~?.,"'’\-_:;()[\]{}<>/\\|@#$%^&*+=×`]+|season\s*\d*|part\s*\d*|oav|ona|movie/;
    const answerWords = answer.toLowerCase().split(regex).filter(Boolean);
    const titleWords = title.toLowerCase().split(regex).filter(Boolean);
    const matchCount = titleWords.filter((word) =>
      answerWords.includes(word),
    ).length;
    const threshold = titleWords.length > 3 ? 33 : 80;
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
}
