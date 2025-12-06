import pytest
from src.repositories.analytics_repository import analytics_repository
from src.models.common import Filter
from src.models import SportType
from src.models.analytics import Trend
from datetime import date, timezone, datetime, timedelta
from psycopg2.extras import RealDictCursor

@pytest.fixture
def analytics_repo(test_db_conn):
    return analytics_repository(test_db_conn)

def test_dog_analytics_summary(analytics_repo):
    filters = Filter(start_date='2025-04-01', end_date='2025-04-05')

    summary = analytics_repo.get_analytic_summary_per_dog(filters, 2)
    assert len(summary.per_dog) == 2
    assert [dog.name in ('Milou', 'Fido') for dog in summary.per_dog]
    assert summary.total_distance_km == 51.4
    assert summary.avg_rating == pytest.approx(7.714, rel=1e-3)
    assert summary.per_dog[0].avg_frequency_per_week  == pytest.approx(4)
    assert summary.per_dog[1].total_duration_hours == pytest.approx(1.328, rel=1e-3)
    
def test_dog_analytics_summary_no_range(analytics_repo):
    summary = analytics_repo.get_analytic_summary_per_dog(Filter(), 1)
    assert len(summary.per_dog) == 1
    assert [dog.name in ('Idefix') for dog in summary.per_dog]
    assert summary.total_distance_km == 2.1
    assert summary.per_dog[0].total_distance_km == 2.1
    
def test_activity_heat_map(analytics_repo):
    filters = Filter(start_date='2025-04-01', end_date='2025-04-05')
    location_heat_map = analytics_repo.get_activity_heat_map(filters,2)
    assert len(location_heat_map) == 3
    assert [loc.latitude is not None and loc.longitude is not None for loc in location_heat_map]
    assert location_heat_map[0].day_count == 3
    assert location_heat_map[1].day_count == 1
    assert location_heat_map[2].day_count == 1
    
def test_activity_heat_map_no_range(analytics_repo):
    location_heat_map = analytics_repo.get_activity_heat_map(Filter(),1)
    assert len(location_heat_map) == 1
    assert [loc.latitude is not None and loc.longitude is not None for loc in location_heat_map]
    assert location_heat_map[0].day_count == 1

def test_sport_count(analytics_repo):
    filters = Filter(start_date='2025-04-01', end_date='2025-04-05')
    sport_count = analytics_repo.get_sport_counts(filters, 2)
    assert len(sport_count)==2
    assert sport_count[0].activity_count == 7
    assert sport_count[1].activity_count == 1
    assert sport_count[0].sport_name == "Canicross"
    assert sport_count[0].sport_type == SportType("dryland")
    assert sport_count[1].sport_name == "Bikejoring"
    assert sport_count[1].sport_type == SportType("dryland")


def test_sport_count_no_range(analytics_repo):
    sport_count = analytics_repo.get_sport_counts(Filter(), 1)
    assert len(sport_count)==1
    assert sport_count[0].activity_count == 1

def test_analytics_summary_returns_none(analytics_repo):
    summary_none = analytics_repo.get_analytic_summary_per_dog(Filter(end_date="2023-12-01"),2)
    assert summary_none is None

def test_dog_running_per_day(analytics_repo):
    dog_days = analytics_repo.get_dog_running_per_day(
        '2025-04-01', '2025-04-06', 2
    )
    assert len(dog_days) == 5
    assert dog_days[2].dog_ids == [1]
    assert len(dog_days[0].dog_ids) == 2
    assert all(dog_id in {1,2} for day in dog_days for dog_id in day.dog_ids)

def test_weekly_stats(analytics_repo):
    weekly_stats = analytics_repo.get_weekly_stats(2, datetime(2025,4,7))
    assert len(weekly_stats) == 2
    dog_1 = weekly_stats[0]
    dog_2 = weekly_stats[1]
    assert dog_1.week_start == date(2025,4,7)
    assert dog_1.total_distance_km == 4.1
    assert dog_1.previous_week_distance_km == 36
    assert dog_1.trend_distance == Trend.down
    assert dog_2.average_rating == 8
    assert dog_2.trend_rating == Trend.up
