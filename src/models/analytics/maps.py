from pydantic import BaseModel
from typing import Optional

class LocationHeatPoint(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    day_count: int
    location_name: Optional[str] = None