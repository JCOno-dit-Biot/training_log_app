from src.models import Dog, Kennel, DogWeightEntry
from datetime import date
from typing import List
from src.repositories.abstract_repository import abstract_repository
from psycopg2.extras import RealDictCursor
from src.parsers.weight_parser import parse_weight_from_row


class weight_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

    def get_by_id(self, id: int) -> DogWeightEntry:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """
                    SELECT 
                        w.id, w.date, w.weight,
                        d.id as dog_id, d.name, d.date_of_birth, d.breed, 
                        kennels.name as kennel_name
                    FROM 
                        weight_entries w
                    JOIN 
                        dogs d ON d.id = w.dog_id
                    JOIN 
                        kennels ON d.kennel_id = kennels.id
                    WHERE 
                        w.id = %s
                """
            cur.execute(query, (id,))
            row = cur.fetchone()
            return parse_weight_from_row(row)

    def get_all(self, dog_id: int) -> List[DogWeightEntry]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """
                    SELECT 
                        w.id, w.date, w.weight,
                        d.id as dog_id, d.name, d.date_of_birth, d.breed, 
                        kennels.name as kennel_name
                    FROM 
                        weight_entries w
                    JOIN 
                        dogs d ON d.id = w.dog_id
                    JOIN 
                        kennels ON d.kennel_id = kennels.id
                    WHERE 
                        w.dog_id = %s
                """
            cur.execute(query, (dog_id,))
            rows = cur.fetchall()
            weight_entries = []
            for row in rows:
                weight_entries.append(
                    parse_weight_from_row(row)
                )
        return weight_entries

    def get_by_name(self, name):
        return super().get_by_name(name)
    
    def create(self, weigth_entry: DogWeightEntry) -> int:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                cur.execute("""INSERT INTO weight_entries (dog_id, date, weight) VALUES (%s, %s, %s) RETURNING id;""",
                            (weigth_entry.dog.id, weigth_entry.date, weigth_entry.weight) )
                entry_id = cur.fetchone()['id']
            except Exception as e:
                print(e)
                self._connection.rollback()
            finally:
                self._connection.commit()
        return entry_id


    def delete(self, weigth_entry: DogWeightEntry):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            cur.execute("""DELETE FROM weight_entries WHERE id = %s; """,
                         (weigth_entry.id,))
            self._connection.commit()

    def update(self, obj):
        return super().update(obj)