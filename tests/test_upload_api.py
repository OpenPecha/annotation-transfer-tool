from fastapi.testclient import TestClient

from annotation_transfer_tool.main import app

client = TestClient(app)


def test_upload_txt() -> None:
    response = client.post(
        "/api/upload",
        files={"file": ("sample.txt", "hello world", "text/plain")},
    )

    assert response.status_code == 200
    assert response.json() == {
        "content": "hello world",
        "filename": "sample.txt",
    }


def test_upload_rejects_unsupported_extension() -> None:
    response = client.post(
        "/api/upload",
        files={"file": ("image.png", b"\x89PNG", "image/png")},
    )

    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_upload_rejects_non_utf8() -> None:
    response = client.post(
        "/api/upload",
        files={"file": ("data.txt", b"\xff\xfe", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "File must be UTF-8 text"
