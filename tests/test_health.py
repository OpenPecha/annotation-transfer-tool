from fastapi.testclient import TestClient

from webuddhsit_tools.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "fast_antx" in data
    assert "pydurma_available" in data
