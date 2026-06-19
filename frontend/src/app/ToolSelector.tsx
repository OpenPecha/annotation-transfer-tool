import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { selectorLabels } from "@/app/shared/i18n/selector";
import { OPENPECHA_LOGO } from "@/app/shared/brand";
import { ThemeToggle } from "@/app/shared/ThemeToggle";
import { useTheme } from "@/app/shared/hooks/useTheme";
import { useUiLanguage } from "@/app/shared/hooks/useUiLanguage";
import { commonLabels } from "@/app/shared/i18n/common";

const TOOLS = [
  {
    id: "annotation-transfer",
    path: "/annotation-transfer",
    titleKey: "annotationTitle" as const,
    descriptionKey: "annotationDescription" as const,
  },
  {
    id: "pydurma",
    path: "/pydurma",
    titleKey: "pydurmaTitle" as const,
    descriptionKey: "pydurmaDescription" as const,
  },
];

export function ToolSelector() {
  const { language, setLanguage } = useUiLanguage();
  const { theme, toggleTheme } = useTheme();
  const labels = selectorLabels[language];
  const chrome = commonLabels[language];

  const nextLanguage = language === "en" ? "bo" : "en";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="h-14 shrink-0 border-b border-border px-5 flex items-center justify-between bg-card/95">
        <div className="flex items-center gap-3">
          <img
            src={OPENPECHA_LOGO}
            alt="OpenPecha logo"
            className="h-9 w-9 rounded-xl object-cover shadow-[0_0_18px_rgba(34,211,238,0.35)]"
          />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] tracking-[0.1em] uppercase text-foreground font-semibold mono">
              {labels.platformTitle}
            </span>
            <span className="mt-1 text-[10px] tracking-[0.16em] uppercase text-accent mono">
              {chrome.brandSubtitle}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} labels={chrome} />
          <button
            type="button"
            onClick={() => setLanguage(nextLanguage)}
            className="h-8 px-2 rounded border border-border text-[10px] mono text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            {language === "en" ? "EN / བོད" : "བོད / EN"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">
              {labels.platformSubtitle}
            </h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                className="group border border-border bg-card p-5 flex flex-col gap-3 hover:border-accent/60 hover:shadow-[0_0_24px_rgba(34,207,224,0.12)] transition-all"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide mono text-foreground">
                  {labels[tool.titleKey]}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {labels[tool.descriptionKey]}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs text-accent mono">
                  {labels.openTool}
                  <ArrowRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
