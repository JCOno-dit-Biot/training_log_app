from pydantic import ValidationError
from collections import defaultdict
from src.models.analytics.weekly_stats import WeeklyStats
from src.models.analytics.dog_calendar_day import DogCalendarDay




def parse_weekly_stats(row: dict) -> WeeklyStats:
    try:
        return WeeklyStats.model_validate(row)
    except ValidationError as e:
        print(f"Invalid weekly stats row: {row} | Error: {e}")
        raise

def parse_dog_calendar(rows: list[dict]) -> list[DogCalendarDay]:
    grouped = defaultdict(set)
    for row in rows:
        grouped[row["date"]].add(row["dog_id"])

    return [
        DogCalendarDay(date=dt, dog_ids=dog_ids)
        for dt, dog_ids in sorted(grouped.items())
    ]