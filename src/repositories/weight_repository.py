from src.models import Dog, Kennel, DogWeightEntry, WeightQueryFilter, DogWeightIn, DogWeightLatest
from datetime import date
from typing import List
from src.repositories.abstract_repository import abstract_repository
from psycopg2.extras import RealDictCursor
from src.parsers.weight_parser import parse_weight_from_row
from src.utils.db import build_conditions

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

    def get_all(self, kennel_id: int, filters: WeightQueryFilter) -> List[DogWeightEntry]:

        where_clause, values = build_conditions(filters)
        
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = f"""
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
                        d.kennel_id = %s AND {where_clause}
                    ORDER BY date DESC
                """
            values.insert(0, kennel_id)
            cur.execute(query, values)
            rows = cur.fetchall()
            weight_entries = []
            for row in rows:
                weight_entries.append(
                    parse_weight_from_row(row)
                )
        return weight_entries
    
    def get_latest(self, kennel_id: int):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = f"""
                    WITH RankedEntries AS (
                        SELECT w.id, w.dog_id, w.date, w.weight,
                        w.weight - LAG(w.weight) OVER (PARTITION BY w.dog_id ORDER BY w.date) as weight_change,
                        ROW_NUMBER() OVER (PARTITION BY w.dog_id ORDER BY date DESC) as rn
                    FROM 
                        weight_entries w
                    JOIN 
                        dogs d ON d.id = w.dog_id
                    JOIN 
                        kennels ON d.kennel_id = kennels.id
                    WHERE 
                        d.kennel_id = %s 
                    )
                    SELECT dog_id, date as latest_update, weight as latest_weight, weight_change
                    FROM RankedEntries
                    WHERE rn = 1
                """
            cur.execute(query, (kennel_id,))
            rows = cur.fetchall()
            return [DogWeightLatest(**row) for row in rows]

    def get_total_count(self, kennel_id, filters):
        where_clause, values = build_conditions(filters)
        try:
            print(where_clause)
            with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
                #must count dictinct because of the join on activity dogs
                query = f"""
                SELECT COUNT(*) FROM weight_entries w
                JOIN 
                    dogs d ON d.id = w.dog_id
                JOIN 
                    kennels ON d.kennel_id = kennels.id
                WHERE 
                    d.kennel_id = %s AND {where_clause};
                """
                values.insert(0, kennel_id)

                cur.execute(query, values)
                count = cur.fetchone()["count"]
            return count
        except Exception as e:
            print(f"Select failed: {e}")
            self._connection.rollback()
            return None


    def get_by_name(self, name):
        return super().get_by_name(name)
    
    def create(self, weigth_entry: DogWeightIn, dog_id: int) -> int:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                cur.execute("""INSERT INTO weight_entries (dog_id, date, weight) VALUES (%s, %s, %s) RETURNING id;""",
                            (dog_id, weigth_entry.date, weigth_entry.weight) )
                entry_id = cur.fetchone()['id']
                self._connection.commit()
            except Exception as e:
                print(e)
                self._connection.rollback()
        return entry_id


    def delete(self, weight_id: int):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                cur.execute("""DELETE FROM weight_entries WHERE id = %s; """,
                            (weight_id,))
                self._connection.commit()
                return cur.rowcount > 0
            except Exception as e:
                self._connection.rollback()
                return False
                

    def update(self, id, fields: dict):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                keys = list(fields.keys())
                values = list(fields.values())

                set_clause = ", ".join([f"{key} = %s" for key in keys])

                query = f"""UPDATE weight_entries 
                                SET {set_clause}
                                WHERE id = %s"""
                
                #add entry id
                values.append(id)
                cur.execute(query, values)
                self._connection.commit()
                return cur.rowcount > 0
            except Exception as e:
                print(f"Could not update entry {id}: {e}")
                self._connection.rollback()
                return False
