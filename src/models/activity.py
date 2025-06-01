from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime, timedelta
from typing import Optional, List
from .runner import Runner
from .sport import Sport
from .dog import Dog
from .weather import Weather
import src.calculation_helpers as ch

SPORT_PACE_DISPLAY = {'canicross', 'canihike'}

class Activity(BaseModel):
    id: Optional[int] = None
    timestamp: datetime
    runner: Runner
    sport: Sport
    location: str #could modify and use GPS coordinates instead
    distance: float
    workout: bool = False
    dogs: List["ActivityDogs"]
    weather: Optional[Weather] = Field(None, description="Weather entry for the training")
    laps: Optional[List["ActivityLaps"]] = Field([], description="list of laps with pace or speed")
    notes: Optional[str] = Field(None, description="Short comment regarding the training")
    speed: Optional[float] = Field(None, description="Speed in km per hours")
    pace: Optional[str] = Field(None, description="Pace in min per km")

    @model_validator(mode="after")
    def ensure_at_least_one_metric(cls, values):
        if values.speed is None and values.pace is None:
            raise ValueError(f"At least one of 'speed' or 'pace' must be provided the activity")
        return values

    @model_validator(mode="after")
    def calculate_pace_if_running(cls, values) -> str:
        """
        Automatically calculate pace for running based on speed.
        """
        sport = values.sport
        if sport and sport.name.lower() in SPORT_PACE_DISPLAY:
            values.pace = ch.calculate_pace_from_speed(values.speed)
        return values
    
    @model_validator(mode="after")
    def ensure_lap_provided_if_workout(cls, values) -> str:
        """
        Automatically calculate pace for running based on speed.
        """
        if values.workout and (values.laps is None or len(values.laps) == 0):
            raise ValueError(f"Laps cannot be None or an empty list if Workout is set to True")
        return values
    
class ActivityLaps(BaseModel):
    lap_number: int
    lap_distance: float
    lap_time: Optional[str] = None
    lap_time_delta: Optional[timedelta] = None
    speed: Optional[float] = Field(None, description="Speed in km per hours")
    pace: Optional[str] = Field(None, description="Pace in min per km")

    @model_validator(mode='after')
    def derive_fields(cls, values):
        lap_time = values.lap_time
        lap_time_delta = values.lap_time_delta
        speed = values.speed
        pace = values.pace
        lap_distance = values.lap_distance

        if lap_time is None and lap_time_delta is None and speed is None and pace is None:
            raise ValueError("Must specify at least one of: lap_time, lap_time_delta, speed or pace")
        
        # Derive lap_time_delta if missing
        if lap_time_delta is None and lap_time is not None:
            values.lap_time_delta = ch.convert_str_time_to_timedelta(lap_time)
            lap_time_delta = values.lap_time_delta

        # Derive lap_time if missing
        if lap_time is None and lap_time_delta is not None:
            total_seconds = int(lap_time_delta.total_seconds())
            minutes, seconds = divmod(total_seconds, 60)
            values.lap_time = f"{minutes:02}:{seconds:02}"
            lap_time = values.lap_time

        # Derive speed from time + distance
        if speed is None and lap_time is not None and lap_distance is not None:
            values.speed = ch.calculate_speed_from_time_distance(lap_distance, lap_time)
            speed = values.speed

        # Derive speed from pace
        if speed is None and pace is not None:
            values.speed = ch.calculate_speed_from_pace(pace)
            speed = values.speed

        # Derive pace from speed
        if pace is None and speed is not None:
            values.pace = ch.calculate_pace_from_speed(speed)

        return values

    # @model_validator(mode="after")
    # def calculate_speed_from_time_distance(cls, values):
    #     if values.lap_distance is not None and values.lap_time is not None:
    #         values.lap_time_delta = ch.convert_str_time_to_timedelta(values.lap_time)
    #         values.speed = ch.calculate_speed_from_time_distance(values.lap_distance, values.lap_time)
    #     return values

    # @model_validator(mode="after")
    # def calculate_speed_if_not_provided(cls,values):
    #     """
    #     Speed is saved the quantity saved in the database so it must always be calculated
    #     """
    #     if values.speed is None and values.pace is not None:
    #         values.speed = ch.calculate_speed_from_pace(values.pace)
    #     return values
    
    # @model_validator(mode="after")
    # def calculate_lap_time_if_only_delta(cls,values):
    #     """
    #     Set lap_time string (MM:SS) based on lap_time_delta if lap_time is missing.
    #     Speed is saved separately so lap_time must always be consistent.
    #     """
    #     if values.lap_time is None and values.lap_time_delta is not None:
    #         total_seconds = int(values.lap_time_delta.total_seconds())
    #         minutes, seconds = divmod(total_seconds, 60)
    #         values.lap_time = f"{minutes:02}:{seconds:02}"

    #     return values
    
    # @model_validator(mode="after")
    # def calculate_pace_if_not_provided(cls,values):
    #     if values.pace is None and values.speed is not None:
    #         values.pace = ch.calculate_pace_from_speed(values.speed)
    #     return values

class ActivityDogs(BaseModel):
    id: Optional[int] = None
    dog: Dog
    rating: Optional[int] = Field(None, description="Training rating out of 10", ge=0, le=10)