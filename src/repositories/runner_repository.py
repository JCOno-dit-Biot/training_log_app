from src.models.runner import Runner
from abstract_repository import abstract_repository
from typing import List, Optional
from psycopg2.extras import RealDictCursor

class runner_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

    def get_by_name(self, runner_name: str) -> Optional[Runner]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            name,
                            kennels.name as kennel_name
                        FROM 
                            runners
                        JOIN 
                            kennels 
                        ON
                            runners.kennel_id == kennels.id
                        WHERE 
                            name = %s
                        """
            cur.execute(query, (runner_name))
            row = cur.fetchone()
        return Runner(**row) if row else None

    def get_all(self, kennel_id: int) -> List[Runner]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            name,
                            kennels.name as kennel_name
                        FROM 
                            runners
                        JOIN 
                            kennels 
                        ON
                            runners.kennel_id == kennels.id
                        WHERE 
                            kennel_id = %s
                        """
            cur.execute(query, (kennel_id))
            
        return [Runner(**row) for row in cur.fetchall()]

    def create(self, runner: Runner, kennel_id) -> Runner:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """
                    INSERT INTO runners(name, kennel_id) VALUES (%s, %s)
                """
                cur.execute(query, (runner.name, kennel_id,))
            except Exception as e:
                print(e)
                self._connection.rollback()
            finally:
                self._connection.commit()
        return runner

    def delete(self, runner: Runner):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            cur.execute("""DELETE FROM runners WHERE name = %s AND kennel_id = SELECT id FROM kennel WHERE name = %s """,
                         (runner.name, runner.kennel.name))
            self._connection.commit()


