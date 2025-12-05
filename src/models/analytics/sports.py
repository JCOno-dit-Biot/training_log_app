from pydantic import BaseModel
from datetime import date
from models.sport import SportType

class MostPracticedSport(BaseModel):
    sport: str
    count: int

class SportCount(BaseModel):
    sport_name: str
    sport_type: SportType
    activity_count: int