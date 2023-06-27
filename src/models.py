from datetime import datetime
from dateutil.relativedelta import relativedelta
from dataclasses import dataclass
from . import constants as c
from . import calculation_helpers as ch

@dataclass(unsafe_hash=True)
class Kennel:
        kennel_name: str


class Dog:

    def __init__ (self, name: str, DOB: datetime, kennel: Kennel, breed: str):
        self.dog_name=name
        self.date_of_birth=DOB.date()
        self.kennel_name=kennel
        self.breed=breed

    def calculate_dog_age(self, date: str)  -> float:

        date=datetime.strptime(date, '%Y/%m/%d')
        self.age=(c.MONTHS_IN_YEAR*relativedelta(date, self.date_of_birth).years+relativedelta(date, self.date_of_birth).months)/c.MONTHS_IN_YEAR
        return self.age

    

class Runner:

    def __init__(self, name: str, kennel: Kennel):
        self.runner_name=name
        self.kennel_name=kennel

#could make use of descriptors for validation? True for most classes below
class Dog_Weight:

    def __init__(self, dog: Dog, date: str, weight: float):
        self.dog_name=dog
        self.dog_age=dog.calculate_dog_age(date)
        self.weight=weight


class Weather_Entry:

    def __init__(self, timestamp, temperature, humidity, sky_condition=None):
        self.timestamp = timestamp
        self.temperature = temperature
        self.humidity=humidity/c.TO_PERCENT
        if sky_condition:
            if sky_condition in c.SKY_CONDITION_LIST or None:
                self.sky_condition=sky_condition
            else:
                raise ValueError(f'The sky condition must be one of the following: {c.SKY_CONDITION_LIST}')

class Training_Log:
    #assumes that pace has the following format "00:00:00" --> need data validation
    def __init__(self, timestamp, temperature, humidity, dog1:Dog, sport, runner:Runner, location, distance, rating, dog2=None, speed=None, pace=None, workout = False, sky_condition=None ) -> None:
        self.timestamp=timestamp
        self.dog1_name=dog1
        self.runner_name=runner
        self.sport=sport
        self.location=location
        self.distance=distance
        self.rating = rating
        self.workout=workout
        self.__create_weather_entry(timestamp, temperature, humidity, sky_condition)


        if speed == None and pace == None:
            raise ValueError ("One of {speed} or {pace} must be entered for the training")

        #TODO: if the conversion is only useful in the Training_Log, the functin could be methods
        elif speed == None:
            self.pace=pace
            self.speed=ch.calculate_speed_from_pace(self.pace)

        else:
            self.speed=speed
            self.pace=ch.calculate_pace_from_speed(self.speed)

        if not dog2:
            #this is useful if training dogs as a team
            self.dog2_name=dog2
        
        
    def __create_weather_entry(self, timestamp, temperature, humidity, sky_condition):
        self.weather_entry=Weather_Entry(timestamp, temperature, humidity, sky_condition)
        