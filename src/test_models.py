from models import Dog
import pytest
from datetime import datetime
from dateutil.relativedelta import relativedelta
import calculation_helpers as ch




@pytest.fixture
def Luna():
    return Dog('Luna',datetime(2017,4,18))

def test_calculate_dog_age(Luna): 
    date='2023/04/18'   
    assert Luna.calculate_dog_age(date) == 6


def test_pace_to_speed():
    pace_string="0:03:20"
    speed=ch.calculate_speed_from_pace(pace_string)
    assert speed == 18.0

def test_speed_to_pace():
    speed=18.0
    pace_string=ch.calculate_pace_from_speed(speed)
    assert pace_string == "0:03:20"