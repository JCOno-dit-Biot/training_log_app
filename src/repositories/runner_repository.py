from src.models.runner import Runner
from src.parsers.runner_parser import parse_runner_from_row
from .abstract_repository import EntityRepository
from typing import List, Optional
from psycopg2.extras import RealDictCursor
from src.constants import UPDATE_ALLOWED_FIELDS_RUNNER

class runner_repository(EntityRepository):

    def __init__(self, connection):
        self._connection = connection

    def exists_for_kennel(self, runner_id: int, kennel_id: int) -> bool:
        with self._connection.cursor() as cur:
            cur.execute(
                """
                SELECT 1
                FROM runners
                WHERE id = %s
                  AND kennel_id = %s;
                """,
                (runner_id, kennel_id)
            )
            return cur.fetchone() is not None
        
    def get_by_name(self, runner_name: str) -> Optional[Runner]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            runners.id,
                            runners.name,
                            k.id as kennel_id,
                            k.name as kennel_name,
                            image_path as image_url
                        FROM 
                            runners
                        JOIN 
                            kennels k
                        ON
                            runners.kennel_id = k.id
                        LEFT JOIN images
                            ON images.runner_id = runners.id
                        WHERE 
                            runners.name = %s
                        AND 
                            images.is_active=True;
                        """
            cur.execute(query, (runner_name,))
            row = cur.fetchone()
        if row:
            runner = parse_runner_from_row(row)
            return runner
        return None

    def get_all(self, kennel_id: int) -> List[Runner]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ 
                        SELECT 
                            runners.id,
                            runners.name,
                            k.id as kennel_id,
                            k.name as kennel_name,
                            images.image_path as image_url
                        FROM 
                            runners
                        JOIN 
                            kennels k
                        ON
                            runners.kennel_id = k.id
                        LEFT JOIN images
                            ON images.runner_id = runners.id
                        WHERE 
                            kennel_id = %s AND images.is_active=True
                        """
            cur.execute(query, (kennel_id,))
            runners = []
            for row in cur.fetchall():
                runner = parse_runner_from_row(row)
                runners.append(runner)

            return runners
            
    def get_by_id(self, id: int) -> Optional[Runner]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            runners.id,
                            runners.name,
                            k.id as kennel_id,
                            k.name as kennel_name,
                            image_path as image_url
                        FROM 
                            runners
                        JOIN 
                            kennels k
                        ON
                            runners.kennel_id = k.id
                        LEFT JOIN images
                            ON images.runner_id = runners.id
                        WHERE 
                            runners.id = %s
                        AND 
                            images.is_active=True;
                        """
            cur.execute(query, (id,))
            row = cur.fetchone()

        return parse_runner_from_row(row)
    
    def create(self, runner: Runner, kennel_id) -> Runner:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """
                    INSERT INTO runners(name, kennel_id) VALUES (%s, %s) RETURNING id
                """
                cur.execute(query, (runner.name, kennel_id,))
                id = cur.fetchone()['id']
            except Exception as e:
                print(e)
                self._connection.rollback()
            finally:
                self._connection.commit()
        return id

    def delete(self, runner: Runner):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            cur.execute("""DELETE FROM runners WHERE name = %s AND kennel_id = (SELECT id FROM kennels WHERE name = %s); """,
                         (runner.name, runner.kennel.name))
            self._connection.commit()


    def update(self, fields: dict, runner_id: int):

        # Sanitize data entry at repo level
        fields = {k: v for k, v in fields.items() if k in UPDATE_ALLOWED_FIELDS_RUNNER}

        if not fields:
            return False
        
        keys = list(fields.keys())
        values = list(fields.values())

        set_clause = ", ".join([f"{key} = %s" for key in keys])

        query = f"""
            UPDATE runners
            SET {set_clause}
            WHERE id = %s
        """

        values.append(runner_id)
        try:
            with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
                cur.execute(query, values)
                self._connection.commit()
                return cur.rowcount > 0
        except Exception as e:
            print(e)
            self._connection.rollback()
            return False
    
    def get_total_count(self):
        return super().get_total_count()