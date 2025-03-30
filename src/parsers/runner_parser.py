from src.models.runner import Runner
from src.models.kennel import Kennel

def parse_runner_from_row(row: dict) -> Runner:
    return Runner(
        name = row['name'],
        kennel=Kennel(name=row['kennel_name'])
    )