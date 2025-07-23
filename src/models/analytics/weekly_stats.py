from pydantic import BaseModel, model_validator
from datetime import date
from typing import Optional
from enum import Enum

class Trend(str, Enum):
    up = "up"
    down = "down"
    same = "same"

class WeeklyStats(BaseModel):
    dog_id: int
    week_start: date
    total_distance_km: float
    previous_week_distance_km: Optional[float] = None
    average_rating: Optional[float] = None
    previous_week_average_rating: Optional[float] = None
    trend_distance: Optional[Trend] = None  
    trend_rating: Optional[Trend] = None 

    @model_validator(mode="after")
    def compute_trends(self) -> "WeeklyStats":
        # Distance trend with 0.5 km threshold
        diff_distance = self.total_distance_km - (self.previous_week_distance_km or 0)
        if abs(diff_distance) <= 0.5:
            self.trend_distance = Trend.same
        elif diff_distance > 0.5:
            self.trend_distance = Trend.up
        else:
            self.trend_distance = Trend.down

        # Rating trend with 0.2 rating units threshold
        if self.average_rating is None or self.previous_week_average_rating is None:
            self.trend_rating = None
        else:
            diff = self.average_rating - self.previous_week_average_rating
            if abs(diff) <= 0.2:
                self.trend_rating = Trend.same
            elif diff > 0.2:
                self.trend_rating = Trend.up
            else:
                self.trend_rating = Trend.down


        return self