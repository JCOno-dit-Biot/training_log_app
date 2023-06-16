from datetime import datetime
from dateutil.relativedelta import relativedelta

import constants as c
import calculation_helpers as ch
class Kennel:

    def __init__(self, name: str):
        self.name=name

class Dog:

    def __init__ (self, name: str, DOB: datetime, kennel: Kennel ):
        self.name=name
        self.DOB=DOB.date()
        self.kennel=kennel

    def calculate_dog_age(self, date: str)  -> float:

        date=datetime.strptime(date, '%Y/%m/%d')
        self.age=(c.MONTHS_IN_YEAR*relativedelta(date, self.DOB).years+relativedelta(date, self.DOB).months)/c.MONTHS_IN_YEAR
        return self.age

class Runner:

    def __init__(self, name: str, kennel: Kennel):
        self.name=name
        self.kennel=kennel

#could make use of descriptors for validation? True for most classes below
class Dog_Weight:

    def __init__(self, dog: Dog, date: str, weight: float):
        dog.calculate_dog_age(date)
        self.dog_name=Dog.name
        self.dog_age=Dog.age
        self.weight=weight


class Weather:

    def __init__(self, temperature, humidity, sky_condition = None):
        self.temperature = temperature
        self.humidity=humidity/100
        if sky_condition:
            if sky_condition in c.SKY_CONDITION_LIST:
                self.sky_condition=sky_condition
            else:
                raise ValueError(f'The sky condition must be one of the following: {c.SKY_CONDITION_LIST}')

class Training_Log:
    #assumes that pace has the following format "00:00:00" --> need data validation
    def __init__(self, timestamps, dog1:Dog, sport, runner:Runner, location, distance, rating, speed=None, pace=None, dog2= None, workout = False ) -> None:
        self.date=timestamps.date()
        self.time=timestamps.time()
        self.dog1=dog1
        self.runner=runner
        self.sport=sport
        self.location=location
        self.distance=distance
        self.rating = rating
        self.workout=workout

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
            self.dog2=dog2
        
        

        