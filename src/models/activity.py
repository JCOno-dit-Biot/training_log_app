from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime
from typing import Optional
from .runner import Runner
from .sport import Sport
import src.calculation_helpers as ch

SPORT_PACE_DISPLAY = {'canicross', 'canihike'}

class Activity(BaseModel):

    timestamp: datetime
    runner: Runner
    sport: Sport
    location: str #could modify and use GPS coordinates instead
    distance: float
    workout: bool
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



