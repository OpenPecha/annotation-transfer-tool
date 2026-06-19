from __future__ import annotations

import tempfile
from pathlib import Path

from pydurma_web.core.exceptions import CollationError, WitnessValidationError
from pydurma_web.schemas.collation import (
    CollationConfig,
    CollationResponse,
    ExportRequest,
    RowSelectionState,
    validate_witness_names,
)
from pydurma_web.services.matrix import Witness, matrix_to_response
from pydurma_web.services.pipeline import (
    build_aligner,
    build_tokenizer,
    build_vulgate,
    build_weigher,
    export_to_bytes,
    tokenize_text,
)
from pydurma_web.services.resolve import apply_overrides_to_matrix
from pydurma_web.services.session_store import (
    clone_matrix_for_export,
    create_session,
    get_session,
    update_session_selections,
)


class CollationService:
    def run_plain_text(
        self,
        witnesses: list[Witness],
        config: CollationConfig,
    ) -> CollationResponse:
        weighted_matrix, aligner_witnesses = self._run_pipeline(witnesses, config)
        version_paths = [witness.path for witness in aligner_witnesses]
        versions_to_serialize = {
            witness.path.stem: witness.name for witness in aligner_witnesses
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            suggested_vulgate = build_vulgate(weighted_matrix, output_dir, "collation")

        rows_response = matrix_to_response(
            "",
            weighted_matrix,
            witnesses,
            aligner_witnesses,
            config,
            suggested_vulgate,
        )

        job_id = create_session(
            weighted_matrix,
            witnesses,
            aligner_witnesses,
            config,
            rows_response.rows,
            suggested_vulgate,
            version_paths,
            versions_to_serialize,
        )

        return matrix_to_response(
            job_id,
            weighted_matrix,
            witnesses,
            aligner_witnesses,
            config,
            suggested_vulgate,
        )

    def export(
        self, job_id: str, request: ExportRequest
    ) -> tuple[bytes, str, str] | None:
        session = get_session(job_id)
        if session is None:
            return None

        selections = request.selections or session.selections or {}

        matrix = clone_matrix_for_export(session)
        witness_order = [w.name for w in session.aligner_witnesses]
        apply_overrides_to_matrix(matrix, session.rows, selections, witness_order)

        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            content, filename, media_type = export_to_bytes(
                request.format,
                matrix,
                output_dir,
                "collation",
                session.version_paths,
                session.versions_to_serialize,
            )
        return content, filename, media_type

    def update_selections(
        self, job_id: str, selections: dict[str, RowSelectionState]
    ) -> bool:
        return update_session_selections(job_id, selections)

    def _run_pipeline(
        self, witnesses: list[Witness], config: CollationConfig
    ):
        if len(witnesses) < 2:
            raise WitnessValidationError("At least two witnesses are required")

        names = [witness.name for witness in witnesses]
        try:
            validate_witness_names(names)
        except ValueError as exc:
            raise WitnessValidationError(str(exc)) from exc

        base_name = config.base_witness_name or witnesses[0].name
        base_witness = next(
            (witness for witness in witnesses if witness.name == base_name),
            None,
        )
        if base_witness is None:
            raise WitnessValidationError(
                f"Base witness '{base_name}' was not found among uploaded witnesses"
            )

        aligner_witnesses = [base_witness] + [
            witness for witness in witnesses if witness.name != base_name
        ]

        tokenizer = build_tokenizer(config.language)
        aligner = build_aligner()
        weigher = build_weigher()

        token_strings = []
        token_lists = []
        for witness in aligner_witnesses:
            text = witness.path.read_text(encoding="utf-8")
            token_string, token_list = tokenize_text(
                tokenizer, text, config.filter_patterns
            )
            token_strings.append(token_string)
            token_lists.append(token_list)

        try:
            token_matrix = aligner.get_alignment_matrix(token_strings, token_lists)
            weighted_matrix = weigher.get_weight_matrix(token_matrix)
        except Exception as exc:
            raise CollationError(f"Collation failed: {exc}") from exc

        return weighted_matrix, aligner_witnesses
