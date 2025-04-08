from pydantic import BaseModel
from datetime import date
from typing import Optional
from .kennel import Kennel

class Dog(BaseModel):
    id: Optional[int] = None
    name: str
    breed: str
    date_of_birth: date
    kennel: Optional[Kennel] = None
    image_url: Optional[str] = ""

    def calculate_dog_age(self, as_of_date: date = None) -> float:
        """
        Calculate the age of the dog as a float, where the decimal represents the fraction of the year elapsed.

        :param as_of_date: The date to calculate the age for. Defaults to today.
        :return: The age of the dog in years as a float.
        """
        as_of_date = as_of_date or date.today()
        if as_of_date < self.date_of_birth:
            raise ValueError("The as_of_date cannot be earlier than the dog's date of birth.")
        
        # Calculate full years
        age_years = as_of_date.year - self.date_of_birth.year
        # Adjust for incomplete year
        birth_anniversary = date(as_of_date.year, self.date_of_birth.month, self.date_of_birth.day)
        if as_of_date < birth_anniversary:
            age_years -= 1
            birth_anniversary = date(as_of_date.year - 1, self.date_of_birth.month, self.date_of_birth.day)

        # Calculate the fraction of the year elapsed
        days_in_year = (date(as_of_date.year + 1, 1, 1) - date(as_of_date.year, 1, 1)).days
        days_since_last_anniversary = (as_of_date - birth_anniversary).days
        fractional_year = days_since_last_anniversary / days_in_year

        return age_years + fractional_year

    