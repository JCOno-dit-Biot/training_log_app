from pydantic import BaseModel
from datetime import date

class DogCalendarDay(BaseModel):
    date: date
    dog_ids: list[int]