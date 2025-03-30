from src.models.dog import Dog
from src.models.kennel import Kennel

def parse_dog_from_row(row: dict) -> Dog:
    return Dog(
        name = row['name'],
        breed=row['breed'],
        date_of_birth=row['date_of_birth'],
        kennel=Kennel(name=row['kennel_name'])
    )