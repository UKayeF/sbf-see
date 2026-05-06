interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <div class="header">
      <button id="settings-btn" type="button" onClick={onOpenSettings}>
        Settings
      </button>
    </div>
  );
}
