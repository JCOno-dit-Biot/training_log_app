from src.models.sport import Sport
#from src.parsers.runner_parser import parse_runner_from_row
from .abstract_repository import abstract_repository
from typing import List, Optional
from psycopg2.extras import RealDictCursor

class sport_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

    def get_by_name(self, sport_name: str) -> Optional[Sport]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            id,
                            name,
                            type,
                            display_mode,
                            description
                        FROM 
                            sports
                        WHERE 
                            LOWER(name) = %s
                        """
            cur.execute(query, (sport_name.lower(),))
            row = cur.fetchone()
        if row:
            sport = Sport(**row)
            return sport
        return None

    def get_all(self) -> List[Sport]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ 
                       SELECT 
                            id,
                            name,
                            type,
                            display_mode,
                            description
                        FROM 
                            sports
                    """
            cur.execute(query,)
            sports = []
            for row in cur.fetchall():
                sport = Sport(**row)
                sports.append(sport)

            return sports
            
    def get_by_id(self, id: int) -> Optional[Sport]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ SELECT 
                            id,
                            name,
                            type,
                            display_mode,
                            description
                        FROM 
                            sports
                        WHERE 
                            id = %s
                        """
            cur.execute(query, (id,))
            row = cur.fetchone()

        return Sport(**row)
    
    def create(self):
        raise NotImplementedError
    
    def delete(self):
        raise NotImplementedError

