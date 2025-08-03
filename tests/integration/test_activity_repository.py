import pytest
from src.repositories.activity_repository import activity_repository
from src.models.common import ActivityQueryFilters
from datetime import date, timezone, datetime, timedelta
from psycopg2.extras import RealDictCursor

@pytest.fixture
def activity_repo(test_db_conn):
    print(test_db_conn)
    return activity_repository(test_db_conn)

def test_get_by_id(activity_repo):
    activity = activity_repo.get_by_id(1)
    assert isinstance(activity.dogs, list)
    assert len(activity.dogs) == 2
    assert activity.sport.name == 'Canicross'
    assert isinstance(activity.laps, list)
    assert len(activity.laps) == 3
    assert activity.runner.name == 'Obelix'
    assert all([x.dog.name in ['Milou', 'Fido'] for x in activity.dogs])
    assert activity.weather.temperature == 10.4
    assert activity.weather.humidity == .67
    assert activity.weather.condition == "sunny"
    assert activity.comment_count == 1
    

def test_get_all(activity_repo):
    activities = activity_repo.get_all(kennel_id=2, filters= ActivityQueryFilters(), limit = 10, offset = 0, )
    assert isinstance(activities, list)
    assert len(activities) == 2
    for activity in activities:
        assert all([x.dog.kennel.name == 'Les Gaulois' for x in activity.dogs])
        assert activity.sport.name =='Canicross'
    act2 = activities[0]
    assert act2.laps == []
    assert act2.workout == False
    assert act2.weather.temperature == 1.4
    assert act2.weather.humidity is None
    assert act2.weather.condition is None
    assert act2.comment_count == 2
    
def test_get_all_default_pagination(activity_repo):
    activities = activity_repo.get_all(kennel_id=2, filters= ActivityQueryFilters() )
    assert isinstance(activities, list)
    assert len(activities) == 2

def test_get_all_with_pagination(activity_repo):
    activities = activity_repo.get_all(kennel_id=2, filters= ActivityQueryFilters(), limit = 1, offset= 1 )
    assert isinstance(activities, list)
    assert len(activities) == 1
    assert activities[0].runner.id == 2
    assert len(activities[0].dogs) == 2

def test_get_all_with_filters(activity_repo):
    filter = ActivityQueryFilters(
        start_date = "2025-03-01",
        end_date="2025-04-02"
    )
    activities =activity_repo.get_all(kennel_id = 2, filters = filter)
    assert len(activities) == 1
    activity = activities[0]
    assert activity.runner.id == 2
    assert len(activity.dogs) == 2
    assert activity.weather.temperature == 10.4

@pytest.mark.parametrize("filter,expected_count",[
    (ActivityQueryFilters(), 2),
    (ActivityQueryFilters(
        start_date = "2025-03-01",
        end_date="2025-04-02"
    ), 1)
])
def test_get_total_count(activity_repo, filter, expected_count):
    activity_count = activity_repo.get_total_count(kennel_id = 2, filters=filter)
    assert activity_count == expected_count


def test_create_activity(test_activity_create, activity_repo):
    id = activity_repo.create(test_activity_create)
    assert id == 4
    with activity_repo._connection.cursor() as cur:
        cur.execute("""SELECT * FROM activities WHERE id = %s""", (id,))
        activity = cur.fetchone()
        assert activity[0] == id
        assert activity[3] == datetime(2025, 4, 1, 9, 30, tzinfo=timezone.utc)

        cur.execute("""SELECT * FROM workout_laps WHERE activity_id = %s""", (id,))
        laps = cur.fetchall()
        assert len(laps) == 3

        cur.execute("""SELECT * FROM activity_dogs WHERE activity_id = %s""", (id,))
        dogs =  cur.fetchall()
        assert len(dogs) == 2

        cur.execute("""SELECT * FROM weather_entries WHERE activity_id = %s""", (id,))
        weather = cur.fetchone()
        assert weather is not None
        assert weather[1] == 4
        assert weather[2] == 9.5
        assert weather[3] == 0.85
        assert weather[4] == "rainy"

def test_delete_activity(activity_repo, test_activity):
    activity_repo.delete(test_activity.id)
    # checking activities table should be enough for now as the other two have foreign key on activity.id
    with activity_repo._connection.cursor() as cur:
        cur.execute("""SELECT * FROM activities WHERE id = %s""", (test_activity.id,))
        result = cur.fetchone()
        assert result is None


# Update method related test
def test_update_base_fields(activity_repo):
    fields = {
        "location_id": 2,
        "speed": 12.0
    }
    activity_repo.update(1, fields)

    with activity_repo._connection.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT location_id, speed FROM activities WHERE id = 1")
        result = cur.fetchone()
        assert result["location_id"] == 2
        assert result["speed"] == 12.0


def test_update_laps(activity_repo):
    fields = {
        "laps": [
            {
                "lap_number": 1,
                "lap_time": '06:00',
                "lap_distance": 1.5,
                "speed": 11.0
            }
        ]
    }
    activity_repo.update(1, fields)

    with activity_repo._connection.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT lap_time, lap_distance, speed FROM workout_laps WHERE activity_id = 1 AND lap_number = 1")
        result = cur.fetchone()
        assert result["lap_time"] == timedelta(minutes=6)
        assert result["lap_distance"] == 1.5
        assert result["speed"] == 11.0


def test_update_weather(activity_repo):
    fields = {
        "weather": {
            "temperature": 22.0,
            "humidity": 40.0/100,
            "condition": "Sunny"
        }
    }
    activity_repo.update(1, fields)

    with activity_repo._connection.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT temperature, humidity, condition FROM weather_entries WHERE activity_id = 1")
        result = cur.fetchone()
        assert result["temperature"] == 22.0
        assert result["humidity"] == 0.4
        assert result["condition"] == "Sunny"


def test_update_dogs(activity_repo):
    fields = {
        "dogs": [
            {"dog_id": 1, "rating": 5}
        ]
    }
    activity_repo.update(1, fields)

    with activity_repo._connection.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT dog_id, rating FROM activity_dogs WHERE activity_id = 1")
        result = cur.fetchone()
        assert result["dog_id"] == 1
        assert result["rating"] == 5


def test_update_all_components(activity_repo):
    fields = {
        "location_id": 2,
        "weather": {"temperature": 25.0, "humidity": 35.0/100, "condition": "Clear"},
        "dogs": [{"dog_id": 1, "rating": 4}],
        "laps": [{"lap_number": 2, "lap_time": '04:00', "lap_distance": 1.0, "speed": 13.5}]
    }
    activity_repo.update(1, fields)

    with activity_repo._connection.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT location_id FROM activities WHERE id = 1")
        assert cur.fetchone()["location_id"] == 2
        cur.execute("SELECT lap_time, lap_distance, speed FROM workout_laps WHERE activity_id = 1 AND lap_number = 2")
        lap = cur.fetchone()
        assert lap["speed"] == 13.5



def test_update_invalid_id(activity_repo):
    fields = {"location_id": 3}
    activity_repo.update(99999, fields)  # Should not fail, but shouldn't affect data

    with activity_repo._connection.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT COUNT(*) FROM activities WHERE id = 99999")
        assert cur.fetchone()["count"] == 0

