import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { updateSelections } from '@/lib/api/pydurma'
import type {
  AlignmentRow,
  RowSelectionState,
  SelectionsMap,
  VariantSelection,
} from '@/app/pydurma/types/collation'

const STORAGE_PREFIX = 'pydurma_selections_'

function defaultSelection(row: AlignmentRow): RowSelectionState {
  const suggested = row.suggested_token
  const witness =
    row.cells.find((cell) => cell.token === suggested) ?? row.cells[0]
  return {
    selection: {
      kind: 'preset',
      witness_name: witness?.name ?? '',
    },
    confirmed: false,
  }
}

function normalizeState(
  row: AlignmentRow,
  state: RowSelectionState
): RowSelectionState {
  const sel = state.selection as VariantSelection & {
    kind?: string
    value?: string | null
    witness_name?: string | null
  }

  if (sel.kind === 'preset' && sel.witness_name) {
    const valid = row.cells.some((cell) => cell.name === sel.witness_name)
    if (valid) {
      return { selection: { kind: 'preset', witness_name: sel.witness_name }, confirmed: state.confirmed }
    }
  }

  if (sel.kind === 'custom' && sel.value) {
    const witness = row.cells.find((cell) => cell.token === sel.value)
    if (witness) {
      return {
        selection: { kind: 'preset', witness_name: witness.name },
        confirmed: state.confirmed,
      }
    }
  }

  return defaultSelection(row)
}

function loadDraft(jobId: string, rows: AlignmentRow[]): SelectionsMap | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${jobId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SelectionsMap
    const normalized: SelectionsMap = {}
    for (const row of rows) {
      if (!row.is_variant) continue
      const state = parsed[String(row.index)]
      if (state) {
        normalized[String(row.index)] = normalizeState(row, state)
      }
    }
    return normalized
  } catch {
    return null
  }
}

function saveDraft(jobId: string, selections: SelectionsMap) {
  localStorage.setItem(`${STORAGE_PREFIX}${jobId}`, JSON.stringify(selections))
}

function isSelectionResolved(row: AlignmentRow, state: RowSelectionState | undefined): boolean {
  if (!state?.confirmed) return false
  return row.cells.some((cell) => cell.name === state.selection.witness_name)
}

export function useSelections(jobId: string | null, rows: AlignmentRow[]) {
  const [selections, setSelections] = useState<SelectionsMap>({})

  useEffect(() => {
    if (!jobId) {
      setSelections({})
      return
    }
    const draft = loadDraft(jobId, rows)
    if (draft) {
      setSelections(draft)
      return
    }
    const initial: SelectionsMap = {}
    for (const row of rows) {
      if (row.is_variant) {
        initial[String(row.index)] = defaultSelection(row)
      }
    }
    setSelections(initial)
  }, [jobId, rows])

  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!jobId || Object.keys(selections).length === 0) return

    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      updateSelections(jobId, selections).catch(() => {
        // local draft remains available; server sync is best-effort
      })
    }, 300)

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current)
    }
  }, [jobId, selections])

  const variantRows = useMemo(
    () => rows.filter((row) => row.is_variant),
    [rows]
  )

  const editedCount = useMemo(() => {
    return variantRows.filter((row) => {
      const state = selections[String(row.index)]
      return isSelectionResolved(row, state)
    }).length
  }, [variantRows, selections])

  const unresolvedCount = variantRows.length - editedCount

  const updateSelectionState = useCallback(
    (rowIndex: number, updater: (prev: RowSelectionState | undefined, row: AlignmentRow) => RowSelectionState) => {
      setSelections((prev) => {
        const row = rows.find((r) => r.index === rowIndex)
        if (!row) return prev
        const next = {
          ...prev,
          [String(rowIndex)]: updater(prev[String(rowIndex)], row),
        }
        if (jobId) saveDraft(jobId, next)
        return next
      })
    },
    [jobId, rows]
  )

  const resolveDiff = useCallback(
    (rowIndex: number, selection: VariantSelection) => {
      updateSelectionState(rowIndex, (prev, row) => {
        const prior = prev ?? defaultSelection(row)
        const valid = row.cells.some((cell) => cell.name === selection.witness_name)
        if (!valid) return prior

        return {
          selection,
          confirmed: true,
        }
      })
    },
    [updateSelectionState]
  )

  const clearDraft = useCallback(() => {
    if (jobId) localStorage.removeItem(`${STORAGE_PREFIX}${jobId}`)
  }, [jobId])

  return {
    selections,
    editedCount,
    unresolvedCount,
    variantRows,
    resolveDiff,
    clearDraft,
  }
}

export function resolveToken(
  row: AlignmentRow,
  state: RowSelectionState | undefined
): string {
  if (!state?.confirmed) return row.suggested_token
  const cell = row.cells.find((c) => c.name === state.selection.witness_name)
  return cell?.token ?? row.suggested_token
}

export function buildLocalPreview(
  rows: AlignmentRow[],
  selections: SelectionsMap
): string {
  return rows
    .map((row) => {
      if (row.is_variant) {
        return resolveToken(row, selections[String(row.index)])
      }
      return row.suggested_token
    })
    .join('')
}
