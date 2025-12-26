from pydantic import BaseModel
from typing import Optional

class LocationHeatPoint(BaseModel):
    latitude: float
    longitude: float
    day_count: int
    location_name: Optional[str] = None