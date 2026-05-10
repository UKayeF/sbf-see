import { useEffect } from "preact/hooks";
import { AppSettings, loadSettings } from "../utils/settings";

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const settings = loadSettings();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = settings.theme === "light" ? "dark" : "light";
    const newSettings: AppSettings = { ...settings, theme: newTheme };
    localStorage.setItem("quizSettings", JSON.stringify(newSettings));
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div class="header">
      <button id="theme-toggle-btn" type="button" onClick={toggleTheme}>
        {settings.theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>
      <button id="settings-btn" type="button" onClick={onOpenSettings}>
        Settings
      </button>
    </div>
  );
}
