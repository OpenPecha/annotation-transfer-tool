import {
  useRef,
  useCallback,
  useState,
  useMemo,
  type KeyboardEvent,
} from 'react'
import { Check, ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  buildSegmentsFromRows,
  countEditedDiffs,
  formatDiffDisplay,
  getDiffProposedValue,
  isDiffEdited,
  resolveSegmentsPreview,
  type DiffSegment,
  type Segment,
} from '@/app/pydurma/utils/build-segments'
import type { AppLabels } from '@/app/pydurma/i18n'
import type { AlignmentRow, SelectionsMap, VariantSelection } from '@/app/pydurma/types/collation'
import { cn } from '@/lib/utils'

interface VariantResolverProps {
  labels: AppLabels
  rows: AlignmentRow[]
  selections: SelectionsMap
  suggestedVulgate: string
  onResolveDiff: (rowIndex: number, selection: VariantSelection) => void
}

type PillVariant = 'default' | 'edited'

const PILL_VARIANT_CLASSES: Record<PillVariant, string> = {
  default:
    'bg-muted border-border hover:bg-muted/80 text-foreground',
  edited:
    'bg-emerald-100 border-emerald-300 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:hover:bg-emerald-900 dark:text-emerald-200',
}

function getPillVariant(seg: DiffSegment): PillVariant {
  return isDiffEdited(seg) ? 'edited' : 'default'
}

function getWorkingAreaDisplayText(seg: DiffSegment): string {
  const value = getDiffProposedValue(seg)
  return value === '' ? '∅' : value
}

