import { QuizMode } from "../services/quizInit";
import { getHistorySummary, QuestionHistory } from "../utils/questionHistory";

interface MainMenuProps {
  history: QuestionHistory;
  totalQuestions: number;
  onStartQuiz: (mode: QuizMode) => void;
  onResetHistory: () => void;
}

export function MainMenu({
  history,
  totalQuestions,
  onStartQuiz,
  onResetHistory,
}: MainMenuProps) {
  const summary = getHistorySummary(history);
  const newQuestions = Math.max(totalQuestions - summary.trackedQuestions, 0);
  const hardPoolSize = newQuestions + summary.strugglingQuestions;

  return (
    <main class="main-menu">
      <h1>SBF See Quiz</h1>
      <p class="menu-intro">Choose how you want to practice today.</p>

      <div class="menu-options">
        <button type="button" class="menu-option" onClick={() => onStartQuiz("random")}>
          <span class="menu-option-title">Random Quiz</span>
          <span class="menu-option-text">The regular mixed quiz.</span>
        </button>
        <button type="button" class="menu-option" onClick={() => onStartQuiz("smart")}>
          <span class="menu-option-title">Smart Quiz</span>
          <span class="menu-option-text">Like random, with more weight on missed questions.</span>
        </button>
        <button type="button" class="menu-option" onClick={() => onStartQuiz("hard")}>
          <span class="menu-option-title">Hard Questions</span>
          <span class="menu-option-text">{hardPoolSize} questions in your practice pool.</span>
        </button>
      </div>

      <div class="history-panel">
        <div>
          <strong>{summary.trackedQuestions}</strong> questions tracked
        </div>
        <div>
          <strong>{hardPoolSize}</strong> questions need practice
        </div>
        <button
          type="button"
          class="reset-history-btn"
          disabled={summary.trackedQuestions === 0}
          onClick={onResetHistory}
        >
          Reset My Data
        </button>
      </div>
    </main>
  );
}
