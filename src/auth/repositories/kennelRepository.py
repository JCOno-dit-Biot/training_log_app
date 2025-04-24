class KennelRepository:
    def __init__(self, conn):
        self.conn = conn

    def get_by_name(self, name: str):
        with self.conn.cursor() as cur:
            cur.execute("SELECT id FROM kennels WHERE name = %s", (name,))
            row = cur.fetchone()
            return row[0] if row else None

    def create(self, name: str):
        with self.conn.cursor() as cur:
            cur.execute("INSERT INTO kennels (name) VALUES (%s) RETURNING id", (name,))
            return cur.fetchone()[0]