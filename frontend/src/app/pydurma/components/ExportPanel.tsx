import type { AppLabels } from '@/app/pydurma/i18n'
import type { OptionItem, OutputFormat } from '@/app/pydurma/types/collation'
import { cn } from '@/lib/utils'

interface ExportPanelProps {
  labels: AppLabels
  formats: OptionItem[]
  format: OutputFormat
  onFormatChange: (format: OutputFormat) => void
  editedCount: number
  variantCount: number
  exporting: boolean
  error: string | null
  onExport: () => void
}

export function ExportPanel({
  labels,
  formats,
  format,
  onFormatChange,
  editedCount,
  variantCount,
  exporting,
  error,
  onExport,
}: ExportPanelProps) {
  return (
    <div className="rounded border border-border bg-card shrink-0">
      <div className="p-4 space-y-4">
        <div>
          <h2 className="text-sm font-medium">{labels.export}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {labels.exportHint}
          </p>
        </div>

        {variantCount > editedCount && (
          <p className="text-xs text-muted-foreground border border-border rounded px-3 py-2">
            {editedCount > 0
              ? `${editedCount} ${labels.edited} — ${labels.exportPartialHint}`
              : labels.exportPartialHint}
          </p>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-medium">{labels.format}</label>
          <select
            value={format}
            disabled={exporting}
            onChange={(e) => onFormatChange(e.target.value as OutputFormat)}
            className="w-full rounded border border-border bg-input-background px-2 py-1.5 text-sm"
          >
            {formats.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className={cn(
            'w-full py-2 text-sm font-medium rounded transition-colors',
            !exporting
              ? 'bg-accent text-accent-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {exporting ? labels.preparingDownload : labels.download}
        </button>
      </div>
    </div>
  )
}
