from pydantic import BaseModel
from datetime import date
from typing import Optional
from enum import Enum

class Trend(str, Enum):
    up = "up"
    down = "down"
    same = "same"

class WeeklyMileage(BaseModel):
    dog_id: str
    week_start: date
    total_distance_km: float
    previous_week_distance_km: Optional[float] = None
    trend: Optional[Trend] = None  
