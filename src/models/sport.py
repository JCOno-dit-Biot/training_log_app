from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class SportType(str, Enum):
    ON_SNOW = "on-snow"
    DRYLAND = "dryland"

class SportDisplayMode(str, Enum):
    SPEED = "speed"
    PACE = "pace"

class Sport(BaseModel):
    id: Optional[int] = None
    name: str
    type: SportType = Field(description="Dryland or on-snow", )
    display_mode: SportDisplayMode = Field(description = "display speed or pace depending on sport")


