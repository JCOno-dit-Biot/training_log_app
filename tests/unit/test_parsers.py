from src.parsers.dog_parser import parse_dog_from_row
from src.parsers.runner_parser import parse_runner_from_row
from src.parsers.activity_parser import parse_activity_from_row
from datetime import date
import pytest

@pytest.fixture()
def default_activity_row():
    row = {
        "id": 1,
        "runner_id": 5,
        "sport_id": 2,
        "timestamp": "2025-04-01T09:30:00Z",
        "notes": "Morning speed workout",
        "location": "Forest Loop",
        "workout": True,
        "speed": 20.3,
        "distance": 8.0,
        "runner_name": "Alice Monroe",
        "sport_name": "Canicross",
        "kennel_name": "test_kennel",
        "dogs": [
            {
            "id": 10,
            "name": "Bolt",
            "breed": "Husky",
            "date_of_birth": "2021-05-14",
            "rating": 9
            },
            {
            "id": 11,
            "name": "Shadow",
            "breed": "Malinois",
            "date_of_birth": "2020-09-02",
            "rating": 8
            }
        ],
        "laps": [
            {
            "lap_number": 1,
            "speed": 21.0
            },
            {
            "lap_number": 2,
            "speed": 20.1
            },
            {
            "lap_number": 3,
            "speed": 19.8
            }
        ]
    }
    return row

def test_dog_parser():
    row = {
        'id': 1,
        'name' : 'Fido',
        'breed' : 'labrador',
        'date_of_birth' : '2024-01-01',
        'kennel_name' : 'test_kennel'
    }

    dog = parse_dog_from_row(row)

    assert dog.id == 1
    assert dog.name == 'Fido'
    assert dog.breed == 'labrador'
    assert dog.date_of_birth == date(2024,1,1)
    assert dog.kennel.name == 'test_kennel'

def test_runner_parser():
    row = {
        'id':2,
        'name' : 'John',
        'kennel_name' : 'test_kennel'
    }

    runner = parse_runner_from_row(row)

    assert runner.id == 2
    assert runner.name == 'John'
    assert runner.kennel.name == 'test_kennel'

def test_activity_parser(default_activity_row):
    activity = parse_activity_from_row(default_activity_row)
    assert len(activity.laps) == 3
    assert len(activity.dogs) == 2
    assert activity.runner.name == 'Alice Monroe'
    assert activity.sport.name == 'Canicross'
    assert activity.dogs[0].dog.name == 'Bolt'
    assert activity.laps[1].lap_number == 2
    assert activity.laps[1].speed == 20.1
    
def test_activity_parser_no_laps(default_activity_row):
    default_activity_row['laps'] = []
    default_activity_row['workout'] = False
    activity = parse_activity_from_row(default_activity_row)
    assert len(activity.laps) == 0
    assert len(activity.dogs) == 2

