export type QuizType = "anime" | "manga";

export interface TitleMedia {
  type: string;
  title: string;
}

export type HintQuiz = string | number | boolean | string[] | undefined;

export interface QuizData {
  character: {
    name: string;
    images: string;
    role: string;
  };
  hint: {
    synopsis?: string;
    number?: number;
    year?: number;
    genres?: string[];
  };
  titles: TitleMedia[];
  url: string;
}
