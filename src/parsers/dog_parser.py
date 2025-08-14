from src.models.dog import Dog
from src.models.kennel import Kennel

def parse_dog_from_row(row: dict) -> Dog:
    return Dog(
        id = row['id'],
        name = row['name'],
        breed=row['breed'],
        color=row['color'],
        date_of_birth=row['date_of_birth'],
        kennel=Kennel(id = row['kennel_id'], name=row['kennel_name']),
        image_url=row.get('image_url') or ""
    )