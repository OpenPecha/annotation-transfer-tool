import { Columns2, Languages, Moon, RotateCcw, Rows2, Sun } from "lucide-react";

import type { AppLabels } from "@/app/i18n";
import type { PanelLayout } from "@/app/types";
import type { Language } from "@/app/types";

const LOGO_URL = "/logo.png";

interface AppHeaderProps {
  dark: boolean;
  panelLayout: PanelLayout;
  language: Language;
  labels: AppLabels;
  transferring: boolean;
  hasWork: boolean;
  onReset: () => void;
  onToggleDark: () => void;
  onToggleLayout: () => void;
  onLanguageChange: (language: Language) => void;
}

export function AppHeader({
  dark,
  panelLayout,
  language,
  labels,
  transferring,
  hasWork,
  onReset,
  onToggleDark,
  onToggleLayout,
  onLanguageChange,
}: AppHeaderProps) {
  const nextLanguage: Language = language === "en" ? "bo" : "en";

  return (
    <header className="h-14 shrink-0 border-b border-border px-5 flex items-center justify-between bg-card/95">
      <div className="flex items-center gap-3">
        <img
          src={LOGO_URL}
          alt="Webuddhist logo"
          className="h-9 w-9 rounded-xl shadow-[0_0_18px_rgba(34,211,238,0.35)]"
        />
        <div className="flex flex-col leading-none">
          <span className="text-[10px] tracking-[0.1em] uppercase text-foreground font-semibold mono leading-snug">
            {labels.appTitle}
          </span>
          <span className="mt-1 text-[10px] tracking-[0.16em] uppercase text-accent mono">
            Webuddhist
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          disabled={transferring || !hasWork}
          title={labels.resetTitle}
          className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw size={11} /> {labels.reset}
        </button>
        <button
          onClick={onToggleLayout}
          title={
            panelLayout === "vertical"
              ? labels.switchToSideBySide
              : labels.switchToStacked
          }
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {panelLayout === "vertical" ? (
            <Columns2 size={13} />
          ) : (
            <Rows2 size={13} />
          )}
        </button>
        <button
          onClick={onToggleDark}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {dark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <button
          onClick={() => onLanguageChange(nextLanguage)}
          title={`${labels.languageLabel}: ${
            language === "en" ? labels.english : labels.tibetan
          }`}
          className="h-7 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Languages size={13} />
          <span className="text-[10px] mono leading-none">
            {language === "en" ? "EN" : "བོད"}
          </span>
        </button>
      </div>
    </header>
  );
}
