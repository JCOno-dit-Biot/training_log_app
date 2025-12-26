from src.utils.db import build_conditions, build_time_window_clause
import pytest
from src.models import WeightQueryFilter, ActivityQueryFilters, Filter
from datetime import date

@pytest.fixture
def weight_query_filter():
    return WeightQueryFilter(
        start_date = '2025-01-01',
        end_date = '2025-01-30',
        dog_id = 2
    )

@pytest.fixture
def activity_query_filter():
    return ActivityQueryFilters(
        start_date = '2025-01-01',
        end_date = '2025-01-30',
        dog_id = 1,
        sport_id = 2,
        runner_id = 1,
        workout = False,
        location = 'Park'
    )

# Define the tests
def test_build_conditions_with_weight_filter(weight_query_filter):
    clause, values = build_conditions(weight_query_filter)
    assert "w.date >= %s" in clause
    assert "w.date <= %s" in clause
    assert "w.dog_id = %s" in clause
    assert values == [2, date(2025, 1, 1), date(2025, 1, 30)]

def test_build_conditions_with_activity_filter(activity_query_filter):
    clause, values = build_conditions(activity_query_filter)
    assert "a.timestamp >= %s" in clause
    assert "a.timestamp <= %s" in clause
    assert "ad.dog_id = %s" in clause
    assert "a.sport_id = %s" in clause
    assert "a.runner_id = %s" in clause
    assert "a.workout = %s" in clause
    assert "a.location ILIKE %s" in clause
    assert values == [
        2,
        1,
        False,
        1,
        "%Park%",
        date(2025, 1, 1),
        date(2025, 1, 30)
    ]

def test_build_time_window_filter():
    filters = Filter(start_date='2025-01-02',
                     end_date= '2025-01-31'
                     )
    clause, values = build_time_window_clause(filters, "a", "timestamp")
    assert "a.timestamp >= %s" in clause
    assert "a.timestamp < %s" in clause
    assert values == [
        date(2025,1,2),
        date(2025,1,31)
    ]
