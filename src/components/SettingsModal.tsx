import { useState } from "preact/hooks";
import { AppSettings } from "../utils/settings";

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export function SettingsModal({
  settings,
  onSave,
  onClose,
}: SettingsModalProps) {
  const [draftSettings, setDraftSettings] = useState(settings);

  return (
    <div id="settings-modal" class="modal" style={{ display: "flex" }}>
      <div class="modal-content">
        <h2>Settings</h2>
        <label>
          <input
            type="checkbox"
            id="auto-continue"
            checked={draftSettings.autoContinue}
            onChange={(event) =>
              setDraftSettings({
                ...draftSettings,
                autoContinue: event.currentTarget.checked,
              })
            }
          />
          Auto continue after selection (0.5s delay)
        </label>
        <label>
          <input
            type="checkbox"
            id="auto-continue-wrong-answers"
            checked={draftSettings.autoContinueForWrongAnswers}
            onChange={(event) =>
              setDraftSettings({
                ...draftSettings,
                autoContinueForWrongAnswers: event.currentTarget.checked,
              })
            }
          />
          Auto continue even for wrong answers
        </label>
        <label>
          <input
            type="checkbox"
            id="confirm-before-submitting"
            checked={draftSettings.confirmBeforeSubmitting}
            onChange={(event) =>
              setDraftSettings({
                ...draftSettings,
                confirmBeforeSubmitting: event.currentTarget.checked,
              })
            }
          />
          Confirm before submitting
        </label>
        <button
          id="save-settings"
          type="button"
          onClick={() => onSave(draftSettings)}
        >
          Save
        </button>
        <button id="close-settings" type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
