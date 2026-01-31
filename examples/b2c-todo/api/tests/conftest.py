import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.storage import todo_storage


@pytest.fixture
def client():
    """FastAPI TestClient fixture"""
    return TestClient(app)


@pytest.fixture(autouse=True)
def reset_storage():
    """각 테스트 전에 storage 초기화"""
    todo_storage._todos.clear()
    yield
    todo_storage._todos.clear()
