from pydantic import ValidationError
from collections import defaultdict
from src.models.analytics.weekly_stats import WeeklyStats
from src.models.analytics.dog_calendar_day import DogCalendarDay




def parse_weekly_stats(rows: list[dict]) -> list[WeeklyStats]:
    latest_by_dog = {}

    for row in rows:
        dog_id = row["dog_id"]
        if dog_id not in latest_by_dog:
            latest_by_dog[dog_id] = WeeklyStats.model_validate(row)

    return list(latest_by_dog.values())

def parse_dog_calendar(rows: list[dict]) -> list[DogCalendarDay]:
    grouped = defaultdict(set)
    for row in rows:
        grouped[row["date"]].add(row["dog_id"])

    return [
        DogCalendarDay(date=dt, dog_ids=dog_ids)
        for dt, dog_ids in sorted(grouped.items())
    ]