export type OutputFormat = 'txt' | 'md' | 'csv' | 'docx' | 'hfml'
export type Language = 'bo' | 'generic'

export interface OptionItem {
  id: string
  label: string
}

export interface WitnessInfo {
  name: string
  index: number
}

export interface AlignmentCell {
  name: string
  token: string
  weight: number
}

export interface VariantSelection {
  kind: 'preset'
  witness_name: string
}

export interface RowSelectionState {
  selection: VariantSelection
  confirmed: boolean
}

export interface AlignmentRow {
  index: number
  is_variant: boolean
  cells: AlignmentCell[]
  options: string[]
  suggested_token: string
  selection?: VariantSelection | null
  confirmed: boolean
}

export interface CollationMetadata {
  base_witness: string
  witness_count: number
  language: string
}

export interface CollationResponse {
  job_id: string
  witnesses: WitnessInfo[]
  rows: AlignmentRow[]
  suggested_vulgate: string
  variant_count: number
  unresolved_count: number
  metadata: CollationMetadata
}

export interface WitnessDraft {
  id: string
  name: string
  file: File | null
}

export type Step = 'upload' | 'review' | 'export'

export type SelectionsMap = Record<string, RowSelectionState>
