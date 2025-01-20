from src.models import *
import pytest
from datetime import datetime, date
from src import calculation_helpers as ch


@pytest.fixture
def activity_entry(JC):
    #dog=models.Dog("Luna",datetime(2017,4,18),models.Kennel("Team Running Huskies"))
    training_entry= Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Canicross'),
        location = 'Christie',
        distance = 2.4,
        workout = False,
        speed = 18
    )
    return training_entry

@pytest.fixture
def Luna():
    return Dog(
        name = 'Luna',
        date_of_birth= datetime(2017,4,18), 
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

@pytest.mark.parametrize('pace,expected', [('3:20', 18.0), ('5:30', 10.91), ('0:05:30', 10.91), (5.5, 10.91), ('2:00', 30.0)])
def test_pace_to_speed(pace, expected):
    #pace_string="0:03:20"
    speed=ch.calculate_speed_from_pace(pace)
    assert pytest.approx(speed, 0.01) == expected

def test_valid_int():
    # Integer input for minutes per kilometer
    assert pytest.approx(ch.calculate_speed_from_pace(6), 0.01) == 10.0

@pytest.mark.parametrize('pace', ['530', '5:30:30:30', 'invalid', '-5:30', '0:00', -5])
def test_invalid_string_format(pace):
    # Invalid string without colons
    with pytest.raises(ValueError):
        ch.calculate_speed_from_pace(pace)

def test_non_numeric_input():
    # Invalid input types
    with pytest.raises(TypeError):
        ch.calculate_speed_from_pace(None)
    with pytest.raises(TypeError):
        ch.calculate_speed_from_pace([5, 30])
    with pytest.raises(TypeError):
        ch.calculate_speed_from_pace({"pace": "5:30"})


def test_speed_to_pace():
    speed=10.90
    pace_string=ch.calculate_pace_from_speed(speed)
    assert pace_string == "05:30"

def test_wrong_type_speed():
    speed = "too fast"
    with pytest.raises(TypeError):
        ch.calculate_pace_from_speed(speed)

def test_dog_weight_calculate_dog_age(Luna):
    weight_entry=DogWeightEntry(dog = Luna, date = date(2023, 3, 27), weight = 35)
    assert int(weight_entry.age*100)/100 == 5.93

    
def test_activity_calculates_pace_automatically(activity_entry):
    assert activity_entry.pace is not None 
    assert activity_entry.pace == '03:20'

def test_no_speed_pace_raises_ValError(JC):
    with pytest.raises(ValueError):
        training_entry= Activity (
        timestamp = datetime.now(),
        runner = JC,
        sport = Sport(name= 'Canicross'),
        location = 'Christie',
        distance = 2.4,
        workout = False
    )








