export function getCurrentQuestionNumber(): number | undefined {
  const params = new URLSearchParams(window.location.search);
  const currentQuestionNumber = params.get("questionNumber");
  if (!currentQuestionNumber) return;
  try {
    return parseInt(currentQuestionNumber);
  } catch (e) {
    return;
  }
}

export function getQuizType(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("quiz") || "default";
}

export function getInitialQuestionIndex(): number {
  if (getQuizType() !== "all") return 0;

  const currentQuestionNumber = getCurrentQuestionNumber();
  if (!currentQuestionNumber || currentQuestionNumber < 1) return 0;

  return currentQuestionNumber - 1;
}

export function updateSearchParamsFromQuestionIndex(currentIndex: number) {
  if (getQuizType() !== "all" || !getCurrentQuestionNumber()) return;

  const url = new URL(window.location.href);
  url.searchParams.set("questionNumber", `${currentIndex + 1}`);
  window.history.replaceState(null, "", url);
}
