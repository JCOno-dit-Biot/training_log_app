import pytest
from dotenv import load_dotenv
import os

load_dotenv()
print(os.getenv("CI"))
print(f"environment set to {os.getenv("ENV")}")

if os.getenv("CI") != "true":
    print("loading local .env file")
    load_dotenv(dotenv_path='config/.env.test', override= True)

from src.utils import get_connection

@pytest.fixture(scope="session")
def test_db_conn():
    #conn_string=f"postgres://{db_user}:{db_password}@{host}:{port}/{db}"
    conn = get_connection()
    yield conn
    conn.close()




