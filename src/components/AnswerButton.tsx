import { Answer } from "../models/questions";

interface AnswerButtonProps {
  answer: Answer;
  index: number;
  isSelected: boolean;
  showFeedback: boolean;
  onSelect: (index: number) => void;
}

export function AnswerButton({
  answer,
  index,
  isSelected,
  showFeedback,
  onSelect,
}: AnswerButtonProps) {
  const classes = ["answer-btn"];

  if (showFeedback) {
    if (answer.isCorrect) {
      classes.push("correct");
    } else if (isSelected) {
      classes.push("incorrect");
    }
  } else if (isSelected) {
    classes.push("selected");
  }

  return (
    <button
      class={classes.join(" ")}
      data-index={index}
      disabled={showFeedback}
      type="button"
      onClick={() => onSelect(index)}
    >
      <span class="answer-text">{answer.text}</span>
      {answer.images?.map((image) => (
        <img class="answer-image" src={image} alt="Answer image" />
      ))}
    </button>
  );
}
