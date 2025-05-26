import type { TitleMedia } from "./responses/title";

export type QuizType = "anime" | "manga";

export type QuizHintType = string | string[] | QuizCharacters[];

export interface QuizCharacter {
  id: number;
  name: string;
  image: string;
}

export interface QuizCharacters {
  id: number;
  name: string;
  image: string;
}

export interface QuizHint {
  synopsis: string;
  genres: string[];
  cover: string;
  characters: QuizCharacters[];
}

export interface QuizData {
  character: QuizCharacter;
  hint: QuizHint;
  titles: TitleMedia[];
  url: string;
  type: QuizType;
}
