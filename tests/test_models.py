from src import models
import pytest
from datetime import datetime
from dateutil.relativedelta import relativedelta
from src import calculation_helpers as ch


@pytest.fixture
def training_log_entry(Luna,JC):
    #dog=models.Dog("Luna",datetime(2017,4,18),models.Kennel("Team Running Huskies"))
    training_entry= models.Training_Log(datetime.now(), 20,77, Luna,models.Dog('Bolt',datetime(2018,6,12),models.Kennel("Team Running Husky"),'Husky'),\
                                        "Canicross",JC,\
                                        "Christie", 2.4, 3, pace="0:03:20")

    return training_entry

@pytest.fixture
def Luna():
    return models.Dog('Luna',datetime(2017,4,18),models.Kennel("Team Running Husky"),'Husky')

@pytest.fixture
def JC():
    return models.Runner('JC',models.Kennel("Team Running Husky"))    

def test_calculate_dog_age(Luna): 
    date='2023/04/18'   
    assert Luna.calculate_dog_age(date) == 6

def test_same_dogs(Luna):
    assert Luna.dog_name == Luna.dog_name

def test_pace_to_speed():
    pace_string="0:03:20"
    speed=ch.calculate_speed_from_pace(pace_string)
    assert speed == 18.0

def test_speed_to_pace():
    speed=18.0
    pace_string=ch.calculate_pace_from_speed(speed)
    assert pace_string == "0:03:20"

def test_weather_raises_ValError_if_not_in_list():
    with pytest.raises(ValueError):
        weather=models.Weather_Entry(datetime.now(),20,77,sky_condition='clear')
        
def test_no_speed_pace_raises_ValError():
    with pytest.raises(ValueError):
        training_entry= models.Training_Log(datetime.now(), 20,77,Luna,models.Dog('Bolt',datetime(2018,6,12),models.Kennel("Team Running Husky"),'Husky'),\
                                        "Canicross",models.Runner("JC",models.Kennel("Team Running Husky")),\
                                        "Christie", 2.4, 3)

def test_training_log_calculates_speed_automatically(training_log_entry):
    assert training_log_entry.speed==18.0

def test_dog_weight_calculate_dog_age(Luna):
    weight_entry=models.Dog_Weight(Luna,'2023/04/18', 35)
    assert weight_entry.dog_age == 6




