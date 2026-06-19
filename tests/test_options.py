from fixtures import run_collation


def test_options_endpoint(client):
    response = client.get("/api/options")
    assert response.status_code == 200
    payload = response.json()
    assert "languages" in payload
    assert "export_formats" in payload
    assert any(item["id"] == "bo" for item in payload["languages"])
    assert any(item["id"] == "txt" for item in payload["export_formats"])


def test_update_selections(client):
    payload = run_collation(client)
    job_id = payload["job_id"]
    variant = next(row for row in payload["rows"] if row["is_variant"])
    witness = variant["cells"][0]["name"]
    selections = {
        str(variant["index"]): {
            "selection": {"kind": "preset", "witness_name": witness},
            "confirmed": True,
        }
    }

    response = client.put(
        f"/api/collation/{job_id}/selections",
        json={"selections": selections},
    )
    assert response.status_code == 200
    assert response.json() == {"ok": True}

    export = client.post(
        f"/api/export/{job_id}",
        json={"format": "txt"},
    )
    assert export.status_code == 200
    assert export.content


def test_update_selections_unknown_job(client):
    response = client.put(
        "/api/collation/missing-job/selections",
        json={"selections": {}},
    )
    assert response.status_code == 404
