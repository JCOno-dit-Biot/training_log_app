from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class AnalyticSummaryDog(BaseModel):
    dog_id: int
    name: str
    total_distance_km: float
    total_duration_hours: float
    avg_frequency_per_week: float
    avg_rating: float
    time_since_last_training: Optional[float] = None

class AnalyticSummary(BaseModel):
    total_distance_km: float
    total_duration_hours: float
    avg_frequency_per_week: float
    avg_rating: float
    time_since_last_training: Optional[float] = None
    per_dog: List[AnalyticSummaryDog]



