import { useEffect, useMemo, useState } from "preact/hooks";
import { Header } from "./components/Header";
import { MainMenu } from "./components/MainMenu";
import { QuestionView } from "./components/QuestionView";
import { ResultsView } from "./components/ResultsView";
import { SettingsModal } from "./components/SettingsModal";
import { getConfig } from "./services/quizConfig";
import { initQuiz, QuizMode } from "./services/quizInit";
import { QuizState } from "./state/quizState";
import fragenData from "./data/fragen.json";
import { QuestionsJson } from "./models/questions";
import { getCategoryForQuestion } from "./utils/quizProgress";
import {
  loadQuestionHistory,
  recordQuestionAnswer,
  resetQuestionHistory,
} from "./utils/questionHistory";
import { loadSettings, saveSettings } from "./utils/settings";
import { getInitialQuestionIndex, updateSearchParamsFromQuestionIndex } from "./utils/urlParams";

function createInitialState(config: ReturnType<typeof getConfig>, mode: QuizMode): QuizState {
  const initialState = initQuiz(config, mode);
  const initialQuestionIndex = Math.min(
    mode === "random" ? getInitialQuestionIndex() : 0,
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

function getTotalQuestionCount() {
  return Object.values((fragenData as QuestionsJson).categories).reduce(
    (total, questions) => total + questions.length,
    0,
  );
}

export function App() {
  const config = useMemo(() => getConfig(), []);
  const totalQuestions = useMemo(() => getTotalQuestionCount(), []);
  const [activeMode, setActiveMode] = useState<QuizMode | null>(null);
  const [state, setState] = useState<QuizState | null>(null);
  const [history, setHistory] = useState(() => loadQuestionHistory());
  const [settings, setSettings] = useState(() => loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const isFinished = state ? state.currentQuestionIndex >= state.questions.length : false;

  function startQuiz(mode: QuizMode) {
    updateSearchParamsFromQuestionIndex(0);
    setActiveMode(mode);
    setPendingIndex(null);
    setState(createInitialState(config, mode));
  }

  function nextQuestion() {
    setPendingIndex(null);
    setState((currentState) => {
      if (!currentState) return currentState;
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
      if (!currentState) return currentState;
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
            questionNumber: question.number,
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

    const question = state?.questions[state.currentQuestionIndex];
    if (question) {
      const isCorrect = question.answers[selectedIndex].isCorrect;
      recordQuestionAnswer(question.number, isCorrect);
      setHistory(loadQuestionHistory());
    }
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
    setState((currentState) => (currentState ? resetCurrentQuiz(currentState) : currentState));
  }

  function retryWrongAnswers() {
    setPendingIndex(null);
    setState((currentState) => {
      if (!currentState) return currentState;
      const wrongAnswers = currentState.answers.filter((a) => !a.correct);
      const wrongQuestionNumbers = wrongAnswers.map((a) => a.questionNumber);
      const filteredQuestions = currentState.questions.filter((question) =>
        wrongQuestionNumbers.includes(question.number),
      );
      const filteredQuestionCategories = currentState.questionCategories.filter((_, idx) =>
        wrongQuestionNumbers.includes(currentState.questions[idx].number),
      );

      const categoryScores = Object.fromEntries(
        [...new Set(filteredQuestionCategories)].map((category) => [category, 0]),
      );

      return {
        ...currentState,
        questions: filteredQuestions,
        questionCategories: filteredQuestionCategories,
        currentCategory: filteredQuestionCategories[0] || currentState.currentCategory,
        currentQuestionIndex: 0,
        answers: [],
        categoryScores,
        showFeedback: false,
        lastSelectedIndex: -1,
      };
    });
  }

  function startOver() {
    updateSearchParamsFromQuestionIndex(0);
    setActiveMode(null);
    setPendingIndex(null);
    setState(null);
  }

  function handleResetHistory() {
    resetQuestionHistory();
    setHistory({});
    if (activeMode) {
      setState(createInitialState(config, activeMode));
    }
  }

  useEffect(() => {
    if (!state) return;
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
    state?.showFeedback,
    state?.currentQuestionIndex,
    state?.answers.length,
    settings.autoContinue,
    settings.autoContinueForWrongAnswers,
  ]);

  return (
    <>
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      {!state || !activeMode ? (
        <MainMenu
          history={history}
          totalQuestions={totalQuestions}
          onStartQuiz={startQuiz}
          onResetHistory={handleResetHistory}
        />
      ) : isFinished ? (
        <ResultsView
          config={config}
          state={state}
          mode={activeMode}
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
          onBackToMenu={startOver}
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
