from pydantic import BaseModel, Field, model_validator
from typing import Optional
from .dog import Dog
import datetime


class DogWeightEntry(BaseModel):
    id: Optional[int] = None
    date: datetime.date
    dog: Dog
    weight: float
    age: Optional[float] = Field(None, description="The age of the dog at the time of the weight entry")

    
    @model_validator(mode='after')
    def get_dog_age(cls, values):
        """
        Automatically calculate the dog's age during model instantiation.
        """
        values.age = values.dog.calculate_dog_age(as_of_date=values.date)
        return values
    
class DogWeightIn(BaseModel):
    dog_id: Optional[int] = None
    weight: float
    date: datetime.date

class DogWeightUpdate(BaseModel):
    weight: Optional[float] = None
    date: Optional[datetime.date] = None

class DogWeightLatest(BaseModel):
    dog_id: int
    latest_weight: float
    latest_update: datetime.date
    weight_change: Optional[float] = None # account for possible nulls (only 1 weight entry in db)