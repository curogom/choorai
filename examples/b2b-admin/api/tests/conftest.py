import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.storage import project_storage


@pytest.fixture
def client():
    """FastAPI TestClient fixture"""
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_storage():
    """각 테스트 전에 storage 초기화"""
    project_storage._projects.clear()
    yield
    project_storage._projects.clear()
