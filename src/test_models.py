from models import Dog
import pytest
from datetime import datetime
from dateutil.relativedelta import relativedelta


@pytest.fixture
def Luna():
    return Dog('Luna',datetime(2017,4,18))

def test_calculate_dog_age(Luna): 
    date='2023/04/18'   
    assert Luna.calculate_dog_age(date) == 6
