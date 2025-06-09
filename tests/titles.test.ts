import type { QuizData } from "types/quiz";
import { expect, test } from "bun:test";
import { QuizBuilder } from "managers/quiz/QuizBuilder";
import { QuizAnswerChecker } from "managers/quiz/QuizAnswerChecker";

test("Test Danmachi", async () => {
  const quiz = new QuizBuilder();
  const data: QuizData | null = await quiz.buildQuizData(37347);
  if (!data) throw new Error("Data not found");
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("danmachi")).toBe(true);
});

test("Test Overlord", async () => {
  const quiz = new QuizBuilder();
  const data: QuizData | null = await quiz.buildQuizData(35073);
  if (!data) throw new Error("Data not found");
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("overlord")).toBe(true);
});

test("Test Oregairu", async () => {
  const quiz = new QuizBuilder();
  const data: QuizData | null = await quiz.buildQuizData(39547);
  if (!data) throw new Error("Data not found");
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("oregairu")).toBe(true);
});

test("Japanese title with season", async () => {
  const quiz = new QuizBuilder();
  const data: QuizData | null = await quiz.buildQuizData(50803);
  if (!data) throw new Error("Data not found");
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("弱キャラ友崎くん")).toBe(true);
});

test("Assassination Classroom test", async () => {
  const quiz = new QuizBuilder();
  const data: QuizData | null = await quiz.buildQuizData(30654);
  if (!data) throw new Error("Data not found");
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("assassination classroom")).toBe(true);
});

test("K-On test", async () => {
  const quiz = new QuizBuilder();
  const data: QuizData | null = await quiz.buildQuizData(7791);
  if (!data) throw new Error("Data not found");
  const quizAnswerChecker = new QuizAnswerChecker(data);

  expect(quizAnswerChecker.checkTitles("!gint 4")).toBe(false);
});
