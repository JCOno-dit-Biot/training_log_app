from typing import List, Optional
from datetime import datetime, timedelta, timezone
from psycopg2.extras import RealDictCursor
from src.models.analytics import WeeklyStats, AnalyticSummary, DogCalendarDay
from src.models import Filter
from src.parsers.analytic_parser import parse_weekly_stats, parse_dog_calendar, parse_summary_from_rows
from src.utils.db import build_time_window_clause
from src.utils.calculation_helpers import get_number_weeks
from datetime import datetime

class analytics_repository():

    def __init__(self, connection):
        self._connection = connection

    def get_weekly_stats(self, kennel_id: int, anchor_ts: datetime) -> list[WeeklyStats]:

        # Need two weeks, so:
        # for exclusive upper bound

        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = """
                    WITH bounds AS (
                    -- anchor_ts can be any timestamp within the "current" week you want to include
                    SELECT
                        DATE_TRUNC('week', %(anchor_ts)s)                 AS this_week_start,  -- Monday 00:00
                        DATE_TRUNC('week', %(anchor_ts)s) - INTERVAL '1 week' AS prev_week_start,
                        DATE_TRUNC('week', %(anchor_ts)s) + INTERVAL '1 week' AS next_week_start  -- exclusive upper bound
                    ),
                    weeks AS (
                    -- generate exactly the two week starts you want to report on
                    SELECT prev_week_start AS week_start FROM bounds
                    UNION ALL
                    SELECT this_week_start FROM bounds
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
                    JOIN bounds b ON a.timestamp >= b.prev_week_start     -- half-open interval
                                AND a.timestamp <  b.next_week_start     -- covers prev week + current week fully
                    GROUP BY ad.dog_id, week_start
                    )
                    SELECT
                    dw.dog_id,
                    dw.week_start,
                    COALESCE(wm.total_distance_km, 0) AS total_distance_km,
                    COALESCE(
                        LAG(total_distance_km) OVER (PARTITION BY dw.dog_id ORDER BY dw.week_start),
                        0
                    ) AS previous_week_distance_km,
                    wm.average_rating AS average_rating,
                    LAG(average_rating) OVER (PARTITION BY dw.dog_id ORDER BY dw.week_start)
                        AS previous_week_average_rating
                    FROM dogs_weeks dw
                    LEFT JOIN weekly_mileage wm
                    ON wm.dog_id = dw.dog_id
                    AND wm.week_start = dw.week_start
                    ORDER BY dw.dog_id, dw.week_start DESC;
                  
                    """
            params = {
                "anchor_ts": anchor_ts,
                "kennel_id": kennel_id
            }
            cur.execute(query, params)
            rows = cur.fetchall()
            print(rows)

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
    
    def get_analytic_summary_per_dog(self, filters: Filter, kennel_id: int) -> AnalyticSummary:

        where_clause, values = build_time_window_clause(filters, "a", "timestamp")

        with self._connection.cursor(cursor_factory= RealDictCursor) as cur:
            query = f"""
                    SELECT
                        ad.dog_id          AS dog_id,
                        d.name        AS name,
                        SUM(a.distance)                AS total_distance_km,
                        SUM(a.distance / NULLIF(a.speed, 0)) AS total_duration_hours,
                        COUNT(*)                          AS session_count,
                        COALESCE(SUM(ad.rating), 0)        AS rating_sum,
                        MIN(a.timestamp) AS min_date, -- Needed for freq calc in case user does not specify time range
                        MAX(a.timestamp) AS max_date
                        FROM activities a
                        LEFT JOIN activity_dogs ad ON ad.activity_id = a.id
                        JOIN dogs d ON d.id = ad.dog_id
                        JOIN kennels k ON d.kennel_id = k.id
                        WHERE kennel_id = %s
                        AND a.speed IS NOT NULL 
                        AND a.speed > 0
                        AND {where_clause}
                        GROUP BY ad.dog_id, d.name;
                    """
            values.insert(0, kennel_id)
            cur.execute(query, values)
            rows = cur.fetchall()

            if rows is None:
                return None
            
            if filters.start_date and filters.end_date:
                min_d, max_d = filters.start_date, filters.end_date
            else:
                min_d = min(r['min_date'] for r in rows if r['min_date'])
                max_d = max(r['max_date'] for r in rows if r['max_date'])

            weeks = get_number_weeks(min_d,max_d)

            return parse_summary_from_rows(rows, weeks)

            

            