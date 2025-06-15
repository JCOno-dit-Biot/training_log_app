from src.models.runner import Runner
from src.parsers.runner_parser import parse_runner_from_row
from .abstract_repository import abstract_repository
from typing import List, Optional
from psycopg2.extras import RealDictCursor

class runner_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

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
                        ORDER BY images.created_at DESC 
                        LIMIT 1;
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
                        WITH latest_images AS (
                            SELECT *,
                                    ROW_NUMBER() OVER (PARTITION BY runner_id ORDER BY created_at DESC) AS rn
                            FROM images
                            WHERE runner_id IS NOT NULL
                        )
                        SELECT 
                            runners.id,
                            runners.name,
                            k.id as kennel_id,
                            k.name as kennel_name,
                            latest_images.image_path as image_url
                        FROM 
                            runners
                        JOIN 
                            kennels k
                        ON
                            runners.kennel_id = k.id
                        LEFT JOIN latest_images
                            ON latest_images.runner_id = runners.id AND latest_images.rn = 1
                        WHERE 
                            kennel_id = %s
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
                        ORDER BY images.created_at DESC 
                        LIMIT 1;
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


    def update(self, obj):
        return super().update(obj)