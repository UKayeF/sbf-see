import { QuizConfig } from "../models/quizConfig";
import { QuizState } from "../state/quizState";
import { getCategoryQuestionIndex } from "../utils/quizProgress";
import { AnswerButton } from "./AnswerButton";

interface QuestionViewProps {
  config: QuizConfig;
  state: QuizState;
  showFeedback: boolean;
  selectedIndex: number | null;
  confirmBeforeSubmitting: boolean;
  onAnswerSelect: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
}

export function QuestionView({
  config,
  state,
  showFeedback,
  selectedIndex,
  confirmBeforeSubmitting,
  onAnswerSelect,
  onSubmit,
  onNext,
}: QuestionViewProps) {
  const question = state.questions[state.currentQuestionIndex];
  const categoryIndex = getCategoryQuestionIndex(
    config,
    state,
    state.currentQuestionIndex,
  );
  const categoryConfig = config.categories[state.currentCategory] || {
    questionsCount: state.questions.length,
    passingThreshold: 0,
  };

  return (
    <>
      <h2>
        {state.currentCategory} ({categoryIndex + 1}/
        {categoryConfig.questionsCount})
      </h2>
      <p class="question">{question.question}</p>

      {question.images?.map((image) => (
        <img class="question-image" src={image} alt="Question image" />
      ))}

      <div class="answers">
        {question.answers.map((answer, index) => (
          <AnswerButton
            answer={answer}
            index={index}
            isSelected={selectedIndex === index}
            showFeedback={showFeedback}
            onSelect={onAnswerSelect}
          />
        ))}
      </div>

      {question.needsFix && (
        <p class="needsfix">Image assignment needs to be reviewed</p>
      )}

      {confirmBeforeSubmitting && !showFeedback && (
        <button
          id="submit-btn"
          type="button"
          disabled={selectedIndex === null}
          onClick={onSubmit}
        >
          Submit
        </button>
      )}

      {showFeedback && (
        <button id="next-btn" type="button" onClick={onNext}>
          Next
        </button>
      )}
    </>
  );
}
