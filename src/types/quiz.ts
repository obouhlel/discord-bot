export type QuizType = "anime" | "manga";

export interface TitleMedia {
  type: string;
  title: string;
}

export interface QuizData {
  character: {
    name: string;
    images: string;
  };
  media: {
    titles: TitleMedia[];
    synopsis: string;
    year: number;
    genres: string[];
  };
}
