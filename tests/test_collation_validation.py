from pydurma_web.schemas.collation import validate_witness_names


def test_validate_witness_names_accepts_unique_names():
    assert validate_witness_names(["Derge", "Narthang"]) == ["Derge", "Narthang"]


def test_validate_witness_names_rejects_empty():
    try:
        validate_witness_names(["Derge", "  "])
    except ValueError as exc:
        assert "empty" in str(exc).lower()
    else:
        raise AssertionError("Expected ValueError for empty witness name")


def test_validate_witness_names_rejects_duplicates():
    try:
        validate_witness_names(["Derge", "derge"])
    except ValueError as exc:
        assert "unique" in str(exc).lower()
    else:
        raise AssertionError("Expected ValueError for duplicate witness names")
