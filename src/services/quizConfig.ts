import {
  QuizConfig,
  defaultQuizConfig,
  createQuizConfig,
} from "../models/quizConfig";
import { getQuizType } from "../utils/urlParams";

export function getConfig(): QuizConfig {
  const quizType = getQuizType();
  const config =
    quizType === "default" ? defaultQuizConfig : createQuizConfig(quizType);
  return config;
}