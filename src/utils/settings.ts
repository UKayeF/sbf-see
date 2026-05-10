export interface AppSettings {
  autoContinue: boolean;
  autoContinueForWrongAnswers: boolean;
  confirmBeforeSubmitting: boolean;
  theme: "light" | "dark";
}

export const defaultSettings: AppSettings = {
  autoContinue: true,
  autoContinueForWrongAnswers: false,
  confirmBeforeSubmitting: false,
  theme: "light",
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

export function applyTheme(theme: "light" | "dark"): void {
  document.documentElement.setAttribute("data-theme", theme);
}