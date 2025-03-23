from src.utils import get_connection
import pytest
from dotenv import load_dotenv
import os

if os.getenv("CI") != "true":
    load_dotenv(dotenv_path="config/.env.test")

host = "localhost"
db_user = os.getenv("POSTGRES_USER")
db_password = os.getenv("POSTGRES_PASSWORD")
db = os.getenv("POSTGRES_DB")
port = os.getenv("PORT")

@pytest.fixture(scope="session")
def test_db_conn():
    conn_string=f"postgres://{db_user}:{db_password}@{host}:{port}/{db}"
    conn = get_connection(conn_string)
    yield conn
    conn.close()




