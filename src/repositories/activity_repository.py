from src.models.runner import Runner
from src.models.activity import Activity, ActivityLaps
from src.parsers.activity_parser import parse_activity_from_row
from .abstract_repository import abstract_repository
from typing import List, Optional
from psycopg2.extras import RealDictCursor

class activity_repository(abstract_repository):

    def __init__(self, connection):
        self._connection = connection

    def get_by_name(self, name):
        return super().get_by_name(name)
    
    def get_all(self, kennel_id: int) -> List[Runner]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """ 
                        SELECT 
                            a.*, 
                            r.name AS runner_name,
                            s.name AS sport_name,
                            k.name AS kennel_name,
                            s.type AS sport_type,
                            k.id as kennel_id,
                            w.temperature, w.humidity, w.condition,
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
                        WHERE r.kennel_id = %s
                        GROUP BY 
                        a.id, a.runner_id, a.sport_id, a.timestamp, a.notes, a.location,
                        a.workout, a.speed, a.distance,
                        r.name, s.name, s.type, k.name, k.id,
                        w.temperature, w.humidity, w.condition
                    """
            cur.execute(query, (kennel_id,))
            activities = []
            for row in cur.fetchall():
                activity = parse_activity_from_row(row)
                activities.append(activity)

            return activities
            
    def get_by_id(self, activity_id: int) -> Optional[Activity]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """
                        SELECT 
                            a.*, 
                            r.name AS runner_name,
                            s.name AS sport_name,
                            s.type AS sport_type,
                            k.name AS kennel_name,
                            k.id as kennel_id,
                            w.temperature, w.humidity, w.condition,
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
                        WHERE a.id = %s
                        GROUP BY 
                        a.id, a.runner_id, a.sport_id, a.timestamp, a.notes, a.location,
                        a.workout, a.speed, a.distance,
                        r.name, s.name, s.type, k.name, k.id, w.temperature, w.humidity, w.condition
                    """
            cur.execute(query, (activity_id,))
            row = cur.fetchone()
        return parse_activity_from_row(row)
    
    def create(self, activity: Activity) -> int:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            try:
                query = """
                    INSERT INTO activities (
                        runner_id, sport_id, timestamp, notes, location, workout, speed, distance
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """
                cur.execute(query, (
                    activity.runner.id,
                    activity.sport.id,
                    activity.timestamp,
                    activity.notes,
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
                    """, (activity_id, dog.id, dog.rating)) #this assumes dogs have their id set

                if len(activity.laps) > 0:
                    for lap in activity.laps:
                        cur.execute("""
                            INSERT INTO workout_laps (activity_id, lap_number, lap_time, lap_distance, speed)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (activity_id, lap.lap_number, lap.lap_time_delta, lap.lap_distance, lap.speed,))

            # add weather here
            except Exception as e:
                print(e)
                self._connection.rollback()
            finally:
                self._connection.commit()
        return activity_id

    def delete(self, activity: Activity):
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            # If the activity was a workout, delete all associated laps
            if activity.workout:
                cur.execute("""DELETE FROM workout_laps WHERE activity_id = %s;""", (activity.id,))

            # Delete activity from dog activity table first
            cur.execute("""DELETE FROM activity_dogs WHERE activity_id = %s;""", (activity.id,))

            # Finally delete the main activity
            cur.execute("""DELETE FROM activities WHERE id = %s; """,
                         (activity.id,))
            self._connection.commit()


