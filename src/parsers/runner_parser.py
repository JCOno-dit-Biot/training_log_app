from src.models.runner import Runner
from src.models.kennel import Kennel

def parse_runner_from_row(row: dict) -> Runner:
    return Runner(
        id = row['id'],
        name = row['name'],
        kennel=Kennel(id = row['k.id'],
                      name=row['kennel_name']),
        image_url=row.get('image_url') or ""
    )