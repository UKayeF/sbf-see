import { Question } from "../models/questions";
import { getFailureRate, QuestionHistory } from "./questionHistory";

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

export function selectSmartQuestions(
  questions: Question[],
  count: number,
  history: QuestionHistory,
): Question[] {
  const availableQuestions = [...questions];
  const selected: Question[] = [];

  while (selected.length < count && availableQuestions.length > 0) {
    const weightedQuestions = availableQuestions.map((question) => {
      const failureRate = getFailureRate(history, question.number);
      const hasFailures = (history[String(question.number)] || []).some((answer) => !answer);
      return {
        question,
        weight: 1 + failureRate * 4 + (hasFailures ? 1 : 0),
      };
    });
    const totalWeight = weightedQuestions.reduce((sum, item) => sum + item.weight, 0);
    let pick = Math.random() * totalWeight;
    const selectedIndex = weightedQuestions.findIndex((item) => {
      pick -= item.weight;
      return pick <= 0;
    });
    const index = selectedIndex === -1 ? weightedQuestions.length - 1 : selectedIndex;
    selected.push(weightedQuestions[index].question);
    availableQuestions.splice(index, 1);
  }

  return selected;
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
