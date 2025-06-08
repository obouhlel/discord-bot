import type { QuizData } from "types/quiz";
import { expect, test } from "bun:test";
import { QuizBuilder } from "managers/quiz/QuizBuilder";
import { QuizAnswerChecker } from "managers/quiz/QuizAnswerChecker";

test("Test Danmachi", async () => {
  const quiz = new QuizBuilder();
  const data: QuizData | null = await quiz.buildQuizData(37347);
  if (!data) return;
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("danmachi")).toBe(true);
});

test("Test Overlord", async () => {
  const quiz = new QuizBuilder();
  const data: QuizData | null = await quiz.buildQuizData(35073);
  if (!data) return;
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("overlord")).toBe(true);
});
