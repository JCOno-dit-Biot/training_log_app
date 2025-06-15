from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime, timedelta
from typing import Optional, List
from .runner import Runner
from .sport import Sport
from .dog import Dog
from .weather import Weather
import src.calculation_helpers as ch

# SPORT_PACE_DISPLAY = {'canicross', 'canihike', 'canirando', 'skijoring'}

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
    speed: Optional[float] = Field(None, description="Speed in km per hours")
    pace: Optional[str] = Field(None, description="Pace in min per km")
    comment_count: Optional[int] = Field(None, description="number of comment for an activity")

    @model_validator(mode="after")
    def ensure_at_least_one_metric(cls, values):
        if values.speed is None and values.pace is None:
            raise ValueError(f"At least one of 'speed' or 'pace' must be provided the activity")
        
        # calculate pace from speed if not provided
        if values.speed and values.pace is None:
            values.pace = ch.calculate_pace_from_speed(values.speed)

        if values.pace and values.speed is None:
            values.speed = ch.calculate_speed_from_pace(values.pace)

        # Ensure at least one lap is provided if workout is set to true
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

class ActivityCreate(BaseModel):
    id: Optional[int] = None
    timestamp: datetime
    runner_id: int
    sport_id: int
    location: str #could modify and use GPS coordinates instead
    distance: float
    workout: bool = False
    dogs: List["ActivityDogsCreate"]
    weather: Optional[Weather] = Field(None, description="Weather entry for the training")
    laps: Optional[List[ActivityLaps]] = Field([], description="list of laps with pace or speed")
    speed: Optional[float] = Field(None, description="Speed in km per hours")
    pace: Optional[str] = Field(None, description="Pace in min per km")

    @model_validator(mode="after")
    def ensure_at_least_one_metric(cls, values):
        if values.speed is None and values.pace is None:
            raise ValueError(f"At least one of 'speed' or 'pace' must be provided the activity")
        
        # calculate pace from speed if not provided
        if values.speed and values.pace is None:
            values.pace = ch.calculate_pace_from_speed(values.speed)

        if values.pace and values.speed is None:
            values.speed = ch.calculate_speed_from_pace(values.pace)

        # Ensure at least one lap is provided if workout is set to true
        if values.workout and (values.laps is None or len(values.laps) == 0):
            raise ValueError(f"Laps cannot be None or an empty list if Workout is set to True")
        return values
    
class ActivityUpdate(BaseModel):
    id: int
    timestamp: Optional[datetime] = None
    runner_id: Optional[int] = None
    sport_id: Optional[int] = None
    location: Optional[str] = None
    distance: Optional[float] = None
    workout: Optional[bool] = None
    dogs: Optional[List["ActivityDogsCreate"]] = None
    weather: Optional[Weather] = None
    laps: Optional[List[ActivityLaps]] = None
    speed: Optional[float] = None
    pace: Optional[str] = None

    @model_validator(mode="after")
    def ensure_needed_metrics_are_present(cls, values):
        #the db only saves speed not pace
        if values.pace and values.speed is None:
            values.speed = ch.calculate_speed_from_pace(values.pace)

        # Ensure at least one lap is provided if workout is set to true
        if values.workout and (values.laps is None or len(values.laps) == 0):
            raise ValueError(f"Laps cannot be None or an empty list if Workout is set to True")


class ActivityDogs(BaseModel):
    id: Optional[int] = None
    dog: Dog
    rating: Optional[int] = Field(None, description="Training rating out of 10", ge=0, le=10)

    
class ActivityDogsCreate(BaseModel):
    id: Optional[int] = None
    dog_id: int
    rating: Optional[int] = Field(None, description="Training rating out of 10", ge=0, le=10)