from fastapi.testclient import TestClient
from fast_antx.core import transfer

from annotation_transfer_tool.main import app

client = TestClient(app)


def test_transfer_api_matches_fast_antx() -> None:
    source = "#A# cat"
    target = "cat"
    patterns = [["color", "(#.+?#)"]]

    response = client.post(
        "/api/transfer",
        json={
            "source": source,
            "target": target,
            "patterns": patterns,
            "output": "txt",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["output_format"] == "txt"
    assert body["result"] == transfer(source, patterns, target, "txt")


def test_transfer_api_skips_empty_patterns() -> None:
    response = client.post(
        "/api/transfer",
        json={
            "source": "hello world",
            "target": "hello world",
            "patterns": [["pos", "(/.+? )"], ["", ""], ["label", ""]],
            "output": "txt",
        },
    )

    assert response.status_code == 200
    assert response.json()["result"] == transfer(
        "hello world",
        [["pos", "(/.+? )"]],
        "hello world",
        "txt",
    )
