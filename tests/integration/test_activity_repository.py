import pytest
from src.models.activity import Activity, ActivityLaps, ActivityDogs
from src.models.dog import Dog
from src.models.runner import Runner
from src.models.sport import Sport, SportType
from src.models.kennel import Kennel
from src.models.weather import Weather
from src.repositories.activity_repository import activity_repository
from datetime import date, timezone, datetime, timedelta

@pytest.fixture
def activity_repo(test_db_conn):
    print(test_db_conn)
    return activity_repository(test_db_conn)

@pytest.fixture()
def test_kennel():
    return Kennel(name = "Test Kennel")

@pytest.fixture()
def test_activity():
    test_activity = Activity(
        id=None,
        timestamp=datetime(2025, 4, 1, 9, 30, tzinfo=timezone.utc),
        runner=Runner(id=2, name="Obelix", kennel=Kennel(id=1, name="Les Gaulois")),
        sport=Sport(id=1, name="Canicross", type = SportType.DRYLAND),
        location="Forest Loop",
        distance=8.0,
        workout=True,
        notes="Morning speed workout",
        speed=20.3,
        dogs=[
            ActivityDogs(
                id=None,
                dog=Dog(
                    id=1,
                    name="Milou",
                    breed="Terrier",
                    date_of_birth=date(2023, 1, 1),
                    kennel=Kennel(id=1, name="Les Gaulois")
                ),
                rating=9
            ),
            ActivityDogs(
                id=None,
                dog=Dog(
                    id=2,
                    name="Fido",
                    breed="Golden Retriever",
                    date_of_birth=date(2020, 7, 1),
                    kennel=Kennel(id=1, name="Les Gaulois")
                ),
                rating=8
            )
        ],
        laps=[
            ActivityLaps(lap_number=1, speed=21.0, pace="02:51", lap_distance = 1, lap_time_delta=timedelta(minutes = 2, seconds = 51) ),
            ActivityLaps(lap_number=2, speed=20.1, pace="02:59", lap_distance = 1, lap_time_delta=timedelta(minutes = 2, seconds = 59)),
            ActivityLaps(lap_number=3, speed=19.8, pace="03:01", lap_distance = 1, lap_time_delta=timedelta(minutes = 3, seconds = 1))
        ],
        weather=Weather(
            temperature=9.5,
            humidity=0.85,
            condition = "rainy"
        )

    )
    return test_activity


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
    

def test_get_all(activity_repo):
    activities = activity_repo.get_all(kennel_id=2)
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
    
def test_create_activity(test_activity, activity_repo):
    id = activity_repo.create(test_activity)
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
    test_activity.id = 4
    activity_repo.delete(test_activity)
    # checking activities table should be enough for now as the other two have foreign key on activity.id
    with activity_repo._connection.cursor() as cur:
        cur.execute("""SELECT * FROM activities WHERE id = %s""", (test_activity.id,))
        result = cur.fetchone()
        assert result is None
