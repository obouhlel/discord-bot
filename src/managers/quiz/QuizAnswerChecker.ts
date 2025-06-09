import type { QuizData } from "types/quiz";

export class QuizAnswerChecker {
  private _data: QuizData;

  constructor(data: QuizData) {
    this._data = data;
  }

  public cleanTitle(title: string): string {
    const newTitle: string = title.toLowerCase();

    const season = new RegExp(
      [
        String.raw`\d+(st|nd|rd|th)?\s*(saison|season|stage|movie|film)`,
        String.raw`(saison|season|stage|movie|film)\s+(\d+|[ivxlcdm]+)(st|nd|rd|th)?`,
        String.raw`part\s+(\d+|[ivxlcdm]+)(st|nd|rd|th)?`,
        String.raw`ova`,
        String.raw`ona`,
        String.raw`(the)?\s*movie\s*(\d+|[ivxlcdm]+)?`,
        String.raw`\s+(\d+|[ivxlcdm]+)$`,
      ].join("|"),
      "gi",
    );

    return newTitle
      .replace(season, "")
      .replace(/\s+/g, "")
      .replace(/[^\p{L}\p{N}]/gu, "");
  }

  public checkTitles(answer: string): boolean {
    const test = (anwser: string, titles: string[]): boolean => {
      if (titles.length === 0) return true;

      return titles.some((title) => {
        const titleCleaned = this.cleanTitle(title);
        const answerCleaned = this.cleanTitle(anwser);

        const answerSorted = answerCleaned.split("").sort().join("");
        const titleSorted = titleCleaned.split("").sort().join("");

        const regexReplaceNonAsciiToSpace = /[^\p{L}\p{N}]/gu;
        const numberOfWordsInTitle = title
          .replace(regexReplaceNonAsciiToSpace, " ")
          .trim()
          .split(/\s+/).length;

        const matchAnswerWithLevenshteinDistance = (
          answer: string,
          title: string,
          numberOfMistakesPossible: number,
        ): boolean => {
          const a = answer.toLowerCase().trim();
          const b = title.toLowerCase().trim();

          const rows = a.length + 1;
          const cols = b.length + 1;

          const matrix = Array.from({ length: rows }, () =>
            new Array<number>(cols).fill(0),
          ) as number[][];

          for (let i = 0; i < rows; i++) {
            // @ts-expect-error Could not find a way to type this correctly
            matrix[i][0] = i;
          }
          for (let j = 0; j < cols; j++) {
            // @ts-expect-error Could not find a way to type this correctly
            matrix[0][j] = j;
          }

          for (let i = 1; i < rows; i++) {
            for (let j = 1; j < cols; j++) {
              const cost = a[i - 1] === b[j - 1] ? 0 : 1;
              // @ts-expect-error Could not find a way to type this correctly
              matrix[i][j] = Math.min(
                // @ts-expect-error Could not find a way to type this correctly
                (matrix[i - 1][j] ?? Infinity) + 1,
                // @ts-expect-error Could not find a way to type this correctly
                (matrix[i][j - 1] ?? Infinity) + 1,
                // @ts-expect-error Could not find a way to type this correctly
                (matrix[i - 1][j - 1] ?? Infinity) + cost,
              );
            }
          }

          // @ts-expect-error Could not find a way to type this correctly
          const distance = matrix[a.length][b.length];
          // @ts-expect-error Could not find a way to type this correctly
          return distance <= numberOfMistakesPossible;
        };

        const answerMatch = answerSorted === titleSorted;
        const answerMatchWithMistake = matchAnswerWithLevenshteinDistance(
          answerCleaned,
          titleCleaned,
          numberOfWordsInTitle - 1,
        );

        return answerMatch || answerMatchWithMistake;
      });
    };

    return test(
      answer,
      this._data.titles.map((t) => t.title),
    );
  }
}
