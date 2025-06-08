import { expect, test } from "bun:test";
import type { QuizData } from "types/quiz";
import { buildQuizData } from "utils/builders/quiz";
import { QuizAnswerChecker } from "managers/QuizAnswerChecker";

test("Test Danmachi", async () => {
  const data: QuizData | null = await buildQuizData(37347);
  if (!data) return;
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("danmachi")).toBe(true);
});

test("Test Overlord", async () => {
  const data: QuizData | null = await buildQuizData(35073);
  if (!data) return;
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("overlord")).toBe(true);
});
