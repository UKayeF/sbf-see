import fragenData from "../data/fragen.json";
import { Question, QuestionsJson } from "../models/questions";
import { QuestionHistory } from "../utils/questionHistory";

interface QuestionInsight {
  category: string;
  question: Question;
  answers: boolean[];
}

interface QuestionInsightsProps {
  history: QuestionHistory;
}

function getAnsweredQuestions(history: QuestionHistory): QuestionInsight[] {
  const questionsByNumber = new Map<number, { category: string; question: Question }>();

  for (const [category, questions] of Object.entries(
    (fragenData as QuestionsJson).categories,
  )) {
    for (const question of questions) {
      questionsByNumber.set(question.number, { category, question });
    }
  }

  return Object.entries(history)
    .map(([questionNumber, answers]) => {
      const questionInfo = questionsByNumber.get(Number(questionNumber));
      if (!questionInfo || answers.length === 0) return null;

      return {
        ...questionInfo,
        answers,
      };
    })
    .filter((item): item is QuestionInsight => item !== null)
    .sort((a, b) => a.question.number - b.question.number);
}

export function QuestionInsights({ history }: QuestionInsightsProps) {
  const answeredQuestions = getAnsweredQuestions(history);

  return (
    <section class="insights-panel">
      <h2>Answered Questions</h2>
      {answeredQuestions.length === 0 ? (
        <p class="insights-empty">No answered questions yet.</p>
      ) : (
        <div class="insights-list">
          {answeredQuestions.map(({ category, question, answers }) => {
            const paddedAnswers = [...Array(5 - answers.length).fill(null), ...answers];

            return (
              <article class="insight-item">
                <div class="insight-header">
                  <span class="insight-number">#{question.number}</span>
                  <span class="insight-category">{category}</span>
                  <span class="history-dots" aria-label="Answer history">
                    {paddedAnswers.map((answer) => (
                      <span
                        class={`history-dot ${
                          answer === null ? "empty" : answer ? "correct" : "incorrect"
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <p class="insight-question">{question.question}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
