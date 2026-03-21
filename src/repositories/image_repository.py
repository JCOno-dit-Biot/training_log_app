from typing import Optional
from psycopg2.extras import RealDictCursor

class ImageRepository:
    def __init__(self, connection):
        self._connection = connection

    def deactivate_active_dog_image(self, dog_id: int) -> None:
        with self._connection.cursor() as cur:
            cur.execute(
                """
                UPDATE images
                SET is_active = FALSE
                WHERE dog_id = %s
                  AND is_active = TRUE;
                """,
                (dog_id,),
            )

    def deactivate_active_runner_image(self, runner_id: int) -> None:
        with self._connection.cursor() as cur:
            cur.execute(
                """
                UPDATE images
                SET is_active = FALSE
                WHERE runner_id = %s
                  AND is_active = TRUE;
                """,
                (runner_id,),
            )

    def create_dog_image(self, dog_id: int, image_path: str) -> dict:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO images (image_path, dog_id, is_active)
                VALUES (%s, %s, TRUE)
                RETURNING id, image_path, dog_id, is_active, created_at;
                """,
                (image_path, dog_id),
            )
            row = cur.fetchone()

        return {
            "id": row['id'],
            "image_path": row['image_path'],
            "dog_id": row['dog_id'],
            "is_active": row['is_active'],
            "created_at": row['created_at'],
        }

    def create_runner_image(self, runner_id: int, image_path: str) -> dict:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO images (image_path, runner_id, is_active)
                VALUES (%s, %s, TRUE)
                RETURNING id, image_path, runner_id, is_active, created_at;
                """,
                (image_path, runner_id),
            )
            row = cur.fetchone()

        return {
            "id": row['id'],
            "image_path": row['image_path'],
            "runner_id": row['runner_id'],
            "is_active": row['is_active'],
            "created_at": row['created_at'],
        }

    def get_active_dog_image(self, dog_id: int) -> Optional[dict]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, image_path, dog_id, is_active, created_at
                FROM images
                WHERE dog_id = %s
                  AND is_active = TRUE
                LIMIT 1;
                """,
                (dog_id,),
            )
            row = cur.fetchone()

        if not row:
            return None

        return {
            "id": row['id'],
            "image_path": row['image_path'],
            "dog_id": row['dog_id'],
            "is_active": row['is_active'],
            "created_at": row['created_at'],
        }

    def get_active_runner_image(self, runner_id: int) -> Optional[dict]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, image_path, runner_id, is_active, created_at
                FROM images
                WHERE runner_id = %s
                  AND is_active = TRUE
                LIMIT 1;
                """,
                (runner_id,),
            )
            row = cur.fetchone()

        if not row:
            return None

        return {
            "id": row['id'],
            "image_path": row['image_path'],
            "runner_id": row['runner_id'],
            "is_active": row['is_active'],
            "created_at": row['created_at'],
        }