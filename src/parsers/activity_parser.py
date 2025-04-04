from src.models.dog import Dog
from src.models.runner import Runner
from src.models.activity import Activity, ActivityLaps, ActivityDogs
from src.models.kennel import Kennel
from src.models.sport import Sport
from .dog_parser import parse_dog_from_row

def parse_activity_from_row(row: dict) -> Dog:
    laps=[]
    if row['laps'] is not None and len(row['laps']) > 0:
        for lap in row['laps']:
            laps.append(ActivityLaps(
                lap_number=lap['lap_number'],
                speed=lap['speed']
            ))

    #there should always be at least one dog
    dogs=[]
    for dog in row['dogs']:
        dog['kennel_name'] = row['kennel_name']
        dogs.append(ActivityDogs(
            dog= parse_dog_from_row(dog),
            rating = dog['rating']
        ))
    return Activity(
        id=row['id'],
        timestamp=row['timestamp'],
        sport=Sport(name = row['sport_name']),
        runner=Runner(name=row['runner_name']),
        location = row['location'],
        distance=row['distance'],
        speed = row['speed'],
        workout=row['workout'],
        notes=row['notes'],
        laps = laps,
        dogs = dogs
    )