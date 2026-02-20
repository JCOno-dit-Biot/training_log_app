from pydantic import BaseModel, Field
from typing import Optional

Lat = float
Lng = float

class Location(BaseModel):
    id: Optional[int] = None
    name: str
    latitude: Optional[Lat] = Field(default=None, ge=-90, le=90)
    longitude: Optional[Lng] = Field(default=None, ge=-180, le=180)

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[Lat] = Field(default=None, ge=-90, le=90)
    longitude: Optional[Lng] = Field(default=None, ge=-180, le=180)

class LocationWithUsage(Location):
    usage_count: int