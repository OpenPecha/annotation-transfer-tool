import { Plus, Trash2, Upload } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import type { AppLabels } from '@/app/pydurma/i18n'
import type { Language, OptionItem, WitnessDraft } from '@/app/pydurma/types/collation'
import { cn } from '@/lib/utils'

interface WitnessUploadPanelProps {
  labels: AppLabels
  languages: OptionItem[]
  collating: boolean
  error: string | null
  onSubmit: (
    witnesses: WitnessDraft[],
    language: Language,
    baseWitnessName: string | null
  ) => void
}

function newWitness(): WitnessDraft {
  return {
    id: crypto.randomUUID(),
    name: '',
    file: null,
  }
}

function getDuplicateNameIndexes(witnesses: WitnessDraft[]): Set<number> {
  const seen = new Map<string, number>()
  const duplicates = new Set<number>()

  witnesses.forEach((witness, index) => {
    const normalized = witness.name.trim().toLowerCase()
    if (!normalized) return

    const prior = seen.get(normalized)
    if (prior !== undefined) {
      duplicates.add(prior)
      duplicates.add(index)
    } else {
      seen.set(normalized, index)
    }
  })

  return duplicates
}

export function WitnessUploadPanel({
  labels,
  languages,
  collating,
  error,
  onSubmit,
}: WitnessUploadPanelProps) {
  const [witnesses, setWitnesses] = useState<WitnessDraft[]>([
    newWitness(),
    newWitness(),
  ])
  const [language, setLanguage] = useState<Language>('bo')
  const [baseWitnessIndex, setBaseWitnessIndex] = useState(0)

  const updateWitness = useCallback(
    (id: string, patch: Partial<WitnessDraft>) => {
      setWitnesses((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...patch } : w))
      )
    },
    []
  )

  const handleFileChange = useCallback((id: string, file: File | null) => {
    updateWitness(id, { file })
  }, [updateWitness])

  const handleNameChange = useCallback(
    (id: string, name: string) => {
      updateWitness(id, { name })
    },
    [updateWitness]
  )

  const addWitness = () => setWitnesses((prev) => [...prev, newWitness()])

  const removeWitness = (id: string) => {
    setWitnesses((prev) => {
      if (prev.length <= 2) return prev
      const removeIndex = prev.findIndex((w) => w.id === id)
      if (removeIndex === -1) return prev

      setBaseWitnessIndex((current) => {
        if (current === removeIndex) return 0
        if (current > removeIndex) return current - 1
        return current
      })

      return prev.filter((w) => w.id !== id)
    })
  }

  const duplicateIndexes = useMemo(
    () => getDuplicateNameIndexes(witnesses),
    [witnesses]
  )

  const hasUniqueNames =
    witnesses.every((w) => w.name.trim()) && duplicateIndexes.size === 0

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const baseWitnessName =
      witnesses[baseWitnessIndex]?.name.trim() || null
    onSubmit(witnesses, language, baseWitnessName)
  }

  const canSubmit =
    witnesses.length >= 2 &&
    witnesses.every((w) => w.name.trim() && w.file) &&
    hasUniqueNames &&
    !collating

  const baseWitnessName = witnesses[baseWitnessIndex]?.name.trim() ?? ''
  const baseWitnessMissingName = !baseWitnessName
  const baseWitnessDuplicate = duplicateIndexes.has(baseWitnessIndex)

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card/60 flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-medium">{labels.witnesses}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {labels.witnessesHint}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {witnesses.map((witness, index) => {
            const trimmedName = witness.name.trim()
            const missingName = !trimmedName
            const isDuplicate = duplicateIndexes.has(index)

            return (
            <div
              key={witness.id}
              className="rounded border border-border bg-background p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {trimmedName || labels.addWitnessName}
                </span>
                {witnesses.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeWitness(witness.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove witness"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder={labels.addWitnessName}
                value={witness.name}
                onChange={(e) => handleNameChange(witness.id, e.target.value)}
                aria-invalid={missingName || isDuplicate}
                className={cn(
                  'w-full rounded border bg-input-background px-2 py-1.5 text-sm',
                  missingName || isDuplicate
                    ? 'border-destructive/60'
                    : 'border-border'
                )}
              />
              {missingName && (
                <p className="text-xs text-muted-foreground">{labels.addWitnessName}</p>
              )}
              {isDuplicate && (
                <p className="text-xs text-destructive">{labels.duplicateWitnessName}</p>
              )}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                <Upload size={14} />
                <span className="truncate">
                  {witness.file?.name ?? labels.chooseFile}
                </span>
                <input
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(witness.id, e.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>
            )
          })}

          <button
            type="button"
            onClick={addWitness}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            <Plus size={14} /> {labels.addWitness}
          </button>
        </div>

        <div className="shrink-0 px-4 py-3 border-t border-border space-y-3 bg-card/60">
          <div className="space-y-2">
            <label className="block text-xs font-medium">{labels.collationLanguage}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full rounded border border-border bg-input-background px-2 py-1.5 text-sm"
            >
              {languages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium">{labels.baseWitness}</label>
            <select
              value={baseWitnessIndex}
              onChange={(e) => setBaseWitnessIndex(Number(e.target.value))}
              className={cn(
                'w-full rounded border bg-input-background px-2 py-1.5 text-sm',
                baseWitnessMissingName || baseWitnessDuplicate
                  ? 'border-destructive/60'
                  : 'border-border'
              )}
            >
              {witnesses.map((w, index) => (
                <option key={w.id} value={index}>
                  {w.name.trim() || labels.addWitnessName}
                </option>
              ))}
            </select>
            {baseWitnessMissingName && (
              <p className="text-xs text-muted-foreground">{labels.addWitnessName}</p>
            )}
            {baseWitnessDuplicate && (
              <p className="text-xs text-destructive">{labels.duplicateWitnessName}</p>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'w-full py-2 text-sm font-medium rounded transition-colors',
              canSubmit
                ? 'bg-accent text-accent-foreground hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {collating ? labels.runningCollation : labels.runCollation}
          </button>
        </div>
      </form>
    </aside>
  )
}
