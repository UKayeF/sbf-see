const STORAGE_KEY = "quizQuestionHistory";
const WINDOW_SIZE = 5;

export type QuestionHistory = Record<string, boolean[]>;

export function loadQuestionHistory(): QuestionHistory {
  try {
    const rawHistory = localStorage.getItem(STORAGE_KEY);
    if (!rawHistory) return {};

    const parsed = JSON.parse(rawHistory);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => Array.isArray(value))
        .map(([key, value]) => [
          key,
          (value as unknown[])
            .filter((entry): entry is boolean => typeof entry === "boolean")
            .slice(-WINDOW_SIZE),
        ]),
    );
  } catch {
    return {};
  }
}

export function saveQuestionHistory(history: QuestionHistory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function recordQuestionAnswer(questionNumber: number, isCorrect: boolean) {
  const history = loadQuestionHistory();
  const key = String(questionNumber);
  history[key] = [...(history[key] || []), isCorrect].slice(-WINDOW_SIZE);
  saveQuestionHistory(history);
}

export function resetQuestionHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getFailureRate(history: QuestionHistory, questionNumber: number): number {
  const answers = history[String(questionNumber)] || [];
  if (answers.length === 0) return 0;

  const failures = answers.filter((answer) => !answer).length;
  return failures / answers.length;
}

export function isHardQuestion(history: QuestionHistory, questionNumber: number): boolean {
  const answers = history[String(questionNumber)] || [];
  return answers.length < WINDOW_SIZE || answers.some((answer) => !answer);
}

export function getHistorySummary(history: QuestionHistory) {
  const trackedQuestions = Object.keys(history).length;
  const strugglingQuestions = Object.entries(history).filter(([questionNumber]) =>
    isHardQuestion(history, Number(questionNumber)),
  ).length;

  return {
    trackedQuestions,
    strugglingQuestions,
  };
}
