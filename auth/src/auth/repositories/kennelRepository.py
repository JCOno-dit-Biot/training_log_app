from auth.utils import get_connection
from auth.models.kennel import Kennel

class KennelRepository:
    def __init__(self):
        self.conn = get_connection()

    def get_all(self) -> list[Kennel]:
        with self.conn.cursor() as cur:
            cur.execute("SELECT id, name FROM kennels")
            rows = cur.fetchall()
            return [Kennel(id = row[0], name = row[1]) for row in rows]
        
    def get_by_name(self, name: str):
        with self.conn.cursor() as cur:
            cur.execute("SELECT id FROM kennels WHERE name = %s", (name,))
            row = cur.fetchone()
            return row[0] if row else None

    def create(self, name: str):
        with self.conn.cursor() as cur:
            cur.execute("INSERT INTO kennels (name) VALUES (%s) RETURNING id", (name,))
            return cur.fetchone()[0]