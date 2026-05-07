import { Question } from "../models/questions";

export interface Answer {
  questionIndex: number;
  question: string;
  images?: string[];
  answers: { text: string; isCorrect: boolean; images?: string[] }[];
  selected: number;
  correct: boolean;
}

export interface QuizState {
  currentCategory: string;
  currentQuestionIndex: number;
  questions: Question[];
  answers: Answer[];
  categoryScores: Record<string, number>;
  showFeedback: boolean;
  lastSelectedIndex: number;
}