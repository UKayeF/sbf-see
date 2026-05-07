import { QuizConfig } from "../models/quizConfig";
import { QuizState } from "../state/quizState";

interface ResultsViewProps {
  config: QuizConfig;
  state: QuizState;
  onRestart: () => void;
  onRetryWrong: () => void;
  onStartOver: () => void;
}

export function ResultsView({
  config,
  state,
  onRestart,
  onRetryWrong,
  onStartOver,
}: ResultsViewProps) {
  let totalScore = 0;
  const categoryResults = Object.entries(config.categories).map(
    ([categoryName, categoryConfig]) => {
      const score = state.categoryScores[categoryName] || 0;
      const passed = score >= categoryConfig.passingThreshold;
      if (passed) totalScore += score;

      return {
        categoryName,
        questionsCount: categoryConfig.questionsCount,
        score,
        passed,
      };
    },
  );
  const totalPassed = totalScore >= config.totalPassingThreshold;

  const wrongAnswers = state.answers.filter((a) => !a.correct);
  const hasWrongAnswers = wrongAnswers.length > 0;

  return (
    <>
      <h2>Results</h2>
      <table class="results">
        <thead>
          <tr>
            <th>Category</th>
            <th>Score</th>
            <th>Passed</th>
          </tr>
        </thead>
        <tbody>
          {categoryResults.map((result) => (
            <tr>
              <td>{result.categoryName}</td>
              <td>
                {result.score}/{result.questionsCount}
              </td>
              <td>{result.passed ? "Y" : "N"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p class="total">
        Total: {totalScore} points - {totalPassed ? "PASSED!" : "FAILED"}
      </p>

      <h3>Summary</h3>
      <div class="summary-list">
        {state.answers.map((answer, index) => {
          return (
            <div class={`summary-item ${answer.correct ? "correct" : "incorrect"}`}>
              <div class="summary-question">
                <span class="summary-number">{index + 1}.</span>
                <span class="summary-text">{answer.question}</span>
              </div>
              {answer.images && answer.images.length > 0 && (
                <div class="summary-images">
                  {answer.images.map((img) => (
                    <img class="summary-image" src={img} alt="Question image" />
                  ))}
                </div>
              )}
              <div class="summary-answers">
                {answer.answers.map((ans, idx) => (
                  <div class={`summary-answer-item ${idx === answer.selected ? "selected" : ""} ${ans.isCorrect ? "correct-answer" : ""}`}>
                    <div class="summary-answer-text">
                      {idx === answer.selected && <span class="your-badge">Your answer: </span>}
                      {ans.isCorrect && <span class="correct-badge">Correct: </span>}
                      {ans.text}
                    </div>
                    {ans.images && ans.images.length > 0 && (
                      <div class="summary-answer-images">
                        {ans.images.map((img) => (
                          <img class="summary-image" src={img} alt="Answer image" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div class="result-buttons">
        <button id="restart-btn" type="button" onClick={onRestart}>
          Restart Same Quiz
        </button>
        {hasWrongAnswers && (
          <button id="retry-wrong-btn" type="button" onClick={onRetryWrong}>
            Retry Wrong Answers ({wrongAnswers.length})
          </button>
        )}
        <button id="start-over-btn" type="button" onClick={onStartOver}>
          Start New Quiz
        </button>
      </div>
    </>
  );
}