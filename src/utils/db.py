import psycopg2
from ..config import settings
from fastapi import Request
from urllib.parse import urlencode
from src.models.common import Filter, WeightQueryFilter, ActivityQueryFilters

def get_connection() -> psycopg2.extensions.connection:
    db_url = (
        settings.TEST_DATABASE_URL
        if settings.ENV == "test"
        else settings.DATABASE_URL
    )
    return psycopg2.connect(db_url)


def build_conditions(filters: WeightQueryFilter | ActivityQueryFilters):
    conditions = []
    values = []

    if filters.start_date:
        conditions.append("a.timestamp >= %s")
        values.append(filters.start_date)

    if filters.end_date:
        conditions.append("a.timestamp <= %s")
        values.append(filters.end_date)

    if filters.dog_id:
        conditions.append("ad.dog_id in %s")
        values.append(filters.dog_id)

    if isinstance(filters, ActivityQueryFilters):
        if filters.sport_id:
            conditions.append("a.sport_id = %s")
            values.append(filters.sport_id)

        if filters.runner_id:
            conditions.append("a.runner_id = %s")
            values.append(filters.runner_id)
        
        if filters.workout:
            conditions.append("a.workout = %s")
            values.append(filters.workout)
        
        # case insensitive and partial match
        if filters.location:
            conditions.append("a.location ILIKE %s")
            values.append(f"%{filters.location}%") 

    where_clause = " AND ".join(conditions) if conditions else "TRUE"
    return where_clause, values
