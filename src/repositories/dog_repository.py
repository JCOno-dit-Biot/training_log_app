from src.models.dog import Dog
from .abstract_repository import abstract_repository
from typing import List, Optional
from psycopg2.extras import RealDictCursor

class dog_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

    def get_by_name(self, dog_name: str) -> Optional[Dog]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            dogs.name,
                            date_of_birth, 
                            breed, 
                            kennels.name as kennel_name
                        FROM 
                            dogs 
                        JOIN 
                            kennels 
                        ON
                            dogs.kennel_id = kennels.id
                        WHERE 
                            dogs.name = %s
                        """
            cur.execute(query, (dog_name,))
            row = cur.fetchone()

        return Dog(**row) if row else None

    def get_all(self, kennel_id: int) -> List[Dog]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            dogs.name,
                            date_of_birth, 
                            breed, 
                            kennels.name as kennel_name
                        FROM 
                            dogs 
                        JOIN 
                            kennels 
                        ON
                            dogs.kennel_id = kennels.id
                        WHERE 
                            kennel_id = %s
                        """
            cur.execute(query, (kennel_id,))
            return [Dog(**row) for row in cur.fetchall()]

    def create(self, dog: Dog, kennel_id: int) -> Dog:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """
                    INSERT INTO dogs(name, date_of_birth, breed, kennel_id) VALUES (%s, %s, %s, %s)
                """
                cur.execute(query, (dog.name, dog.date_of_birth, dog.breed, kennel_id,))
            except Exception as e:
                print(e)
                self._connection.rollback()
            finally:
                self._connection.commit()
        return dog

    def delete(self, dog):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            cur.execute("""DELETE FROM dogs WHERE name = %s""", (dog.name,))
            self._connection.commit()


