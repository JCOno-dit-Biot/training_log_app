import pytest
from src.repositories.activity_repository import activity_repository
from src.models.common import ActivityQueryFilters
from datetime import date, timezone, datetime, timedelta
from psycopg2.extras import RealDictCursor

@pytest.fixture
def activity_repo(test_db_conn):
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
    assert activity.has_heat_data == False

def test_activity_has_heat_data(activity_repo):
    activity = activity_repo.get_by_id(5)
    assert activity.has_heat_data == True
    
def test_get_all(activity_repo):
    activities = activity_repo.get_all(kennel_id=2, filters= ActivityQueryFilters(), limit = 10, offset = 0, )
    assert isinstance(activities, list)
    assert len(activities) == 8
    for activity in activities:
        assert all([x.dog.kennel.name == 'Les Gaulois' for x in activity.dogs])
        assert activity.sport.name =='Canicross'

        if activity.id == 5:
            assert activity.has_heat_data == True
        else:
            assert activity.has_heat_data == False

    act2 = next((activity for activity in activities if activity.id == 2), None)
    assert act2.laps == []
    assert act2.workout == False
    assert act2.weather.temperature == 1.4
    assert act2.weather.humidity is None
    assert act2.weather.condition is None
    assert act2.comment_count == 2
    
def test_get_all_default_pagination(activity_repo):
    activities = activity_repo.get_all(kennel_id=2, filters= ActivityQueryFilters() )
    assert isinstance(activities, list)
    assert len(activities) == 8

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

def test_get_all_with_location_filters(activity_repo):
    filter = ActivityQueryFilters(
        location_id = 2
    )
    activities =activity_repo.get_all(kennel_id = 2, filters = filter)
    assert len(activities) == 5
    activity = activities[0]
    assert activity.runner.id == 2
    assert activity.location.name == 'City park'
    assert len(activity.dogs) == 1
    assert activity.dogs[0].dog.kennel.id == 2

@pytest.mark.parametrize("filter,expected_count",[
    (ActivityQueryFilters(), 8),
    (ActivityQueryFilters(
        start_date = "2025-03-01",
        end_date="2025-04-02"
    ), 1)
])
def test_get_total_count(activity_repo, filter, expected_count):
    activity_count = activity_repo.get_total_count(kennel_id = 2, filters=filter)
    assert activity_count == expected_count

def test_get_heat_data(activity_repo):
    activity_heat_data = activity_repo.get_heat_data_by_activity_id(5)
    print(activity_heat_data)
    assert activity_heat_data.activity_id == 5
    assert len(activity_heat_data.dogs) == 2

    dogs_by_id = {dog.dog_id: dog for dog in activity_heat_data.dogs}

    assert set(dogs_by_id.keys()) == {1, 2}

    dog_1 = dogs_by_id[1]
    assert dog_1.activity_dog_id == 6
    assert dog_1.rating == 9
    assert dog_1.cooling_method == "lake"
    assert len(dog_1.temperatures) == 2

    dog_1_temps = {
        (temp.phase, temp.recovery_minute): temp
        for temp in dog_1.temperatures
    }

    assert set(dog_1_temps.keys()) == {
        ("before", None),
        ("after", None),
    }

    assert dog_1_temps[("before", None)].temperature_c == 38.5
    assert dog_1_temps[("before", None)].measurement_method == "ear"
    assert dog_1_temps[("after", None)].temperature_c == 40.5
    assert dog_1_temps[("after", None)].measurement_method == "ear"

    dog_2 = dogs_by_id[2]
    assert dog_2.activity_dog_id == 7
    assert dog_2.rating == 6
    assert dog_2.cooling_method == "lake"
    assert len(dog_2.temperatures) == 3

    dog_2_temps = {
        (temp.phase, temp.recovery_minute): temp
        for temp in dog_2.temperatures
    }

    assert set(dog_2_temps.keys()) == {
        ("before", None),
        ("after", None),
        ("recovery", 10),
    }

    assert dog_2_temps[("before", None)].temperature_c == 38.4
    assert dog_2_temps[("before", None)].measurement_method == "ear"

    assert dog_2_temps[("after", None)].temperature_c == 40.8
    assert dog_2_temps[("after", None)].measurement_method == "ear"

    assert dog_2_temps[("recovery", 10)].temperature_c == 39.7
    assert dog_2_temps[("recovery", 10)].measurement_method == "ear"

