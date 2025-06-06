from src.models.dog import Dog
from src.models.runner import Runner
from src.models.activity import Activity, ActivityLaps, ActivityDogs
from src.models.kennel import Kennel
from src.models.sport import Sport, SportType
from src.models.weather import Weather
from .dog_parser import parse_dog_from_row

from pydantic import ValidationError

def parse_activity_from_row(row: dict) -> Dog:
    laps=[]
    if row['laps'] is not None and len(row['laps']) > 0:
        for lap in row['laps']:
            laps.append(ActivityLaps(
                lap_number=lap['lap_number'],
                speed=lap['speed'],
                lap_distance=lap['lap_distance'],
                lap_time_delta=lap['lap_time']
            ))

    #there should always be at least one dog
    dogs=[]
    for dog in row['dogs']:
        dog['kennel_name'] = row['kennel_name']
        dog['kennel_id'] = row['kennel_id']
        dogs.append(ActivityDogs(
            dog= parse_dog_from_row(dog),
            rating = dog['rating']
        ))

    try:
        weather = Weather(temperature=row.get('temperature'), humidity=row.get("humidity"), condition=row.get('condition'))
    except (ValueError, ValidationError) as validation_error:
        #logging.warning("no weather entry for this activity")
        weather = None
    

    return Activity(
        id=row['id'],
        timestamp=row['timestamp'],
        sport=Sport(name = row['sport_name'], type=SportType(row['sport_type'])),
        runner=Runner(name=row['runner_name'], id = row["runner_id"]),
        weather = weather,
        location = row['location'],
        distance=row['distance'],
        speed = row['speed'],
        workout=row['workout'],
        notes=row['notes'],
        laps = laps,
        dogs = dogs
    )