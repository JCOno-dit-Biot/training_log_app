from src.models import (
    Activity, 
    Dog, 
    Kennel, 
    Runner, 
    DogWeightEntry, 
    Sport, 
    ActivityLaps, 
    ActivityDogs, 
    Weather, 
    commentCreate,
    commentOut,
    PaginationParams,
    Filter,
    ActivityQueryFilters,
    WeightQueryFilter
)
import pytest
from pydantic import ValidationError
from datetime import datetime, date, timedelta
from src.utils import calculation_helpers as ch



@pytest.fixture
def activity_entry(JC):
    #dog=models.Dog("Luna",datetime(2017,4,18),models.Kennel("Team Running Huskies"))
    training_entry= Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Canicross', type= 'dryland', display_mode = 'pace'),
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

def test_activity_calculates_pace_automatically(activity_entry):
    assert activity_entry.pace is not None 
    assert activity_entry.pace == '03:20'
    

def test_activity_calculate_pace_for_all_sports(JC, Luna):
    bike_activity = Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Bikejoring', type= 'dryland', display_mode= 'speed'),
        speed = 21.9,
        location = 'Christie',
        distance = 2.4,
        workout = False,
        dogs = [ActivityDogs(
            dog = Luna,
            rating = 8

        )]
    )    
    assert bike_activity.pace is not None

def test_no_speed_pace_raises_ValError(JC,Luna):
    with pytest.raises(ValueError, match = 'must be provided the activity'):
        training_entry= Activity (
        timestamp = datetime.now(),
        runner = JC,
        dogs = [ActivityDogs(
            dog = Luna,
            rating = 8
        )],
        sport = Sport(name= 'Canicross', type= 'dryland', display_mode = 'pace'),
        location = 'Christie',
        distance = 2.4,
        workout = False
    )

def test_activity_workout_without_lap_raise(Luna, JC):
    with pytest.raises(ValueError, match = 'Laps cannot be None'):
        training_entry= Activity (
        timestamp = datetime.now(),
        runner = JC,
        dogs = [ActivityDogs(
            dog = Luna,
            rating = 8

        )],
        speed = 20.1,
        sport = Sport(name= 'Canicross', type= 'dryland', display_mode = 'pace'),
        location = 'Christie',
        distance = 2.4,
        workout = True,
        laps=[]
    )
        
def test_activity_with_pace_no_speed(JC, Luna):
    bike_activity = Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Bikejoring', type= 'dryland', display_mode= 'speed'),
        pace = "02:44",
        location = 'Christie',
        distance = 2.4,
        workout = False,
        dogs = [ActivityDogs(
            dog = Luna,
            rating = 8

        )]
    )
    print(bike_activity)
    assert bike_activity.speed is not None

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
        sport = Sport(name= 'Canicross', type= 'dryland', display_mode='pace'),
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
    assert workout.laps[0].lap_time_delta == timedelta(minutes = 3, seconds = 18)
    assert workout.laps[0].lap_distance == 1
    assert workout.laps[1].speed == pytest.approx(18)

def test_from_lap_time_and_distance():
    lap = ActivityLaps(lap_number=1, lap_distance=1.0, lap_time="05:00")
    assert lap.lap_time_delta == timedelta(minutes=5)
    assert round(lap.speed, 2) == 12.0
    assert lap.pace == "05:00"

def test_from_lap_time_delta_and_distance():
    lap = ActivityLaps(lap_number=2, lap_distance=1.0, lap_time_delta=timedelta(minutes=5))
    assert lap.lap_time == "05:00"
    assert round(lap.speed, 2) == 12.0
    assert lap.pace == "05:00"

def test_from_pace_only():
    lap = ActivityLaps(lap_number=3, lap_distance=1.0, pace="05:00")
    assert round(lap.speed, 2) == 12.0
    assert lap.pace == "05:00"

def test_from_speed_only():
    lap = ActivityLaps(lap_number=4, lap_distance=1.0, speed=12.0)
    assert lap.speed == 12.0
    assert lap.pace == "05:00"

def test_preserve_all_provided_fields():
    lap = ActivityLaps(
        lap_number=5,
        lap_distance=1.0,
        lap_time="05:00",
        lap_time_delta=timedelta(minutes=5),
        speed=12.0,
        pace="05:00"
    )
    assert lap.lap_time == "05:00"
    assert lap.lap_time_delta == timedelta(minutes=5)
    assert lap.speed == 12.0
    assert lap.pace == "05:00"

def test_activity_lap_raise():
    with pytest.raises(ValueError, match="Must specify at least one of: lap_time, lap_time_delta, speed or pace"):
        lap = ActivityLaps(lap_number = 6, lap_distance = 0.5)

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

def test_comment_create_init():
    comment = commentCreate(
        user_id = 1,
        activity_id= 1,
        comment= "test_comment"
    )
    assert comment.comment == "test_comment"
    assert comment.user_id== 1
    assert comment.activity_id == 1
    
def test_comment_out_init():
    now_ts = datetime.now()
    comment = commentOut(
        id = 1,
        user_id = 1,
        activity_id= 1,
        created_at= now_ts,
        comment= "test_comment"
    )
    assert comment.comment == "test_comment"
    assert comment.user_id== 1
    assert comment.activity_id == 1
    assert comment.created_at ==  now_ts
    assert comment.id == 1
    assert comment.updated_at is None

def test_pagination_model():
    pagination_param = PaginationParams(
        limit=10,
        offset=1
    )
    assert pagination_param.limit == 10
    assert pagination_param.offset == 1

def test_pagination_raises():
    with pytest.raises(ValidationError):
        PaginationParams(
            limit = 30,
            offset=1
        )

def test_filter_is_empty():
    filter = Filter()
    assert filter.is_empty()

