from pydantic import BaseModel
from datetime import date

class MostPracticedSport(BaseModel):
    sport: str
    count: int
