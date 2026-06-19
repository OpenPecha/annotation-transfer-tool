from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from Pydurma.utils.utils import get_top_weight_index, is_diff_token

from pydurma_web.schemas.collation import (
    AlignmentCell,
    AlignmentRow,
    CollationConfig,
    CollationMetadata,
    CollationResponse,
    WitnessInfo,
)
from pydurma_web.services.resolve import count_unresolved, count_variants, get_row_options


@dataclass
class Witness:
    name: str
    path: Path


def build_alignment_rows(
    weighted_matrix,
    witnesses: list[Witness],
    aligner_witnesses: list[Witness],
) -> list[AlignmentRow]:
    name_to_column = {
        witness.name: index for index, witness in enumerate(aligner_witnesses)
    }
    rows: list[AlignmentRow] = []
    for row_index, tokens_info in enumerate(weighted_matrix):
        cells: list[AlignmentCell] = []
        for witness in witnesses:
            column_index = name_to_column[witness.name]
            token = tokens_info[column_index]
            token_text = ""
            weight = 0
            if token is not None:
                token_text = token[3] or ""
                if len(token) > 4:
                    weight = token[4]
            cells.append(
                AlignmentCell(name=witness.name, token=token_text, weight=weight)
            )

        selected_index = get_top_weight_index(tokens_info)
        try:
            suggested_token = tokens_info[selected_index][3] or ""
        except (IndexError, TypeError):
            suggested_token = ""

        rows.append(
            AlignmentRow(
                index=row_index,
                is_variant=is_diff_token(tokens_info),
                cells=cells,
                options=get_row_options(cells),
                suggested_token=suggested_token,
            )
        )
    return rows


def matrix_to_response(
    job_id: str,
    weighted_matrix,
    witnesses: list[Witness],
    aligner_witnesses: list[Witness],
    config: CollationConfig,
    suggested_vulgate: str,
) -> CollationResponse:
    witness_infos = [
        WitnessInfo(name=witness.name, index=index)
        for index, witness in enumerate(witnesses)
    ]
    base_witness = config.base_witness_name or witnesses[0].name
    rows = build_alignment_rows(weighted_matrix, witnesses, aligner_witnesses)
    variant_count = count_variants(rows)

    return CollationResponse(
        job_id=job_id,
        witnesses=witness_infos,
        rows=rows,
        suggested_vulgate=suggested_vulgate,
        variant_count=variant_count,
        unresolved_count=variant_count,
        metadata=CollationMetadata(
            base_witness=base_witness,
            witness_count=len(witnesses),
            language=config.language,
        ),
    )
