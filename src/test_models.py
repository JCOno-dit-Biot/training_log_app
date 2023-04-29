from models import Dog
import pytest
from datetime import datetime
from dateutil.relativedelta import relativedelta


# @pytest.fixture
# def dog():
#     return Dog('Luna',datetime(2017,04,18))

def test_calculate_dog_age():
    today=datetime.today()
    dog=Dog('test_dog_1',today + relativedelta(years=-1,months=-6))
    
    assert dog.calculate_dog_age() == 1.5
