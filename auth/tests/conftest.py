import pytest
from dotenv import load_dotenv
import os
from fastapi.testclient import TestClient
from auth.server import app

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
def test_client():
    return TestClient(app)
