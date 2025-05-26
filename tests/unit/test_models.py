from src.models import Activity, Dog, Kennel, Runner, DogWeightEntry, Sport, ActivityLaps, ActivityDogs, Weather
import pytest
from pydantic import ValidationError
from datetime import datetime, date, timedelta
from src import calculation_helpers as ch



@pytest.fixture
def activity_entry(JC):
    #dog=models.Dog("Luna",datetime(2017,4,18),models.Kennel("Team Running Huskies"))
    training_entry= Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Canicross', type= 'dryland'),
        location = 'Christie',
        distance = 2.4,
        workout = False,
        speed = 18,
        dogs = [ActivityDogs(
            dog = Dog(
            name = 'Luna',
            date_of_birth= date(2017,4,18), 
            kennel = Kennel(name = "Team Running Husky"),
            breed = 'Husky'),
            rating = 8
        )]
    )
    return training_entry

@pytest.fixture
def Luna():
    return Dog(
        name = 'Luna',
        date_of_birth= date(2017,4,18), 
        kennel = Kennel(name = "Team Running Husky"),
        breed = 'Husky')

@pytest.fixture
def JC():
    return Runner(
        name = 'JC', 
        kennel = Kennel(name = "Team Running Husky")
    )    

def test_calculate_dog_age(Luna): 
    as_of_date = date(2023, 4, 18)
    assert int(Luna.calculate_dog_age(as_of_date)*100)/100 == 6.00
    as_of_date = date(2024,5,20)
    assert int(Luna.calculate_dog_age(as_of_date)*100)/100 == 7.08

def test_calculate_dog_age_before_birth_raises(Luna):
    as_of_date = date(2015,1,1)
    with pytest.raises(ValueError):
        Luna.calculate_dog_age(as_of_date)

def test_same_dogs(Luna):
    assert Luna == Luna

def test_dog_weight_calculate_dog_age(Luna):
    weight_entry=DogWeightEntry(dog = Luna, date = date(2023, 3, 27), weight = 35)
    assert int(weight_entry.age*100)/100 == 5.93


def test_dog_weight_recalculate_dog_age(Luna):
    # Make sure that age gets recalculated even if specified in the input
    weight_entry=DogWeightEntry(dog = Luna, date = date(2023, 3, 27), weight = 35, age = 1)
    assert int(weight_entry.age*100)/100 == 5.93

def test_activity_calculates_pace_automatically_if_running(activity_entry):
    assert activity_entry.pace is not None 
    assert activity_entry.pace == '03:20'

def test_activity_no_pace_if_not_running(JC, Luna):
    bike_activity = Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Bikejoring', type= 'dryland'),
        speed = 21.9,
        location = 'Christie',
        distance = 2.4,
        workout = False,
        dogs = [ActivityDogs(
            dog = Luna,
            rating = 8

        )]
    )    
    assert bike_activity.pace is None

def test_no_speed_pace_raises_ValError(JC):
    with pytest.raises(ValueError):
        training_entry= Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Canicross', type= 'dryland'),
        location = 'Christie',
        distance = 2.4,
        workout = False
    )

def test_activity_workout_without_lap_raise():
    with pytest.raises(ValueError):
        training_entry= Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Canicross', type= 'dryland'),
        location = 'Christie',
        distance = 2.4,
        workout = True,
        laps=[]
    )
def test_activity_lap_no_speed_raise():
 with pytest.raises(ValueError):
    ActivityLaps(lap_number=1)


def test_activity_lap_with_time_distance():
    activitylap = ActivityLaps(
        lap_number = 1,
        lap_distance = 1,
        lap_time= '3:00'
    )

    assert activitylap.speed == 20
    assert activitylap.pace == "03:00"
    assert activitylap.lap_time_delta is not None
    assert activitylap.lap_time_delta == timedelta(minutes=3)

def test_activity_workout_with_lap(JC, Luna):
    workout = Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Canicross', type= 'dryland'),
        location = 'Christie',
        distance = 2.4,
        workout = True,
        speed = 18.0,
        laps=[
            ActivityLaps(
                lap_number=1,
                lap_time = '03:18',
                lap_distance = 1
            ),
            ActivityLaps(
                lap_number=2,
                lap_distance = 1,
                lap_time = "03:20"
            )
        ],
        dogs = [ActivityDogs(
            dog = Luna,
            rating = 8
        )]
    )
    assert len(workout.laps) == 2
    assert all([x.speed is not None for x in workout.laps])
    assert all([x.pace is not None for x in workout.laps])
    assert workout.laps[0].pace == "03:17" # there is a rounding error going through speed to pace
    assert workout.laps[1].speed == pytest.approx(18)


def test_weather_init():
    weather = Weather(
        temperature=20.9,
        humidity=0.78,
        condition="Sunny"
    )
    assert weather.temperature == 20.9
    assert weather.humidity == 0.78
    assert weather.condition == "Sunny"

@pytest.mark.parametrize("humidity", [(-0.1), (1.1)])
def test_weather_humidity_raises(humidity):
    with pytest.raises(ValidationError):
        weather = Weather(
                temperature=20.9,
                humidity=humidity,
                condition="Sunny"
            )

def test_weather_no_t_humidity_raise():
    with pytest.raises(ValueError):
        weather = Weather (
            condition = "wet"
        )