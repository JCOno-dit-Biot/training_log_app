from pydantic import BaseModel
from typing import Optional

class Location(BaseModel):
    id: Optional[int] = None
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None