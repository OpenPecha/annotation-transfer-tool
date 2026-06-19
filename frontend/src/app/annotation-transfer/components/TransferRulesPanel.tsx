import { Loader2, Plus, Trash2, Upload } from "lucide-react";

import type { AppLabels } from "@/app/annotation-transfer/i18n";
import type { TransferRule } from "@/lib/patterns";

interface TransferRulesPanelProps {
  labels: AppLabels;
  rules: TransferRule[];
  rulesFileName: string | null;
  rulesUploading: boolean;
  rulesError: string | null;
  rulesFileInputRef: React.RefObject<HTMLInputElement | null>;
  onRulesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddRule: () => void;
  onRemoveRule: (id: number) => void;
  onUpdateRule: (id: number, field: "type" | "regex", val: string) => void;
}

export function TransferRulesPanel({
  labels,
  rules,
  rulesFileName,
  rulesUploading,
  rulesError,
  rulesFileInputRef,
  onRulesUpload,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
}: TransferRulesPanelProps) {
  return (
    <aside className="w-60 shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      <div className="shrink-0 flex flex-col border-b border-border">
        <div className="min-h-10 flex items-center justify-between px-4 py-2 gap-1">
          <div className="min-w-0">
            <span className="text-xs mono tracking-widest text-muted-foreground uppercase block leading-tight">
              {labels.transferRules}
            </span>
            {rulesFileName && (
              <span className="text-[10px] mono text-accent truncate block leading-tight mt-0.5">
                {rulesFileName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <input
              ref={rulesFileInputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={onRulesUpload}
            />
            <button
              onClick={() => rulesFileInputRef.current?.click()}
              disabled={rulesUploading}
              title={labels.importRulesTitle}
              className="flex items-center gap-1 px-2 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {rulesUploading ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Upload size={11} />
              )}
              {labels.import}
            </button>
            <button
              onClick={onAddRule}
              className="flex items-center gap-1 px-2 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-xs transition-colors"
            >
              <Plus size={11} /> {labels.add}
            </button>
          </div>
        </div>
        {rulesError && (
          <div className="px-4 pb-2 text-[10px] text-destructive mono leading-snug">
            {rulesError}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-3 flex flex-col gap-2.5">
        {rules.map((rule, i) => (
          <div
            key={rule.id}
            className="border border-border bg-background p-3 flex flex-col gap-2"
          >
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mono shrink-0">
                #{String(i + 1).padStart(2, "0")}
              </span>
              <input
                type="text"
                placeholder={labels.typePlaceholder}
                value={rule.type}
                onChange={(e) => onUpdateRule(rule.id, "type", e.target.value)}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/25 outline-none mx-2"
              />
              <button
                onClick={() => onRemoveRule(rule.id)}
                disabled={rules.length === 1}
                className="text-muted-foreground hover:text-destructive disabled:opacity-20 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
            <textarea
              placeholder={labels.regexPlaceholder}
              value={rule.regex}
              onChange={(e) => onUpdateRule(rule.id, "regex", e.target.value)}
              rows={3}
              className="w-full bg-secondary text-xs text-foreground placeholder:text-muted-foreground/25 px-2.5 py-2 resize-none outline-none focus:ring-1 focus:ring-accent transition-shadow mono leading-relaxed"
            />
          </div>
        ))}
      </div>

      <div className="h-8 shrink-0 border-t border-border flex items-center px-4">
        <p className="text-xs text-muted-foreground mono">
          {rules.length}{" "}
          {rules.length === 1 ? labels.ruleSingular : labels.rulePlural}
        </p>
      </div>
    </aside>
  );
}
