from src.models.dog import Dog
from src.models.kennel import Kennel
from src.parsers.dog_parser import parse_dog_from_row
from .abstract_repository import abstract_repository
from typing import List, Optional
from psycopg2.extras import RealDictCursor

class dog_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

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
                        ORDER BY images.created_at DESC 
                        LIMIT 1;
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
                        ORDER BY images.created_at DESC 
                        LIMIT 1;
                        """
            cur.execute(query, (id,))
            row = cur.fetchone()

        return parse_dog_from_row(row)


    def get_all(self, kennel_id: int) -> List[Dog]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ 
                        WITH latest_images AS (
                            SELECT *,
                                    ROW_NUMBER() OVER (PARTITION BY dog_id ORDER BY created_at DESC) AS rn
                            FROM images
                            WHERE dog_id IS NOT NULL
                        )
                        SELECT 
                            dogs.id,
                            dogs.name,
                            date_of_birth, 
                            breed,
                            color,
                            k.id as kennel_id,
                            k.name as kennel_name,
                            latest_images.image_path as image_url
                        FROM 
                            dogs 
                        JOIN 
                            kennels k
                        ON
                            dogs.kennel_id = k.id
                        LEFT JOIN latest_images
                            ON latest_images.dog_id = dogs.id AND latest_images.rn = 1
                        WHERE 
                            kennel_id = %s;
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
        keys = list(fields.keys())
        values = list(fields.values())

        set_clause = ", ".join([f"{key} = %s" for key in keys])

        query = f"""
            UPDATE dogs
            SET {set_clause}
            WHERE id = %s
        """

        values.append(dog_id)
        
        with self._connection.cursor() as cur:
            cur.execute(query, values)
            self._connection.commit()
            return cur.rowcount > 0
           
    

    
    
    def get_total_count(self):
        return super().get_total_count()