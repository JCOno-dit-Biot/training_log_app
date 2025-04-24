import psycopg2
from .config import settings

def get_connection():
    db_url = (
        settings.DATABASE_URL
    )
    return psycopg2.connect(db_url)
    