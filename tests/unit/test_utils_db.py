from src.utils.db import build_conditions
import pytest
from src.models import WeightQueryFilter, ActivityQueryFilters
from datetime import date

@pytest.fixture
def weight_query_filter():
    return WeightQueryFilter(
        start_date = '2025-01-01',
        end_date = '2025-01-30',
        dog_id = [1]
    )

@pytest.fixture
def activity_query_filter():
    return ActivityQueryFilters(
        start_date = '2025-01-01',
        end_date = '2025-01-30',
        dog_id = [1,2],
        sport_id =2,
        runner_id = 1,
        workout = False,
        location = 'Park'
    )

# Define the tests
def test_build_conditions_with_weight_filter(weight_query_filter):
    clause, values = build_conditions(weight_query_filter)
    assert "a.timestamp >= %s" in clause
    assert "a.timestamp <= %s" in clause
    assert "w.dog_id in %s" in clause
    assert values == [date(2025, 1, 1), date(2025, 1, 30), (1,)]

def test_build_conditions_with_activity_filter(activity_query_filter):
    clause, values = build_conditions(activity_query_filter)
    assert "a.timestamp >= %s" in clause
    assert "a.timestamp <= %s" in clause
    assert "ad.dog_id in %s" in clause
    assert "a.sport_id = %s" in clause
    assert "a.runner_id = %s" in clause
    assert "a.workout = %s" in clause
    assert "a.location ILIKE %s" in clause
    assert values == [
        date(2025, 1, 1),
        date(2025, 1, 30),
        2,
        1,
        False,
        (1,2),
        "%Park%"
    ]