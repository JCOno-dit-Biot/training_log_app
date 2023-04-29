from datetime import datetime
from dateutil.relativedelta import relativedelta

MONTHS_IN_YEAR=12

class Dog:

    def __init__ (self, name: str, DOB):
        self.name=name
        self.DOB=DOB.date()

    def calculate_dog_age(self)  -> float:
        today=datetime.today().date()
        self.age=(MONTHS_IN_YEAR*relativedelta(today, self.DOB).years+relativedelta(today, self.DOB).months)/MONTHS_IN_YEAR
        return self.age



Luna=Dog('Luna', datetime(2017,4,16))
print(Luna.calculate_dog_age())