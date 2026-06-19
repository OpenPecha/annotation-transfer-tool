import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from webuddhsit_tools.main import app

TESTS_DIR = Path(__file__).resolve().parent
if str(TESTS_DIR) not in sys.path:
    sys.path.insert(0, str(TESTS_DIR))


@pytest.fixture
def client():
    return TestClient(app)
