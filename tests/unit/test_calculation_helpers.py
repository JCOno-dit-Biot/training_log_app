from src.models import *
import pytest
from src.utils import calculation_helpers as ch
from datetime import datetime, date

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

@pytest.mark.parametrize('start_date,end_date,expected',
                        [
                            (datetime(2025,1,1,12,0,5), datetime(2025,1,14,2,0,9), 2),
                            (datetime(2025,1,1), date(2025,1,21), 3),
                            (date(2025,1,8), date(2025,1,21), 2)
                        ])
def test_get_number_weeks(start_date, end_date, expected):
    weeks = ch.get_number_weeks(start_date, end_date)
    assert weeks == expected