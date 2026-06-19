from pydurma_web.schemas.collation import (
    AlignmentCell,
    AlignmentRow,
    RowSelectionState,
    VariantSelection,
)
from pydurma_web.services.resolve import (
    apply_selection,
    build_resolved_vulgate,
    count_unresolved,
    get_row_options,
    is_selection_valid,
)


def _variant_row(
    index: int = 0,
    tokens: list[tuple[str, str, int]] | None = None,
) -> AlignmentRow:
    if tokens is None:
        tokens = [("text1", "tenzin", 33), ("text2", "Stanzin", 67)]
    cells = [
        AlignmentCell(name=name, token=token, weight=weight)
        for name, token, weight in tokens
    ]
    return AlignmentRow(
        index=index,
        is_variant=True,
        cells=cells,
        options=get_row_options(cells),
        suggested_token="Stanzin",
    )


def test_get_row_options_unique_non_empty():
    cells = [
        AlignmentCell(name="a", token="x", weight=50),
        AlignmentCell(name="b", token="x", weight=50),
        AlignmentCell(name="c", token="", weight=0),
    ]
    assert get_row_options(cells) == ["x"]


def test_apply_selection_preset():
    row = _variant_row()
    preset = VariantSelection(witness_name="text1")
    assert apply_selection(row, preset) == "tenzin"
    assert apply_selection(row, None) == "Stanzin"


def test_build_resolved_vulgate_and_unresolved_count():
    row = _variant_row()
    agreement = AlignmentRow(
        index=1,
        is_variant=False,
        cells=row.cells,
        options=["hello"],
        suggested_token="hello",
    )
    rows = [row, agreement]
    selections = {
        "0": RowSelectionState(
            selection=VariantSelection(witness_name="text1"),
            confirmed=True,
        )
    }
    assert build_resolved_vulgate(rows, selections) == "tenzinhello"
    assert count_unresolved(rows, selections) == 0

    pending = {
        "0": RowSelectionState(
            selection=VariantSelection(witness_name="text1"),
            confirmed=False,
        )
    }
    assert count_unresolved(rows, pending) == 1
    assert is_selection_valid(row, pending["0"]) is False


def test_preset_selection_valid_when_confirmed():
    row = _variant_row()
    state = RowSelectionState(
        selection=VariantSelection(witness_name="text1"),
        confirmed=True,
    )
    assert is_selection_valid(row, state) is True
