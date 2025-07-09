from pydantic import ValidationError
from src.models.analytics.weekly_stats import WeeklyStats

def parse_weekly_stats(row: dict) -> WeeklyStats:
    try:
        return WeeklyStats.model_validate(row)
    except ValidationError as e:
        print(f"Invalid weekly stats row: {row} | Error: {e}")
        raise