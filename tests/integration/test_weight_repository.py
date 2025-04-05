from src.models.dog import Dog
from src.models.kennel import Kennel
from src.models.dog_weight import DogWeightEntry
import pytest
from src.repositories.weight_repository import weight_repository
from datetime import date, timedelta

@pytest.fixture
def weight_repo(test_db_conn):
    print(test_db_conn)
    return weight_repository(test_db_conn)

@pytest.fixture
def test_dog():
    return Dog(
        id=1,
        name = "Milou",
        breed = "Terrier",
        date_of_birth = date(2023,1,1),
        kennel = Kennel(name = 'Les Gaulois')
    )

def test_get_all(weight_repo, test_dog):
    weight_entries = weight_repo.get_all(test_dog)
    assert len(weight_entries) == 3
    assert all(x.dog.name == 'Milou' for x in weight_entries)

def test_get_by_id(weight_repo):
    entry = weight_repo.get_by_id(4)
    assert entry.dog.name == 'Fido'
    assert entry.weight == 40.4
    assert entry.date == date(2025,1,3)

def test_create(weight_repo,test_dog):
    today = date.today()
    weight_entry = DogWeightEntry(
        date = today,
        weight = 40.5,
        dog = test_dog
    )
    weight_repo.create(weight_entry)
    with weight_repo._connection.cursor() as cur:
        cur.execute("""SELECT * FROM weight_entries WHERE date = %s AND dog_id = %s;""", (today, test_dog.id,))
        entry = cur.fetchall()
    assert len(entry) == 1

def test_delete(weight_repo, test_dog):
    today = date.today()
    weight_entry = DogWeightEntry(
        id=5,
        date = today,
        weight = 40.5,
        dog = test_dog
    )
    weight_repo.delete(weight_entry)
    with weight_repo._connection.cursor() as cur:
        cur.execute("""SELECT * FROM weight_entries WHERE id = %s;""", (weight_entry.id,))
        entry = cur.fetchall()
    assert len(entry) == 0
