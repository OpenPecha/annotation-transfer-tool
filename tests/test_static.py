from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from annotation_transfer_tool.main import _FRONTEND_DIST, app

client = TestClient(app)

pytestmark = pytest.mark.skipif(
    not (_FRONTEND_DIST / "index.html").is_file(),
    reason="frontend/dist not built — run `npm run build` in frontend/",
)


def test_root_serves_spa() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "<!DOCTYPE html>" in response.text or "<html" in response.text


def test_assets_served() -> None:
    assets_dir = _FRONTEND_DIST / "assets"
    asset = next(assets_dir.glob("*"), None)
    assert asset is not None

    response = client.get(f"/assets/{asset.name}")
    assert response.status_code == 200
