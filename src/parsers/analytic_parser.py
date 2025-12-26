from pydantic import ValidationError
from collections import defaultdict
from src.models.analytics import WeeklyStats, DogCalendarDay, AnalyticSummaryDog, AnalyticSummary
from datetime import date

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
        DogCalendarDay(date=dt, dog_ids=sorted(dog_ids))
        for dt, dog_ids in sorted(grouped.items())
    ]

def parse_summary_from_rows(rows: list[dict], weeks: float) -> AnalyticSummary:
    per_dog=[]
    total_sessions = 0
    rating_sum_total = 0.0

    for row in rows:
        per_dog.append(
            parse_dog_summary_from_row(row, weeks)
        )
        total_sessions += row['session_count']
        rating_sum_total += row['rating_sum']
    
    total_distance = sum(d.total_distance_km for d in per_dog)
    total_duration = sum(d.total_duration_hours for d in per_dog)
    time_since_last_training = min(d.time_since_last_training for d in per_dog)
    avg_frequency_global = total_sessions / weeks
    avg_rating_global = (rating_sum_total / total_sessions) if total_sessions else 0.0

    return AnalyticSummary(
        total_distance_km=total_distance,
        total_duration_hours=total_duration,
        avg_frequency_per_week=avg_frequency_global,
        avg_rating=avg_rating_global,
        per_dog=per_dog,
        time_since_last_training= time_since_last_training
    )   

def parse_dog_summary_from_row(r: dict, weeks: float) -> AnalyticSummaryDog:
    avg_freq = r['session_count'] / weeks
    avg_rating = (r['rating_sum']/ r['session_count']) if r['session_count'] else 0.0
    time_since_last_training = (date.today() - r['max_date'].date()).days

    return AnalyticSummaryDog(
        dog_id=r['dog_id'],
        name=r['name'],
        total_distance_km=r['total_distance_km'],
        total_duration_hours=r['total_duration_hours'],
        avg_frequency_per_week=avg_freq,
        avg_rating=avg_rating,
        time_since_last_training=time_since_last_training
    )

    