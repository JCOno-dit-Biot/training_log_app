from pydantic import BaseModel, Field, model_validator
from typing import Optional
from .dog import Dog
from datetime import date


class DogWeightEntry(BaseModel):
    id: Optional[int]
    date: date
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