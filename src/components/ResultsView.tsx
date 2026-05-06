import { QuizConfig } from "../models/quizConfig";
import { QuizState } from "../state/quizState";

interface ResultsViewProps {
  config: QuizConfig;
  state: QuizState;
  onRestart: () => void;
  onStartOver: () => void;
}

export function ResultsView({
  config,
  state,
  onRestart,
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
      <button id="restart-btn" type="button" onClick={onRestart}>
        Restart
      </button>
      <button id="start-over-btn" type="button" onClick={onStartOver}>
        Start Over
      </button>
    </>
  );
}
