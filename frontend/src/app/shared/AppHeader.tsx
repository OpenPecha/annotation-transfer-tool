import { ArrowLeft, Languages, RotateCcw } from "lucide-react";

import { OPENPECHA_LOGO } from "@/app/shared/brand";
import { ThemeToggle } from "@/app/shared/ThemeToggle";
import type { Theme } from "@/app/shared/hooks/useTheme";
import type { CommonLabels, UiLanguage } from "@/app/shared/i18n/common";

export const HOME_PATH = "/";

export interface HeaderLabels extends CommonLabels {
  appTitle: string;
  appSubtitle: string;
  resetTitle: string;
}

interface AppHeaderProps {
  labels: HeaderLabels;
  language: UiLanguage;
  theme: Theme;
  hasWork: boolean;
  resetDisabled?: boolean;
  showBack?: boolean;
  onReset: () => void;
  onToggleTheme: () => void;
  onLanguageChange: (language: UiLanguage) => void;
  toolbarExtra?: React.ReactNode;
}

export function AppHeader({
  labels,
  language,
  theme,
  hasWork,
  resetDisabled = false,
  showBack = true,
  onReset,
  onToggleTheme,
  onLanguageChange,
  toolbarExtra,
}: AppHeaderProps) {
  const nextLanguage: UiLanguage = language === "en" ? "bo" : "en";

  return (
    <header className="sticky top-0 z-50 h-14 shrink-0 border-b border-border px-5 flex items-center justify-between bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0">
        {showBack ? (
          <a
            href={HOME_PATH}
            title={labels.allTools}
            aria-label={labels.allTools}
            className="flex items-center justify-center h-8 w-8 shrink-0 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            <ArrowLeft size={14} />
          </a>
        ) : null}
        <a href={HOME_PATH} className="shrink-0" title={labels.home}>
          <img
            src={OPENPECHA_LOGO}
            alt="OpenPecha logo"
            className="h-9 w-9 rounded-xl object-cover shadow-[0_0_18px_rgba(34,211,238,0.35)] dark:shadow-[0_0_18px_rgba(34,207,224,0.25)]"
          />
        </a>
        <div className="flex flex-col leading-none min-w-0">
          <span className="text-[10px] tracking-[0.1em] uppercase text-foreground font-semibold mono leading-snug truncate">
            {labels.appTitle}
          </span>
          <span className="mt-1 text-[10px] tracking-[0.16em] uppercase text-accent mono truncate">
            {labels.appSubtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onReset}
          disabled={resetDisabled || !hasWork}
          title={labels.resetTitle}
          className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw size={11} /> {labels.reset}
        </button>
        {toolbarExtra}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} labels={labels} />
        <button
          type="button"
          onClick={() => onLanguageChange(nextLanguage)}
          title={`${labels.languageLabel}: ${
            language === "en" ? labels.english : labels.tibetan
          }`}
          className="h-8 flex items-center gap-1.5 px-2 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
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
