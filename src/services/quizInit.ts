import {
  QuizConfig,
} from "../models/quizConfig";
import fragenData from "../data/fragen.json";
import { QuizState } from "../state/quizState";
import { Question } from "../models/questions";
import { selectQuestions, selectSmartQuestions, shuffle, shuffleAnswers } from "../utils/helpers";
import {
  isHardQuestion,
  loadQuestionHistory,
  QuestionHistory,
} from "../utils/questionHistory";

export type QuizMode = "random" | "smart" | "hard";

function addQuestionsToState(
  state: QuizState,
  categoryName: string,
  questions: Question[],
) {
  state.questions.push(...questions.map(shuffleAnswers));
  state.questionCategories.push(...questions.map(() => categoryName));
  state.categoryScores[categoryName] = 0;
}

function selectModeQuestions(
  questions: Question[],
  count: number,
  mode: QuizMode,
  history: QuestionHistory,
): Question[] {
  if (mode === "smart") {
    return selectSmartQuestions(questions, count, history);
  }

  return selectQuestions(questions, count);
}

export function initQuiz(config: QuizConfig, mode: QuizMode = "random"): QuizState {
  const history = loadQuestionHistory();
  const state: QuizState = {
    currentCategory: "",
    currentQuestionIndex: 0,
    questions: [],
    questionCategories: [],
    answers: [],
    categoryScores: {},
    showFeedback: false,
    lastSelectedIndex: -1,
  };

  if (mode === "hard") {
    for (const [categoryName, categoryQuestions] of Object.entries(
      (fragenData as any).categories,
    )) {
      const hardQuestions = (categoryQuestions as Question[]).filter((question) =>
        isHardQuestion(history, question.number),
      );
      addQuestionsToState(state, categoryName, shuffle(hardQuestions));
    }
  } else {
    for (const [categoryName, categoryConfig] of Object.entries(
      config.categories,
    )) {
      const categoryQuestions = (fragenData as any).categories[categoryName];
      if (categoryQuestions) {
        const selected = selectModeQuestions(
          categoryQuestions,
          categoryConfig.questionsCount,
          mode,
          history,
        );
        addQuestionsToState(state, categoryName, selected);
      }
    }
  }

  if (state.questions.length > 0) {
    state.currentCategory = state.questionCategories[0];
  }

  return state;
}
