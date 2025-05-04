import pytest
from dotenv import load_dotenv
import os
from fastapi import FastAPI
from fastapi.testclient import TestClient
from auth.server import app

from auth.api.userController import user_controller_router
from auth.services.userService import UserService
from unittest.mock import MagicMock

load_dotenv()
print(os.getenv("CI"))
print(f"environment set to {os.getenv("ENV")}")

if os.getenv("CI") != "true":
    print("loading local .env file")
    load_dotenv(dotenv_path='config/.env.test', override= True)

from auth.utils import get_connection

@pytest.fixture(scope="session")
def test_db_conn():
    conn = get_connection()
    yield conn
    conn.close()

@pytest.fixture
def mock_user_service():
    return MagicMock(spec=UserService)

@pytest.fixture
def test_app(mock_user_service):
    app = FastAPI()
    app.include_router(user_controller_router)
    app.dependency_overrides[UserService] = lambda: mock_user_service
    return app

@pytest.fixture
def client(test_app):
    return TestClient(test_app)

