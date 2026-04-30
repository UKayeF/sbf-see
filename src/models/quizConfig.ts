import fragenData from '../data/fragen.json';
import { QuestionsJson, Question } from './questions';

export interface CategoryConfig {
  questionsCount: number;
  passingThreshold: number;
}

export interface QuizConfig {
  categories: Record<string, CategoryConfig>;
  totalPassingThreshold: number;
  title?: string;
}

function getQuestionsWithQuestionImages(): Question[] {
  const data = fragenData as QuestionsJson;
  const result: Question[] = [];
  for (const cat in data.categories) {
    for (const q of data.categories[cat]) {
      if (q.image && q.image.length > 0) {
        result.push(q);
      }
    }
  }
  return result;
}

function getQuestionsWithAnswerImages(): Question[] {
  const data = fragenData as QuestionsJson;
  const result: Question[] = [];
  for (const cat in data.categories) {
    for (const q of data.categories[cat]) {
      if (q.answers.some(a => a.images && a.images.length > 0)) {
        result.push(q);
      }
    }
  }
  return result;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleAnswers(question: Question): Question {
  return {
    ...question,
    answers: shuffle(question.answers)
  };
}

export function createQuizConfig(type: string): QuizConfig {
  let questions: Question[] = [];
  let title = '';

  switch (type) {
    case 'question-images':
      questions = getQuestionsWithQuestionImages().map(shuffleAnswers);
      title = 'Fragen mit Bildern';
      break;
    case 'answer-images':
      questions = getQuestionsWithAnswerImages().map(shuffleAnswers);
      title = 'Fragen mit Antwort-Bildern';
      break;
    default:
      return defaultQuizConfig;
  }

  return {
    categories: {
      [title]: {
        questionsCount: questions.length,
        passingThreshold: 0,
      },
    },
    totalPassingThreshold: 0,
    title: title,
  };
}

export const defaultQuizConfig: QuizConfig = {
  categories: {
    "Basisfragen": {
      questionsCount: 15,
      passingThreshold: 11,
    },
    "Spezifische Fragen See": {
      questionsCount: 15,
      passingThreshold: 11,
    },
  },
  totalPassingThreshold: 22,
};