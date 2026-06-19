import type {
  AlignmentRow,
  RowSelectionState,
  SelectionsMap,
} from '@/app/pydurma/types/collation'
import { formatWitnessGroupLabel } from '@/app/pydurma/utils/witness-initials'

export type TextSegment = { type: 'text'; content: string }

export type DiffPresetOption = {
  token: string
  /** Representative witness for this reading (any witness sharing the token). */
  witnessName: string
  /** Witness names that share this token, in column order. */
  witnessNames: string[]
  /** Comma-separated two-character initials, e.g. "DE, NA". */
  label: string
}

export type DiffSegment = {
  type: 'diff'
  rowIndex: number
  options: DiffPresetOption[]
  suggestedToken: string
  confirmed: boolean
  selection: RowSelectionState['selection'] | null
}

export type Segment = TextSegment | DiffSegment

function buildPresetOptions(row: AlignmentRow): DiffPresetOption[] {
  const tokenToWitnesses = new Map<string, string[]>()

  for (const cell of row.cells) {
    const token = cell.token
    if (!token) continue
    const names = tokenToWitnesses.get(token) ?? []
    names.push(cell.name)
    tokenToWitnesses.set(token, names)
  }

  return Array.from(tokenToWitnesses.entries()).map(([token, witnessNames]) => ({
    token,
    witnessName: witnessNames[0],
    witnessNames,
    label: formatWitnessGroupLabel(witnessNames),
  }))
}

export function buildDiffSegment(
  row: AlignmentRow,
  state: RowSelectionState | undefined
): DiffSegment {
  return {
    type: 'diff',
    rowIndex: row.index,
    options: buildPresetOptions(row),
    suggestedToken: row.suggested_token,
    confirmed: state?.confirmed ?? false,
    selection: state?.selection ?? null,
  }
}

export function buildSegmentsFromRows(
  rows: AlignmentRow[],
  selections: SelectionsMap
): Segment[] {
  return rows.map((row) => {
    if (!row.is_variant) {
      return { type: 'text', content: row.suggested_token }
    }
    return buildDiffSegment(row, selections[String(row.index)])
  })
}

export function getDiffProposedValue(seg: DiffSegment): string {
  if (!seg.confirmed || !seg.selection?.witness_name) return seg.suggestedToken
  const match = seg.options.find(
    (o) =>
      o.witnessName === seg.selection!.witness_name ||
      o.witnessNames.includes(seg.selection!.witness_name)
  )
  return match?.token ?? seg.suggestedToken
}

export function formatDiffDisplay(text: string): string {
  if (text === '') return '∅'
  return text.replace(/\n/g, ' ↵ ')
}

export function isDiffEdited(seg: DiffSegment): boolean {
  return seg.confirmed && Boolean(seg.selection?.witness_name)
}

/** @deprecated Use isDiffEdited */
export function isDiffResolved(seg: DiffSegment): boolean {
  return isDiffEdited(seg)
}

export function resolveSegmentsPreview(segments: Segment[]): string {
  return segments
    .map((seg) => (seg.type === 'text' ? seg.content : getDiffProposedValue(seg)))
    .join('')
}

export function countEditedDiffs(segments: Segment[]): number {
  return segments.filter(
    (seg): seg is DiffSegment => seg.type === 'diff' && isDiffEdited(seg)
  ).length
}

export function countUnresolvedDiffs(segments: Segment[]): number {
  return segments.filter((seg): seg is DiffSegment => seg.type === 'diff').length - countEditedDiffs(segments)
}
