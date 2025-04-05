from src.models.dog import Dog
from src.models.kennel import Kennel
from src.models.dog_weight import DogWeightEntry

def parse_weight_from_row(row: dict) -> DogWeightEntry:
    return DogWeightEntry(
        id = row['id'],
        date = row['date'],
        dog = Dog(
            id = row['dog_id'],
            name = row['name'],
            breed=row['breed'],
            date_of_birth=row['date_of_birth'],
            kennel=Kennel(name=row['kennel_name'])
        ),
        weight=row['weight']
    )