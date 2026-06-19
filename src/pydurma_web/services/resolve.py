from __future__ import annotations

from pydurma_web.schemas.collation import (
    AlignmentCell,
    AlignmentRow,
    RowSelectionState,
    VariantSelection,
)


def get_row_options(cells: list[AlignmentCell]) -> list[str]:
    seen: set[str] = set()
    options: list[str] = []
    for cell in cells:
        token = cell.token
        if token and token not in seen:
            seen.add(token)
            options.append(token)
    return options


def apply_selection(row: AlignmentRow, selection: VariantSelection | None) -> str:
    if selection is None:
        return row.suggested_token
    for cell in row.cells:
        if cell.name == selection.witness_name:
            return cell.token
    return row.suggested_token


def is_selection_valid(row: AlignmentRow, state: RowSelectionState) -> bool:
    if not state.confirmed:
        return False
    return any(cell.name == state.selection.witness_name for cell in row.cells)


def count_variants(rows: list[AlignmentRow]) -> int:
    return sum(1 for row in rows if row.is_variant)


def count_unresolved(
    rows: list[AlignmentRow],
    selections: dict[str, RowSelectionState],
) -> int:
    unresolved = 0
    for row in rows:
        if not row.is_variant:
            continue
        state = selections.get(str(row.index))
        if state is None or not is_selection_valid(row, state):
            unresolved += 1
    return unresolved


def build_resolved_vulgate(
    rows: list[AlignmentRow],
    selections: dict[str, RowSelectionState],
    *,
    require_confirmed: bool = False,
) -> str:
    parts: list[str] = []
    for row in rows:
        if row.is_variant:
            state = selections.get(str(row.index))
            if state is not None and (not require_confirmed or state.confirmed):
                parts.append(apply_selection(row, state.selection))
            elif require_confirmed:
                parts.append(row.suggested_token)
            else:
                parts.append(
                    apply_selection(row, state.selection if state else None)
                    if state
                    else row.suggested_token
                )
        else:
            parts.append(row.suggested_token)
    return "".join(parts)


def apply_overrides_to_matrix(
    matrix,
    rows: list[AlignmentRow],
    selections: dict[str, RowSelectionState],
    witness_order: list[str],
) -> None:
    del witness_order
    for row in rows:
        if not row.is_variant:
            continue
        state = selections.get(str(row.index))
        if state is None or not state.confirmed:
            continue
        token_text = apply_selection(row, state.selection)
        row_index = row.index
        tokens_info = matrix[row_index]
        best_col: int | None = None
        best_weight = -1
        for col_index, token in enumerate(tokens_info):
            if token is None:
                continue
            weight = token[4] if len(token) > 4 else token[3]
            if weight > best_weight:
                best_weight = weight
                best_col = col_index
        if best_col is None:
            continue
        for col_index, token in enumerate(tokens_info):
            if token is None:
                continue
            if col_index == best_col:
                matrix[row_index][col_index] = token[:3] + (token_text, 1000)
            else:
                matrix[row_index][col_index] = token[:4] + (0,)