export function VariantResolver({
  labels,
  rows,
  selections,
  suggestedVulgate,
  onResolveDiff,
}: VariantResolverProps) {
  const segments = useMemo(
    () => buildSegmentsFromRows(rows, selections),
    [rows, selections]
  )
  const diffSegments = useMemo(
    () => segments.filter((seg): seg is DiffSegment => seg.type === 'diff'),
    [segments]
  )
  const editedCount = countEditedDiffs(segments)
  const previewText = resolveSegmentsPreview(segments)

  const pillRefs = useRef<Map<number, HTMLSpanElement>>(new Map())
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null)

  const focusDiff = useCallback((rowIndex: number) => {
    setTimeout(() => {
      pillRefs.current.get(rowIndex)?.focus()
    }, 50)
  }, [])

  const navigateBetweenDiffs = useCallback(
    (
      currentRowIndex: number,
      direction: 'prev' | 'next',
      options?: { keepOpen?: boolean }
    ) => {
      const rowIndices = diffSegments.map((seg) => seg.rowIndex)
      const currentIndex = rowIndices.indexOf(currentRowIndex)
      if (currentIndex === -1) return

      const targetIndex =
        direction === 'next'
          ? rowIndices[(currentIndex + 1) % rowIndices.length]
          : rowIndices[(currentIndex - 1 + rowIndices.length) % rowIndices.length]

      if (targetIndex === undefined) return

      setOpenRowIndex(options?.keepOpen ? targetIndex : null)

      setTimeout(() => {
        pillRefs.current.get(targetIndex)?.focus()
      }, 50)
    },
    [diffSegments]
  )

  const selectPreset = useCallback(
    (seg: DiffSegment, witnessName: string, options?: { keepOpen?: boolean }) => {
      onResolveDiff(seg.rowIndex, { kind: 'preset', witness_name: witnessName })
      if (options?.keepOpen) {
        setOpenRowIndex(seg.rowIndex)
      } else {
        setOpenRowIndex(null)
        focusDiff(seg.rowIndex)
      }
    },
    [onResolveDiff, focusDiff]
  )

  const handlePillKeyDown = useCallback(
    (e: KeyboardEvent<HTMLSpanElement>, seg: DiffSegment) => {
      const rowIndex = seg.rowIndex

      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        navigateBetweenDiffs(rowIndex, 'next')
        return
      }
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        navigateBetweenDiffs(rowIndex, 'prev')
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateBetweenDiffs(rowIndex, 'next')
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBetweenDiffs(rowIndex, 'prev')
        return
      }
    },
    [navigateBetweenDiffs]
  )

  const handleMenuKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, seg: DiffSegment) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateBetweenDiffs(seg.rowIndex, 'next', { keepOpen: true })
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBetweenDiffs(seg.rowIndex, 'prev', { keepOpen: true })
      }
    },
    [navigateBetweenDiffs]
  )

  if (diffSegments.length === 0) {
    return (
      <div className="flex flex-col min-h-0 flex-1 border border-border rounded bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium">{labels.collationResult}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-5 mono text-sm whitespace-pre-wrap break-all">
          {suggestedVulgate}
        </div>
        <p className="px-5 pb-4 text-xs text-muted-foreground">
          {labels.noVariants}
        </p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="edit" className="flex flex-col min-h-0 flex-1 border border-border rounded bg-card overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card/60 px-4 py-2">
        <TabsList className="h-auto flex-wrap bg-muted/80">
          <TabsTrigger value="edit" className="text-xs">
            {labels.edit}
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">
            {labels.preview}
          </TabsTrigger>
        </TabsList>

        <div className="shrink-0 text-xs font-semibold select-none">
          {editedCount > 0 ? (
            <span className="text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 dark:text-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              {editedCount} {labels.edited}
            </span>
          ) : (
            <span className="text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
              {diffSegments.length} {labels.variants}
            </span>
          )}
        </div>
      </div>

      <TabsContent
        value="edit"
        className="flex-1 flex flex-col min-h-0 m-0 border-none outline-none overflow-hidden data-[state=inactive]:hidden"
      >
        <div className="flex-1 overflow-auto p-5 select-text leading-relaxed text-foreground focus:outline-none mono text-sm whitespace-pre-wrap break-all">
          {segments.map((seg, idx) => renderSegment(seg, idx))}
        </div>
      </TabsContent>

      <TabsContent
        value="preview"
        className="flex-1 flex flex-col min-h-0 m-0 border-none outline-none overflow-hidden data-[state=inactive]:hidden"
      >
        <textarea
          readOnly
          value={previewText}
          className="flex-1 w-full resize-none bg-card p-5 text-foreground focus:outline-none border-none mono text-sm whitespace-pre-wrap break-all"
          placeholder={labels.previewPlaceholder}
        />
      </TabsContent>
    </Tabs>
  )

  function renderSegment(seg: Segment, idx: number) {
    if (seg.type === 'text') {
      return (
        <span key={`text-${idx}`} className="whitespace-pre-wrap">
          {seg.content}
        </span>
      )
    }

    const pillVariant = getPillVariant(seg)
    const displayText = getWorkingAreaDisplayText(seg)

    return (
      <DropdownMenu
        key={`diff-${seg.rowIndex}`}
        open={openRowIndex === seg.rowIndex}
        onOpenChange={(open) => setOpenRowIndex(open ? seg.rowIndex : null)}
      >
        <DropdownMenuTrigger asChild>
          <span
            role="button"
            tabIndex={0}
            ref={(el) => {
              if (el) pillRefs.current.set(seg.rowIndex, el)
              else pillRefs.current.delete(seg.rowIndex)
            }}
            onKeyDown={(e) => handlePillKeyDown(e, seg)}
            className={cn(
              'box-decoration-clone rounded-sm border px-0.5 py-0',
              'whitespace-pre-wrap cursor-pointer select-none',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              PILL_VARIANT_CLASSES[pillVariant]
            )}
            title={
              isDiffEdited(seg)
                ? `${labels.editedReading}: ${getDiffProposedValue(seg)}`
                : labels.chooseReading
            }
          >
            {displayText}
            <ChevronDown className="inline h-3 w-3 opacity-50 align-baseline ml-0.5" />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="start"
          className="min-w-[260px] max-w-[700px] max-h-96 overflow-y-auto shadow-lg p-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onKeyDown={(e) => handleMenuKeyDown(e, seg)}
        >
          {seg.options.map((option) => {
            const selectedName = seg.selection?.witness_name
            const isSelected =
              Boolean(selectedName) &&
              (option.witnessName === selectedName ||
                option.witnessNames.includes(selectedName ?? ''))

            return (
              <DropdownMenuItem
                key={`${option.label}-${option.token}`}
                onSelect={(e) => {
                  e.preventDefault()
                  selectPreset(seg, option.witnessName, { keepOpen: true })
                }}
                className="flex items-start justify-between gap-4 cursor-pointer py-2 px-3"
              >
                <span className="min-w-0 flex-1 text-left whitespace-pre-wrap break-words mono">
                  <span className="font-semibold">{option.label}</span>
                  {': '}
                  {formatDiffDisplay(option.token)}
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}
