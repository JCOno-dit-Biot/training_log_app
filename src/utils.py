import psycopg2
from .config import settings

def get_connection() -> psycopg2.extensions.connection:
    db_url = (
        settings.TEST_DATABASE_URL
        if settings.ENV == "test"
        else settings.DATABASE_URL
    )
    return psycopg2.connect(db_url)
