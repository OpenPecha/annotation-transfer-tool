import { Moon, Sun } from "lucide-react";

import type { Theme } from "@/app/shared/hooks/useTheme";
import type { CommonLabels } from "@/app/shared/i18n/common";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  labels: CommonLabels;
}

export function ThemeToggle({ theme, onToggle, labels }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-center h-8 w-8 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
      aria-label={theme === "light" ? labels.darkMode : labels.lightMode}
      title={theme === "light" ? labels.darkMode : labels.lightMode}
    >
      {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
}
