export interface AppSettings {
  autoContinue: boolean;
  autoContinueForWrongAnswers: boolean;
  confirmBeforeSubmitting: boolean;
}

export const defaultSettings: AppSettings = {
  autoContinue: true,
  autoContinueForWrongAnswers: false,
  confirmBeforeSubmitting: false,
};

export function loadSettings(): AppSettings {
  const stored = localStorage.getItem("quizSettings");
  if (stored) {
    return { ...defaultSettings, ...JSON.parse(stored) };
  }
  return { ...defaultSettings };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem("quizSettings", JSON.stringify(settings));
}