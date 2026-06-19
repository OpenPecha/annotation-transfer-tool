from fixtures import run_collation


def test_export_txt_after_confirming_variants(client):
    payload = run_collation(client)
    job_id = payload["job_id"]
    selections = {}
    for row in payload["rows"]:
        if not row["is_variant"]:
            continue
        witness = row["cells"][0]["name"]
        selections[str(row["index"])] = {
            "selection": {"kind": "preset", "witness_name": witness},
            "confirmed": True,
        }

    export = client.post(
        f"/api/export/{job_id}",
        json={"format": "txt", "selections": selections or None},
    )
    assert export.status_code == 200
    assert export.content
    assert "text/plain" in export.headers["content-type"]


def test_export_with_partially_confirmed_variants(client):
    payload = run_collation(client)
    job_id = payload["job_id"]
    variant_rows = [row for row in payload["rows"] if row["is_variant"]]
    if len(variant_rows) < 2:
        return

    selections = {}
    for row in variant_rows[:1]:
        witness = row["cells"][0]["name"]
        selections[str(row["index"])] = {
            "selection": {"kind": "preset", "witness_name": witness},
            "confirmed": True,
        }

    export = client.post(
        f"/api/export/{job_id}",
        json={"format": "txt", "selections": selections},
    )
    assert export.status_code == 200
    assert export.content
