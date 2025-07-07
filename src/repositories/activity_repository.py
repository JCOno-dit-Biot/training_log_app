from src.models.runner import Runner
from src.models.activity import Activity, ActivityLaps, ActivityCreate, ActivityDogsCreate
from src.models.weather import Weather
from src.parsers.activity_parser import parse_activity_from_row
from .abstract_repository import abstract_repository
from typing import List, Optional
from psycopg2.extras import RealDictCursor
from src.utils.pagination import paginate_results
from src.utils.db import build_conditions

class activity_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

    def get_by_name(self, name):
        return super().get_by_name(name)
    
    def get_all(self, kennel_id: int, filters, limit: int = 10, offset: int = 0) -> List[Runner]:

        where_clause, values = build_conditions(filters)
        try:
            with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
                query = f""" 
                        SELECT 
                            a.*, 
                            r.name AS runner_name,
                            r.id AS runner_id,
                            s.name AS sport_name,
                            k.name AS kennel_name,
                            s.type AS sport_type,
                            k.id as kennel_id,
                            w.temperature, w.humidity, w.condition,
                            COUNT(ac.id) as comment_count,
                            -- Aggregate dogs
                            json_agg(DISTINCT jsonb_build_object(
                                'id', d.id,
                                'name', d.name,
                                'breed', d.breed,
                                'date_of_birth', d.date_of_birth,
                                'rating', ad.rating
                            )) FILTER (WHERE d.id IS NOT NULL) AS dogs,

                            -- Aggregate laps (only if workout is true)
                            json_agg(DISTINCT jsonb_build_object(
                                'lap_number', wl.lap_number,
                                'speed', wl.speed,
                                'lap_time', wl.lap_time,
                                'lap_distance', wl.lap_distance
                            )) FILTER (WHERE wl.id IS NOT NULL) AS laps
                        FROM activities a
                        JOIN runners r ON a.runner_id = r.id
                        JOIN sports s ON a.sport_id = s.id
                        JOIN kennels k ON r.kennel_id = k.id
                        LEFT JOIN activity_dogs ad ON a.id = ad.activity_id
                        LEFT JOIN dogs d ON ad.dog_id = d.id
                        LEFT JOIN workout_laps wl ON wl.activity_id = a.id
                        LEFT JOIN weather_entries w ON w.activity_id = a.id
                        LEFT JOIN activity_comments ac ON ac.activity_id = a.id
                        WHERE r.kennel_id = %s AND {where_clause}
                        GROUP BY 
                        a.id, a.runner_id, a.sport_id, a.timestamp, a.location,
                        a.workout, a.speed, a.distance,
                        r.name, r.id, s.name, s.type, k.name, k.id,
                        w.temperature, w.humidity, w.condition
                        ORDER BY a.timestamp DESC
                        LIMIT %s OFFSET %s;
                    """
            
                values.insert(0, kennel_id)
                values.extend([limit,offset])

                cur.execute(query, values)
                activities = []
                for row in cur.fetchall():
                    activity = parse_activity_from_row(row)
                    activities.append(activity)

            return activities
        except Exception as e:
            print(f"Select failed: {e}")
            self._connection.rollback()
            return None
    
    def get_by_id(self, activity_id: int) -> Optional[Activity]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """
                        SELECT 
                            a.*, 
                            r.name AS runner_name,
                            r.id AS runner_id,
                            s.name AS sport_name,
                            s.type AS sport_type,
                            k.name AS kennel_name,
                            k.id as kennel_id,
                            w.temperature, w.humidity, w.condition,
                            COUNT(DISTINCT ac.id) as comment_count,
                            -- Aggregate dogs
                            json_agg(DISTINCT jsonb_build_object(
                                'id', d.id,
                                'name', d.name,
                                'breed', d.breed,
                                'date_of_birth', d.date_of_birth,
                                'rating', ad.rating
                            )) FILTER (WHERE d.id IS NOT NULL) AS dogs,

                            -- Aggregate laps (only if workout is true)
                            json_agg(DISTINCT jsonb_build_object(
                                'lap_number', wl.lap_number,
                                'speed', wl.speed,
                                'lap_time', wl.lap_time,
                                'lap_distance', wl.lap_distance
                            )) FILTER (WHERE wl.id IS NOT NULL) AS laps
                        FROM activities a
                        JOIN runners r ON a.runner_id = r.id
                        JOIN sports s ON a.sport_id = s.id
                        JOIN kennels k ON r.kennel_id = k.id
                        LEFT JOIN activity_dogs ad ON a.id = ad.activity_id
                        LEFT JOIN dogs d ON ad.dog_id = d.id
                        LEFT JOIN workout_laps wl ON wl.activity_id = a.id
                        LEFT JOIN weather_entries w ON w.activity_id = a.id
                        LEFT JOIN activity_comments ac ON ac.activity_id = a.id
                        WHERE a.id = %s
                        GROUP BY 
                        a.id, a.runner_id, a.sport_id, a.timestamp, a.location,
                        a.workout, a.speed, a.distance,
                        r.name, r.id, s.name, s.type, k.name, k.id, w.temperature, w.humidity, w.condition
                    """
            cur.execute(query, (activity_id,))
            row = cur.fetchone()
        return parse_activity_from_row(row)
    
    def get_total_count(self, kennel_id, filters):
        where_clause, values = build_conditions(filters)
        try:
            with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
                #must count dictinct because of the join on activity dogs
                query = f"""
                SELECT COUNT(DISTINCT a.id) FROM activities a
                JOIN runners r ON a.runner_id = r.id
                LEFT JOIN activity_dogs ad ON a.id = ad.activity_id
                WHERE r.kennel_id = %s AND {where_clause};
                """
                values.insert(0, kennel_id)

                cur.execute(query, values)
                count = cur.fetchone()["count"]
            return count
        except Exception as e:
            print(f"Select failed: {e}")
            self._connection.rollback()
            return None
        
    def create(self, activity: ActivityCreate) -> int:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """
                    INSERT INTO activities (
                        runner_id, sport_id, timestamp, location, workout, speed, distance
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """
                cur.execute(query, (
                    activity.runner_id,
                    activity.sport_id,
                    activity.timestamp,
                    activity.location,
                    activity.workout,
                    activity.speed,
                    activity.distance,
                    )
                )
                activity_id = cur.fetchone()['id']

                for dog in activity.dogs:
                    cur.execute("""
                        INSERT INTO activity_dogs (activity_id, dog_id, rating)
                        VALUES (%s, %s, %s)
                    """, (activity_id, dog.dog_id, dog.rating)) #this assumes dogs have their id set, they should from the frontend

                if len(activity.laps) > 0:
                    for lap in activity.laps:
                        cur.execute("""
                            INSERT INTO workout_laps (activity_id, lap_number, lap_time, lap_distance, speed)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (activity_id, lap.lap_number, lap.lap_time_delta, lap.lap_distance, lap.speed,))

                if activity.weather is not None:
                    cur.execute("""
                        INSERT INTO weather_entries (activity_id, temperature, humidity, condition)
                        VALUES (%s, %s, %s, %s)
                    """, (activity_id, activity.weather.temperature, activity.weather.humidity, activity.weather.condition,))
            
            except Exception as e:
                print(e)
                self._connection.rollback()
                return None
            finally:
                self._connection.commit()
                return activity_id
        

    def delete(self, activity_id: int):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                # If the activity was a workout, delete all associated laps
                cur.execute("""DELETE FROM workout_laps WHERE activity_id = %s;""", (activity_id,))

                # Delete activity from dog activity table first
                cur.execute("""DELETE FROM activity_dogs WHERE activity_id = %s;""", (activity_id,))

                # Delete weather entry
                cur.execute("""DELETE FROM weather_entries WHERE activity_id = %s;""", (activity_id,)) 

                # Finally delete the main activity
                cur.execute("""DELETE FROM activities WHERE id = %s; """,
                            (activity_id,))
                self._connection.commit()
                return True
            except Exception as e:
                print(f"[delete activity error]: {e}")
                self._connection.rollback()
                return False

    def update(self, activity_id: int, fields: dict):

        laps = fields.pop("laps", None)
        weather_dict = fields.pop("weather", None)
        dogs = fields.pop("dogs", None)
        pace = fields.pop("pace", None) # pace is not directly saved in the db

        keys = list(fields.keys())
        values = list(fields.values())

        set_clause = ", ".join([f"{key} = %s" for key in keys])

        query = f"""
            UPDATE activities
            SET {set_clause}
            WHERE id = %s
        """
        
        values.append(activity_id)

        try:
            with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
                if keys:
                    cur.execute(query, values)

                # Workout laps update
                if laps:
                    for lap in laps:
                        lap=ActivityLaps(**lap)
                        cur.execute("""
                            UPDATE workout_laps 
                            SET lap_time = %s,
                                lap_distance = %s,
                                speed = %s
                            WHERE activity_id = %s AND lap_number = %s
                        """, (lap.lap_time_delta, lap.lap_distance, lap.speed, activity_id, lap.lap_number))

                # Weather update
                if weather_dict:
                    weather= Weather(**weather_dict)
                    cur.execute("""
                        UPDATE weather_entries
                        SET temperature = %s,
                            humidity = %s,
                            condition = %s
                        WHERE activity_id = %s
                    """, (weather.temperature, weather.humidity, weather.condition, activity_id))

                # Dogs update — e.g., clear and re-insert
                if dogs:
                    
                    cur.execute("DELETE FROM activity_dogs WHERE activity_id = %s", (activity_id,))
                    for dog in dogs:
                        dog = ActivityDogsCreate(**dog)
                        cur.execute("""
                            INSERT INTO activity_dogs (activity_id, dog_id, rating)
                            VALUES (%s, %s, %s)
                        """, (activity_id, dog.dog_id, dog.rating))
                self._connection.commit()
                return cur.rowcount > 0
            
        except Exception as e:
            print(f"[update activity error]: {e}")
            self._connection.rollback()
            return False
        