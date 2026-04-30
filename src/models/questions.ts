export interface Answer {
  text: string;
  isCorrect: boolean;
  images?: string[];
}

export interface Question {
  question: string;
  answers: Answer[];
  image?: string[];
  images?: string[];
  needsFix?: boolean;
}

export interface Category {
  [key: string]: Question[];
}

export interface QuestionsJson {
  categories: Category;
}