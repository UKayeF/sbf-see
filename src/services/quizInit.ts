import {
  QuizConfig,
} from "../models/quizConfig";
import fragenData from "../data/fragen.json";
import { QuizState } from "../state/quizState";
import { selectQuestions, shuffleAnswers } from "../utils/helpers";

export function initQuiz(config: QuizConfig): QuizState {
  const state: QuizState = {
    currentCategory: "",
    currentQuestionIndex: 0,
    questions: [],
    answers: [],
    categoryScores: {},
    showFeedback: false,
    lastSelectedIndex: -1,
  };

  for (const [categoryName, categoryConfig] of Object.entries(
    config.categories,
  )) {
    const categoryQuestions = (fragenData as any).categories[categoryName];
    if (categoryQuestions) {
      const selected = selectQuestions(
        categoryQuestions,
        categoryConfig.questionsCount,
      );
      state.questions.push(...selected.map(shuffleAnswers));
      state.categoryScores[categoryName] = 0;
    }
  }

  if (state.questions.length > 0) {
    state.currentCategory = Object.keys(config.categories)[0];
  }

  return state;
}