from src.parsers.dog_parser import parse_dog_from_row
from src.parsers.runner_parser import parse_runner_from_row
from datetime import date

def test_dog_parser():
    row = {
        'name' : 'Fido',
        'breed' : 'labrador',
        'date_of_birth' : '2024-01-01',
        'kennel_name' : 'test_kennel'
    }

    dog = parse_dog_from_row(row)

    assert dog.name == 'Fido'
    assert dog.breed == 'labrador'
    assert dog.date_of_birth == date(2024,1,1)
    assert dog.kennel.name == 'test_kennel'

def test_runner_parser():
    row = {
        'name' : 'John',
        'kennel_name' : 'test_kennel'
    }

    runner = parse_runner_from_row(row)

    assert runner.name == 'John'
    assert runner.kennel.name == 'test_kennel'