def test_create_activity(test_activity_create, activity_repo):
    id = activity_repo.create(test_activity_create)
    assert id == 11
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
        assert weather[1] == 11
        assert weather[2] == 9.5
        assert weather[3] == 0.85
        assert weather[4] == "rainy"

def test_create_activity_with_temps(test_activity_create_with_temperature_measurements, activity_repo):
    id = activity_repo.create(test_activity_create_with_temperature_measurements)
    assert id is not None
    with activity_repo._connection.cursor() as cur:
        cur.execute("""SELECT * FROM activities WHERE id = %s""", (id,))
        activity = cur.fetchone()
        assert activity[0] == id
        assert activity[3] == datetime(2026, 4, 1, 9, 30, tzinfo=timezone.utc)

        cur.execute("""SELECT * FROM workout_laps WHERE activity_id = %s""", (id,))
        laps = cur.fetchall()
        assert len(laps) == 0

        cur.execute("""SELECT * FROM activity_dogs WHERE activity_id = %s""", (id,))
        dogs =  cur.fetchall()
        assert len(dogs) == 2
        dog_activity_ids=[(dog[0], dog[2]) for dog in dogs]
        
        expected_temps = {
            1: {
                ("before", None): 38.7,
                ("after", None): 40.7,
            },
            2: {
                ("before", None): 38.5,
                ("after", None): 40.5,
                ("recovery", 10): 39.5,
            },
        }
        for dog_activity_id, dog_id in dog_activity_ids:
            cur.execute("""SELECT cooling_method FROM activity_dog_heat_observations WHERE activity_dog_id = %s""", (dog_activity_id,))
            cooling=cur.fetchone()

            assert cooling is not None
            assert cooling[0]=='lake'

            cur.execute("""
                SELECT phase, recovery_minute, temperature_c, measurement_method
                FROM activity_dog_temperature_measurements
                WHERE activity_dog_id = %s
                ORDER BY phase, recovery_minute NULLS FIRST
            """, (dog_activity_id,))
            temps=cur.fetchall()
            
            expected_for_dog = expected_temps[dog_id]

            assert len(temps) == len(expected_for_dog)

            for phase, recovery_minute, temperature_c, measurement_method in temps:
                key = (phase, recovery_minute)

                assert key in expected_for_dog
                assert float(temperature_c) == expected_for_dog[key]
                assert measurement_method == "ear"

        cur.execute("""SELECT * FROM weather_entries WHERE activity_id = %s""", (id,))
        weather = cur.fetchone()
        assert weather is not None
        assert weather[2] == 5
        assert weather[3] == 0.85
        assert weather[4] == "sunny"

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

def test_upsert_weather_on_activity_without(activity_repo):
    fields = {
        "weather": {
            "temperature": 18.0,
            "humidity": 63.0/100,
            "condition": ""
        }
    }
    activity_repo.update(3, fields)

    with activity_repo._connection.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT temperature, humidity, condition FROM weather_entries WHERE activity_id = 3")
        result = cur.fetchone()
        assert result["temperature"] == 18.0
        assert result["humidity"] == 0.63
        assert result["condition"] == ""

def test_update_dogs(activity_repo):
    fields = {
        "dogs": [
            {"dog_id": 1, "rating": 5}
        ]
    }
    updated = activity_repo.update(1, fields)

    assert updated == True
    with activity_repo._connection.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT dog_id, rating FROM activity_dogs WHERE activity_id = 1 AND dog_id = 1")
        result = cur.fetchone()
        assert result["dog_id"] == 1
        assert result["rating"] == 5


