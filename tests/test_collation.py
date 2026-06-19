from fixtures import WITNESS_A, WITNESS_B, WITNESS_C


def _multipart_payload(*witnesses):
    parts = []
    for name, content in witnesses:
        parts.append(
            ("files", (f"{name.lower()}.txt", content.encode("utf-8"), "text/plain"))
        )
        parts.append(("names", (None, name)))
    return parts


def _detail_text(payload: dict) -> str:
    detail = payload.get("detail", "")
    if isinstance(detail, list):
        return " ".join(str(item.get("msg", item)) for item in detail).lower()
    return str(detail).lower()


def test_collation_with_named_witnesses(client):
    parts = _multipart_payload(
        ("Derge", WITNESS_A),
        ("Narthang", WITNESS_B),
        ("Lhasa", WITNESS_C),
    )
    parts.extend(
        [
            ("base_witness_name", (None, "Derge")),
            ("language", (None, "bo")),
        ]
    )
    response = client.post("/api/collation", files=parts)
    assert response.status_code == 200
    payload = response.json()
    assert [witness["name"] for witness in payload["witnesses"]] == [
        "Derge",
        "Narthang",
        "Lhasa",
    ]
    assert payload["metadata"]["base_witness"] == "Derge"
    assert payload["metadata"]["witness_count"] == 3
    assert "job_id" in payload
    assert payload["suggested_vulgate"]
    assert payload["variant_count"] >= 0
    assert payload["unresolved_count"] == payload["variant_count"]
    variant_rows = [row for row in payload["rows"] if row["is_variant"]]
    if variant_rows:
        row = variant_rows[0]
        assert "options" in row
        assert "suggested_token" in row
        assert row["confirmed"] is False


def test_collation_rejects_name_file_mismatch(client):
    parts = _multipart_payload(("Derge", WITNESS_A), ("Narthang", WITNESS_B))
    response = client.post("/api/collation", files=parts[:3])
    assert response.status_code == 422
    assert "match" in _detail_text(response.json())


def test_collation_rejects_duplicate_names(client):
    parts = _multipart_payload(
        ("Derge", WITNESS_A),
        ("derge", WITNESS_B),
    )
    response = client.post("/api/collation", files=parts)
    assert response.status_code == 422
    assert "unique" in _detail_text(response.json())
