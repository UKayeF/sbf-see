import { useEffect, useMemo, useState } from "preact/hooks";
import { Header } from "./components/Header";
import { QuestionView } from "./components/QuestionView";
import { ResultsView } from "./components/ResultsView";
import { SettingsModal } from "./components/SettingsModal";
import { getConfig } from "./services/quizConfig";
import { initQuiz } from "./services/quizInit";
import { QuizState } from "./state/quizState";
import { getCategoryForQuestion } from "./utils/quizProgress";
import { loadSettings, saveSettings } from "./utils/settings";
import { getInitialQuestionIndex, updateSearchParamsFromQuestionIndex } from "./utils/urlParams";

function createInitialState(config: ReturnType<typeof getConfig>): QuizState {
  const initialState = initQuiz(config);
  const initialQuestionIndex = Math.min(
    getInitialQuestionIndex(),
    initialState.questions.length,
  );

  return {
    ...initialState,
    currentCategory:
      initialQuestionIndex < initialState.questions.length
        ? getCategoryForQuestion(config, initialState, initialQuestionIndex)
        : initialState.currentCategory,
    currentQuestionIndex: initialQuestionIndex,
  };
}

function resetCurrentQuiz(state: QuizState): QuizState {
  const categoryScores = Object.fromEntries(
    Object.keys(state.categoryScores).map((category) => [category, 0]),
  );

  return {
    ...state,
    currentCategory: Object.keys(categoryScores)[0] || state.currentCategory,
    currentQuestionIndex: 0,
    answers: [],
    categoryScores,
    showFeedback: false,
    lastSelectedIndex: -1,
  };
}

export function App() {
  const config = useMemo(() => getConfig(), []);
  const [state, setState] = useState<QuizState>(() => createInitialState(config));
  const [settings, setSettings] = useState(() => loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const isFinished = state.currentQuestionIndex >= state.questions.length;

  function nextQuestion() {
    setPendingIndex(null);
    setState((currentState) => {
      const nextIndex = currentState.currentQuestionIndex + 1;
      updateSearchParamsFromQuestionIndex(nextIndex);

      return {
        ...currentState,
        currentQuestionIndex: nextIndex,
        currentCategory:
          nextIndex < currentState.questions.length
            ? getCategoryForQuestion(config, currentState, nextIndex)
            : currentState.currentCategory,
        showFeedback: false,
        lastSelectedIndex: -1,
      };
    });
  }

  function submitAnswer(selectedIndex: number) {
    setPendingIndex(null);
    setState((currentState) => {
      const question = currentState.questions[currentState.currentQuestionIndex];
      const isCorrect = question.answers[selectedIndex].isCorrect;
      const currentCategory = getCategoryForQuestion(
        config,
        currentState,
        currentState.currentQuestionIndex,
      );

      return {
        ...currentState,
        answers: [
          ...currentState.answers,
          {
            questionIndex: currentState.currentQuestionIndex,
            question: question.question,
            images: question.images,
            answers: question.answers.map((a) => ({ text: a.text, isCorrect: a.isCorrect, images: a.images })),
            selected: selectedIndex,
            correct: isCorrect,
          },
        ],
        categoryScores: {
          ...currentState.categoryScores,
          [currentCategory]:
            (currentState.categoryScores[currentCategory] || 0) +
            (isCorrect ? 1 : 0),
        },
        showFeedback: true,
        lastSelectedIndex: selectedIndex,
      };
    });
  }

  function handleAnswerSelect(selectedIndex: number) {
    if (settings.confirmBeforeSubmitting) {
      setPendingIndex(selectedIndex);
      return;
    }

    submitAnswer(selectedIndex);
  }

  function handleSubmitPendingAnswer() {
    if (pendingIndex === null) return;
    submitAnswer(pendingIndex);
  }

  function handleSaveSettings(nextSettings: typeof settings) {
    saveSettings(nextSettings);
    setSettings(nextSettings);
    setIsSettingsOpen(false);
    setPendingIndex(null);
  }

  function restartQuiz() {
    updateSearchParamsFromQuestionIndex(0);
    setPendingIndex(null);
    setState((currentState) => resetCurrentQuiz(currentState));
  }

  function retryWrongAnswers() {
    setPendingIndex(null);
    setState((currentState) => {
      const wrongAnswers = currentState.answers.filter((a) => !a.correct);
      const wrongQuestionIndices = wrongAnswers.map((a) => a.questionIndex);
      const filteredQuestions = currentState.questions.filter((_, idx) =>
        wrongQuestionIndices.includes(idx),
      );

      const categoryScores = Object.fromEntries(
        Object.keys(currentState.categoryScores).map((category) => [category, 0]),
      );

      return {
        ...currentState,
        questions: filteredQuestions,
        currentCategory: Object.keys(categoryScores)[0] || currentState.currentCategory,
        currentQuestionIndex: 0,
        answers: [],
        categoryScores,
        showFeedback: false,
        lastSelectedIndex: -1,
      };
    });
  }

  function startOver() {
    location.reload();
  }

  useEffect(() => {
    if (!state.showFeedback || !settings.autoContinue) return;

    const lastAnswer = state.answers[state.answers.length - 1];
    const shouldAutoContinue = lastAnswer?.correct || settings.autoContinueForWrongAnswers;

    if (!shouldAutoContinue) return;

    const timeoutId = window.setTimeout(() => {
      if (state.currentQuestionIndex < state.questions.length) {
        nextQuestion();
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [
    state.showFeedback,
    state.currentQuestionIndex,
    state.answers.length,
    settings.autoContinue,
    settings.autoContinueForWrongAnswers,
  ]);

  return (
    <>
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      {isFinished ? (
        <ResultsView
          config={config}
          state={state}
          onRestart={restartQuiz}
          onRetryWrong={retryWrongAnswers}
          onStartOver={startOver}
        />
      ) : (
        <QuestionView
          config={config}
          state={state}
          showFeedback={state.showFeedback}
          selectedIndex={state.showFeedback ? state.lastSelectedIndex : pendingIndex}
          confirmBeforeSubmitting={settings.confirmBeforeSubmitting}
          onAnswerSelect={handleAnswerSelect}
          onSubmit={handleSubmitPendingAnswer}
          onNext={nextQuestion}
        />
      )}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}
