from typing import List, Optional
from datetime import datetime, timedelta, timezone
from psycopg2.extras import RealDictCursor
from src.models.analytics.weekly_stats import WeeklyStats
from src.models.analytics.dog_calendar_day import DogCalendarDay
from src.parsers.analytic_parser import parse_weekly_stats, parse_dog_calendar

class analytics_repository():

    def __init__(self, connection):
        self._connection = connection

    def get_weekly_stats(self, kennel_id: int) -> list[WeeklyStats]:
        #calculate the time range automatically, needs 14 days to get prior week data
        end_date = datetime.now(timezone.utc).date()
        start_date = end_date - timedelta(days=14)

        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """
                    WITH weeks AS (
                        SELECT generate_series(
                            DATE_TRUNC('week', %(start_date)s),
                            DATE_TRUNC('week', %(end_date)s),
                            interval '1 week'
                        ) AS week_start
                    ),
                    dogs_weeks AS (
                        SELECT d.id AS dog_id, w.week_start
                        FROM dogs d
                        CROSS JOIN weeks w
                        WHERE d.kennel_id = %(kennel_id)s
                    ),
                    weekly_mileage AS (
                    SELECT
                        ad.dog_id,
                        DATE_TRUNC('week', a.timestamp) AS week_start,
                        SUM(a.distance) AS total_distance_km,
                        AVG(ad.rating) AS average_rating 
                    FROM activity_dogs ad
                    JOIN activities a ON ad.activity_id = a.id
                    WHERE a.timestamp BETWEEN %(start_date)s AND %(end_date)s
                    GROUP BY ad.dog_id, week_start
                    )
                    SELECT
                        dw.dog_id,
                        dw.week_start,
                        COALESCE(wm.total_distance_km, 0) AS total_distance_km,
                        COALESCE(LAG(total_distance_km) OVER (
                            PARTITION BY dw.dog_id ORDER BY dw.week_start
                        ), 0) AS previous_week_distance_km,
                        COALESCE(wm.average_rating, 0) AS average_rating,
                        COALESCE(LAG(average_rating) OVER (
                            PARTITION BY dw.dog_id ORDER BY dw.week_start
                        ), 0) AS previous_week_average_rating
                    FROM dogs_weeks dw
                    LEFT JOIN weekly_mileage wm ON
                    dw.dog_id = wm.dog_id AND
                    dw.week_start = wm.week_start
                    ORDER BY dw.dog_id, dw.week_start DESC                  
                    """
            params = {
                "start_date": start_date,
                "end_date": end_date,
                "kennel_id": kennel_id
            }
            cur.execute(query, params)
            rows = cur.fetchall()

        return parse_weekly_stats(rows)
    
    def get_dog_running_per_day(self, start_date, end_date) -> list[DogCalendarDay]:
        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """
                    SELECT
                        a.timestamp::date AS date,
                        ad.dog_id
                    FROM activities a
                    JOIN activity_dogs ad ON ad.activity_id = a.id
                    WHERE a.timestamp >= %(start_date)s
                    AND a.timestamp < %(end_date)s
                    """
        
            params = {
                    "start_date": start_date,
                    "end_date": end_date,
                }
            cur.execute(query, params)

            rows = cur.fetchall()

        return parse_dog_calendar(rows)