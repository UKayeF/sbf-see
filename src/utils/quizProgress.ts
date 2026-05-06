import { QuizConfig } from "../models/quizConfig";
import { QuizState } from "../state/quizState";

export function getCategoryForQuestion(
  config: QuizConfig,
  state: QuizState,
  questionIndex: number,
): string {
  let questionCount = 0;
  for (const [categoryName, categoryConfig] of Object.entries(
    config.categories,
  )) {
    const nextCount = questionCount + categoryConfig.questionsCount;
    if (questionIndex < nextCount) {
      return categoryName;
    }
    questionCount = nextCount;
  }
  return state.currentCategory;
}

export function getCategoryQuestionIndex(
  config: QuizConfig,
  state: QuizState,
  questionIndex: number,
): number {
  const category = getCategoryForQuestion(config, state, questionIndex);
  return state.questions
    .slice(0, questionIndex)
    .filter((_, index) => getCategoryForQuestion(config, state, index) === category)
    .length;
}
