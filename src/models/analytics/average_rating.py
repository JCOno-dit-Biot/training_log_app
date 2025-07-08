from pydantic import BaseModel
from datetime import date

class AverageRating(BaseModel):
    dog_id: str
    average_rating: float


