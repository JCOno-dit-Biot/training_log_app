from src.utils.db import build_conditions, build_time_window_clause
import pytest
from src.models import WeightQueryFilter, ActivityQueryFilters, Filter
from datetime import date
from src.utils.db import sanitize_update_dict, build_update_set_clause
from src.constants import (
    UPDATE_ALLOWED_FIELDS_WEIGHT,
    UPDATE_ALLOWED_FIELDS_ACTIVITY,
    UPDATE_ALLOWED_FIELDS_DOG,
    UPDATE_ALLOWED_FIELDS_LOCATION,
    UPDATE_ALLOWED_FIELDS_RUNNER
)

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
        location_id = 3
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
    assert "l.id = %s" in clause
    assert values == [
        2,
        1,
        False,
        1,
        3,
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


@pytest.mark.parametrize(
    "data,allowed,expected",
    [
        (
            {"name": "Milou", "breed": "Golden Retriever", "bad": "x"},
            UPDATE_ALLOWED_FIELDS_DOG,
            {"name": "Milou", "breed": "Golden Retriever"},
        ),
        (
            {"name": "Tintin", "color": "blue"},
            UPDATE_ALLOWED_FIELDS_RUNNER,
            {"name": "Tintin"},
        ),
        (
            {"name": "Forest Trail", "latitude": 20.1, "longitude": -80.2, "foo": 1},
            UPDATE_ALLOWED_FIELDS_LOCATION,
            {"name": "Forest Trail", "latitude": 20.1, "longitude": -80.2},
        ),
        (
            {"weight": 22.5, "date": "2026-03-28", "ignored": True},
            UPDATE_ALLOWED_FIELDS_WEIGHT,
            {"weight": 22.5, "date": "2026-03-28"},
        ),
        (
            {
                "timestamp": "2026-03-28T10:00:00Z",
                "runner_id": 1,
                "sport_id": 2,
                "location_id": 3,
                "distance": 5.4,
                "workout": True,
                "speed": 18.2,
                "extra": "nope",
            },
            UPDATE_ALLOWED_FIELDS_ACTIVITY,
            {
                "timestamp": "2026-03-28T10:00:00Z",
                "runner_id": 1,
                "sport_id": 2,
                "location_id": 3,
                "distance": 5.4,
                "workout": True,
                "speed": 18.2,
            },
        ),
        (
            {},
            UPDATE_ALLOWED_FIELDS_DOG,
            {},
        ),
        (
            {"not_allowed": 123},
            UPDATE_ALLOWED_FIELDS_DOG,
            {},
        ),
    ],
)
def test_sanitize_update_dict(data, allowed, expected):
    result = sanitize_update_dict(data, allowed)
    assert result == expected


@pytest.mark.parametrize(
    "fields,expected_clause,expected_values",
    [
        (
            {"name": "Milou"},
            "name = %s",
            ["Milou"],
        ),
        (
            {"name": "Milou", "breed": "Golden Retriever"},
            "name = %s, breed = %s",
            ["Milou", "Golden Retriever"],
        ),
        (
            {"weight": 22.5, "date": "2026-03-28"},
            "weight = %s, date = %s",
            [22.5, "2026-03-28"],
        ),
        (
            {},
            "",
            [],
        ),
    ],
)
def test_build_update_set_clause(fields, expected_clause, expected_values):
    clause, values = build_update_set_clause(fields)
    assert clause == expected_clause
    assert values == expected_values