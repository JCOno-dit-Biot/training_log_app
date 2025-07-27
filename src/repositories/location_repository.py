from src.models.location import Location
#from src.parsers.runner_parser import parse_runner_from_row
from .abstract_repository import abstract_repository
from typing import List, Optional
from psycopg2.extras import RealDictCursor

class location_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

    def get_by_name(self, location_name: str) -> Optional[Location]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            id,
                            name
                        FROM 
                            activity_locations 
                        WHERE 
                            LOWER(name) = %s
                        """
            cur.execute(query, (location_name.lower(),))
            row = cur.fetchone()
        if row:
            sport = Location(**row)
            return sport
        return None

    def get_all(self) -> List[Location]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ 
                       SELECT 
                            id,
                            name
                        FROM 
                            activity_locations
                        ORDER BY 
                            name ASC;
                    """
            cur.execute(query)
            sports = []
            for row in cur.fetchall():
                sport = Location(**row)
                sports.append(sport)

            return sports
            
    def get_by_id(self, id: int) -> Optional[Location]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            id,
                            name
                        FROM 
                            activity_locations
                        WHERE 
                            id = %s
                        """
            cur.execute(query, (id,))
            row = cur.fetchone()

        return Location(**row)
    
    def create(self, location_name: str):
         with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """ INSERT INTO activity_locations(name) VALUES (%s) RETURNING id;"""
                cur.execute(query, (location_name.lower()))
                location_id = cur.fetchone()['id']
                self._connection.commit()
                return location_id
            except Exception as e:
                print(e)
                self._connection.rollback()
    
    def delete(self, id: int):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """DELETE FROM activity_location WHERE id = %s;"""
                cur.execute(query, (id,))
                self._connection.commit()
                return cur.rowcount > 0
            except Exception as e:
                self._connection.rollback()
                return False

    def update(self, update_name: str, id: int):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """ UPDATE activity_location
                            SET name = %s
                            WHERE id = %s;
                        """
                cur.execute(query, (update_name, id,))
                self._connection.commit()
                return cur.rowcount > 0
            except Exception as e:
                print(f"Could not update entry {id}: {e}")
                self._connection.rollback()
                return False
    
    def get_total_count(self):
        return super().get_total_count()
