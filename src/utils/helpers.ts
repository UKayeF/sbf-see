import { Question } from "../models/questions";

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function selectQuestions(questions: Question[], count: number): Question[] {
  return shouldShuffle() ? shuffle(questions).slice(0, count) : questions;
}

export function shuffleAnswers(question: Question): Question {
  return {
    ...question,
    answers: shuffle(question.answers),
  };
}

export function shouldShuffle(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get("quiz") !== "all";
}