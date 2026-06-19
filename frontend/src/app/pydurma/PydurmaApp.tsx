import { useCallback, useMemo, useState } from "react";

import { ExportPanel } from "@/app/pydurma/components/ExportPanel";
import { VariantResolver } from "@/app/pydurma/components/VariantResolver";
import { WitnessUploadPanel } from "@/app/pydurma/components/WitnessUploadPanel";
import { useCollation } from "@/app/pydurma/hooks/useCollation";
import { useExport } from "@/app/pydurma/hooks/useExport";
import { useOptions } from "@/app/pydurma/hooks/useOptions";
import { useSelections } from "@/app/pydurma/hooks/useSelections";
import { translations } from "@/app/pydurma/i18n";
import type { OutputFormat } from "@/app/pydurma/types/collation";
import { AppHeader } from "@/app/shared/AppHeader";
import { useUiLanguage } from "@/app/shared/hooks/useUiLanguage";

export function PydurmaApp() {
  const {
    collating,
    error: collationError,
    result,
    collate,
    reset,
    setError,
  } = useCollation();

  const [format, setFormat] = useState<OutputFormat>("txt");
  const [uploadPanelKey, setUploadPanelKey] = useState(0);
  const { language, setLanguage } = useUiLanguage();
  const labels = translations[language];

  const {
    selections,
    editedCount,
    variantRows,
    resolveDiff,
    clearDraft,
  } = useSelections(result?.job_id ?? null, result?.rows ?? []);

  const { download, exporting, error: exportError } = useExport();
  const { languages, exportFormats } = useOptions();

  const handleCollate = useCallback(
    async (...args: Parameters<typeof collate>) => {
      try {
        await collate(...args);
      } catch {
        // error surfaced via hook
      }
    },
    [collate],
  );

  const handleReset = useCallback(() => {
    if (result?.job_id) clearDraft();
    reset();
    setError(null);
    setUploadPanelKey((key) => key + 1);
  }, [result?.job_id, clearDraft, reset, setError]);

  const handleExport = useCallback(async () => {
    if (!result) return;
    await download(result.job_id, format, selections);
  }, [result, download, format, selections]);

  const languageOptions = useMemo(() => {
    const labelById: Record<string, string> = {
      bo: labels.collationLanguageTibetan,
      generic: labels.collationLanguageEnglish,
    };
    return languages.map((item) => ({
      ...item,
      label: labelById[item.id] ?? item.label,
    }));
  }, [languages, labels]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <AppHeader
        labels={labels}
        language={language}
        hasWork={Boolean(result)}
        onLanguageChange={setLanguage}
        onReset={handleReset}
      />

      <div className="flex flex-1 min-h-0">
        <WitnessUploadPanel
          key={uploadPanelKey}
          labels={labels}
          languages={languageOptions}
          collating={collating}
          error={collationError}
          onSubmit={handleCollate}
        />

        <main className="flex-1 min-w-0 flex flex-col p-4 gap-4 overflow-hidden">
          {!result ? (
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="max-w-md text-center space-y-2">
                <p className="text-base font-semibold text-foreground leading-snug">
                  {labels.welcomeTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  {labels.welcomeHint}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 min-h-0 gap-4">
              <div className="flex-1 min-w-0 flex flex-col min-h-0">
                <VariantResolver
                  labels={labels}
                  rows={result.rows}
                  selections={selections}
                  suggestedVulgate={result.suggested_vulgate}
                  onResolveDiff={resolveDiff}
                />
              </div>
              <div className="w-80 shrink-0 flex flex-col min-h-0 gap-4">
                <ExportPanel
                  labels={labels}
                  formats={exportFormats}
                  format={format}
                  onFormatChange={setFormat}
                  editedCount={editedCount}
                  variantCount={variantRows.length}
                  exporting={exporting}
                  error={exportError}
                  onExport={handleExport}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
