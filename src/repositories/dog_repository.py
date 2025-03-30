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
                            kennels.name as kennel_name
                        FROM 
                            dogs 
                        JOIN 
                            kennels 
                        ON
                            dogs.kennel_id = kennels.id
                        WHERE 
                            dogs.id = %s
                        """
            cur.execute(query, (id,))
            row = cur.fetchone()

        return parse_dog_from_row(row)


    def get_all(self, kennel_id: int) -> List[Dog]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            dogs.id,
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


