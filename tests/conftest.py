import pytest
from dotenv import load_dotenv
import os
from datetime import date, timezone, datetime, timedelta
from src.models.activity import Activity, ActivityLaps, ActivityDogs, ActivityCreate, ActivityDogsCreate
from src.models.location import Location
from src.models.dog import Dog
from src.models.runner import Runner
from src.models.sport import Sport, SportType
from src.models.kennel import Kennel
from src.models.weather import Weather

load_dotenv()
print(os.getenv("CI"))
print(f"environment set to {os.getenv("ENV")}")

if os.getenv("CI") != "true":
    print("loading local .env file")
    load_dotenv(dotenv_path='config/.env.test', override= True)

from src.utils.db import get_connection

@pytest.fixture(scope="session")
def test_db_conn():
    conn = get_connection()
    yield conn
    conn.close()


@pytest.fixture()
def test_kennel():
    return Kennel(name = "Test Kennel")

@pytest.fixture()
def dog_fixture():
    return Dog(
                id=1,
                name="Milou",
                breed="Terrier",
                date_of_birth=date(2023, 1, 1),
                kennel=Kennel(id=1, name="Les Gaulois")
            )

@pytest.fixture()
def test_activity():
    test_activity = Activity(
        id=None,
        timestamp=datetime(2025, 4, 1, 9, 30, tzinfo=timezone.utc),
        runner=Runner(id=2, name="Obelix", kennel=Kennel(id=1, name="Les Gaulois")),
        sport=Sport(id=1, name="Canicross", type = SportType.DRYLAND),
        location=Location(id = 1, name= "Forest Loop"),
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

@pytest.fixture()
def test_activity_create():
    test_activity = ActivityCreate(
        id=None,
        timestamp=datetime(2025, 4, 1, 9, 30, tzinfo=timezone.utc),
        runner_id=2,
        sport_id=1,
        location_id = 1,
        distance=8.0,
        workout=True,
        speed=20.3,
        dogs=[
            ActivityDogsCreate(
            id=None,
            dog_id=1,
            rating=9
            ),
            ActivityDogsCreate(
                id=None,
                dog_id = 2,
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


