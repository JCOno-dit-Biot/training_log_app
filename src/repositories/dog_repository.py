from src.models.dog import Dog
from src.models.kennel import Kennel
from src.parsers.dog_parser import parse_dog_from_row
from .abstract_repository import EntityRepository
from typing import List, Optional
from psycopg2.extras import RealDictCursor
from src.utils.db import sanitize_update_dict, build_update_set_clause
from src.constants import UPDATE_ALLOWED_FIELDS_DOG

class dog_repository(EntityRepository):

    def __init__(self, connection):
        self._connection = connection

    def exists_for_kennel(self, dog_id: int, kennel_id: int) -> bool:
        with self._connection.cursor() as cur:
            cur.execute(
                """
                SELECT 1
                FROM dogs
                WHERE id = %s
                  AND kennel_id = %s;
                """,
                (dog_id, kennel_id),
            )
            return cur.fetchone() is not None
        
    # dog names are unique per kennel in the database but this method could return multiple dogs
    def get_by_name(self, dog_name: str) -> List[Dog]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            dogs.id,
                            dogs.name,
                            date_of_birth, 
                            breed,
                            color,
                            k.id as kennel_id,
                            k.name as kennel_name,
                            image_path as image_url
                        FROM 
                            dogs 
                        JOIN 
                            kennels k
                        ON
                            dogs.kennel_id = k.id
                        LEFT JOIN images
                            ON images.dog_id = dogs.id
                        WHERE 
                            dogs.name = %s
                        AND 
                            images.is_active=True 
                        """
            cur.execute(query, (dog_name,))
            dogs = []
            for row in cur.fetchall():
                dog = parse_dog_from_row(row)
                dogs.append(dog)
            return dogs
  
    # This method can only return a single entry
    def get_by_id(self, id: int) -> Optional[Dog]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            dogs.id,
                            dogs.name,
                            date_of_birth, 
                            breed, 
                            color,
                            k.id as kennel_id,
                            k.name as kennel_name,
                            image_path as image_url
                        FROM 
                            dogs 
                        JOIN 
                            kennels k
                        ON
                            dogs.kennel_id = k.id
                        LEFT JOIN images
                            ON images.dog_id = dogs.id
                        WHERE 
                            dogs.id = %s
                        AND 
                            images.is_active=True 
                        """
            cur.execute(query, (id,))
            row = cur.fetchone()

        return parse_dog_from_row(row)


    def get_all(self, kennel_id: int) -> List[Dog]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ 
                        SELECT 
                            dogs.id,
                            dogs.name,
                            date_of_birth, 
                            breed,
                            color,
                            k.id as kennel_id,
                            k.name as kennel_name,
                            images.image_path as image_url
                        FROM 
                            dogs 
                        JOIN 
                            kennels k
                        ON
                            dogs.kennel_id = k.id
                        LEFT JOIN images
                            ON images.dog_id = dogs.id
                        WHERE 
                            kennel_id = %s AND images.is_active=True;
                        """
            cur.execute(query, (kennel_id,))
            dogs = []
            for row in cur.fetchall():
                dog = parse_dog_from_row(row)
                dogs.append(dog)
            return dogs

    def create(self, dog: Dog, kennel_id: int) -> Dog:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """
                    INSERT INTO dogs(name, date_of_birth, breed, kennel_id) VALUES (%s, %s, %s, %s) RETURNING id
                """
                cur.execute(query, (dog.name, dog.date_of_birth, dog.breed, kennel_id,))
                row = cur.fetchone()
            except Exception as e:
                print(e)
                self._connection.rollback()
                
            finally:
                self._connection.commit()
            return row['id']

    def delete(self, dog):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            cur.execute("""DELETE FROM dogs WHERE name = %s AND kennel_id = (SELECT id FROM kennels WHERE name = %s);""",
                         (dog.name, dog.kennel.name))
            self._connection.commit()

    def update(self, fields: dict, dog_id: int):

        # Sanitize data entry at repo level
        # Sanitize data entry at repo level
        fields = sanitize_update_dict(fields, UPDATE_ALLOWED_FIELDS_DOG)

        if not fields:
            return False
        
        set_clause, values = build_update_set_clause(fields)
        query = f"""
            UPDATE dogs
            SET {set_clause}
            WHERE id = %s
        """

        values.append(dog_id)
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