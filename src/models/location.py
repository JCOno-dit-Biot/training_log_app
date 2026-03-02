from pydantic import BaseModel, Field, model_validator
from typing import Optional

Lat = float
Lng = float

class Location(BaseModel):
    id: Optional[int] = None
    name: str
    latitude: Optional[Lat] = Field(default=None, ge=-90, le=90)
    longitude: Optional[Lng] = Field(default=None, ge=-180, le=180)

    @model_validator(mode="after")
    def both_or_none(self):
        lat, lng = self.latitude, self.longitude
        if (lat is None) ^ (lng is None):
            raise ValueError("Provide both latitude and longitude, or neither.")
        return self

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[Lat] = Field(default=None, ge=-90, le=90)
    longitude: Optional[Lng] = Field(default=None, ge=-180, le=180)

    @model_validator(mode="after")
    def both_or_none(self):
        lat, lng = self.latitude, self.longitude
        if (lat is None) ^ (lng is None):
            raise ValueError("Provide both latitude and longitude, or neither.")
        return self

class LocationWithUsage(Location):
    usage_count: int