@pytest.mark.parametrize(
    "payload,expected_rating,expected_cooling,expected_temps",
    [
        pytest.param(
            {
                "dogs": [
                    {
                        "dog_id": 1,
                        "rating": 7,
                    }
                ]
            },
            7,
            "lake",
            {
                ("before", None): (38.5, "ear"),
                ("after", None): (40.5, "ear"),
            },
            id="rating-only-keeps-heat-data",
        ),
        pytest.param(
            {
                "dogs": [
                    {
                        "dog_id": 1,
                        "cooling_method": "walk + water",
                    }
                ]
            },
            7, #changed on previous test
            "walk + water",
            {
                ("before", None): (38.5, "ear"),
                ("after", None): (40.5, "ear"),
            },
            id="cooling-only-keeps-rating-and-temps",
        ),
        pytest.param(
            {
                "dogs": [
                    {
                        "dog_id": 1,
                        "temperatures": [
                            {
                                "phase": "after",
                                "temperature_c": 40.1,
                                "measurement_method": "ear",
                            }
                        ],
                    }
                ]
            },
            7,
            "walk + water", #changed on previous test
            {
                ("before", None): (38.5, "ear"),
                ("after", None): (40.1, "ear"),
            },
            id="update-one-temperature-only",
        ),
        pytest.param(
            {
                "dogs": [
                    {
                        "dog_id": 1,
                        "rating": 6,
                        "cooling_method": "lake + walk",
                        "temperatures": [
                            {
                                "phase": "before",
                                "temperature_c": 38.8,
                                "measurement_method": "rectal",
                            },
                            {
                                "phase": "after",
                                "temperature_c": 40.9,
                                "measurement_method": "rectal",
                            },
                            {
                                "phase": "recovery",
                                "recovery_minute": 10,
                                "temperature_c": 39.4,
                                "measurement_method": "rectal",
                            },
                        ],
                    }
                ]
            },
            6,
            "lake + walk",
            {
                ("before", None): (38.8, "rectal"),
                ("after", None): (40.9, "rectal"),
                ("recovery", 10): (39.4, "rectal"),
            },
            id="update-all-dog-heat-fields",
        ),
    ],
)
def test_update_dogs_with_temperatures(
    activity_repo,
    payload,
    expected_rating,
    expected_cooling,
    expected_temps,
):
    updated = activity_repo.update(5, payload)

    assert updated is True

    with activity_repo._connection.cursor() as cur:
        cur.execute(
            """
            SELECT rating
            FROM activity_dogs
            WHERE id = %s AND activity_id = %s
            """,
            (6, 5),
        )
        rating = cur.fetchone()

        assert rating is not None
        assert rating[0] == expected_rating

        cur.execute(
            """
            SELECT cooling_method
            FROM activity_dog_heat_observations
            WHERE activity_dog_id = %s
            """,
            (6,),
        )
        cooling = cur.fetchone()

        assert cooling is not None
        assert cooling[0] == expected_cooling

        cur.execute(
            """
            SELECT phase, recovery_minute, temperature_c, measurement_method
            FROM activity_dog_temperature_measurements
            WHERE activity_dog_id = %s
            """,
            (6,),
        )
        temps = cur.fetchall()

        actual_temps = {
            (phase, recovery_minute): (float(temperature_c), measurement_method)
            for phase, recovery_minute, temperature_c, measurement_method in temps
        }

        assert actual_temps == expected_temps

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

def update_activity_remove_weather_entry(activity_repo):
    fields = {
        "weather": None
    }
    activity_repo.update(3, fields)

    with activity_repo._connection.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT temperature, humidity, condition FROM weather_entries WHERE activity_id = 3")
        result = cur.fetchone()
        assert result is None

def test_update_activity_ignores_invalid_fields(activity_repo):

    updated = activity_repo.update(2, {"not_a_real_column": '2025-04-02T16:00:00Z'})

    with activity_repo._connection.cursor() as cur:
        cur.execute("SELECT timestamp FROM activities WHERE id = %s", (2,))
        result = cur.fetchone()

    assert updated is False
    assert result[0] == datetime(2025, 4, 2, 16, 00, tzinfo=timezone.utc)