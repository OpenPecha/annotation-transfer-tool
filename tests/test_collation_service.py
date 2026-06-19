import tempfile
from pathlib import Path

import pytest

from pydurma_web.core.exceptions import WitnessValidationError
from pydurma_web.schemas.collation import CollationConfig
from pydurma_web.services.collation import CollationService, Witness
from fixtures import WITNESS_A, WITNESS_B, WITNESS_C


def test_collation_service_run_plain_text():
    service = CollationService()
    with tempfile.TemporaryDirectory() as temp_dir:
        witnesses = []
        for index, (name, content) in enumerate(
            [
                ("Derge", WITNESS_A),
                ("Narthang", WITNESS_B),
                ("Lhasa", WITNESS_C),
            ]
        ):
            path = Path(temp_dir) / f"witness_{index}.txt"
            path.write_text(content, encoding="utf-8")
            witnesses.append(Witness(name=name, path=path))

        result = service.run_plain_text(
            witnesses,
            CollationConfig(
                language="bo",
                base_witness_name="Narthang",
            ),
        )

    assert result.metadata.base_witness == "Narthang"
    assert [witness.name for witness in result.witnesses] == [
        "Derge",
        "Narthang",
        "Lhasa",
    ]
    assert all(cell.name for row in result.rows for cell in row.cells)
    assert result.job_id
    assert result.suggested_vulgate


def test_collation_service_requires_two_witnesses():
    service = CollationService()
    with tempfile.TemporaryDirectory() as temp_dir:
        path = Path(temp_dir) / "witness_0.txt"
        path.write_text(WITNESS_A, encoding="utf-8")
        witnesses = [Witness(name="Derge", path=path)]

        with pytest.raises(WitnessValidationError):
            service.run_plain_text(witnesses, CollationConfig())
