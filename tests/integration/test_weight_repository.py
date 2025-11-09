from src.models.dog import Dog
from src.models.kennel import Kennel
from src.models.dog_weight import DogWeightEntry, DogWeightIn
from src.models.common import WeightQueryFilter
import pytest
from src.repositories.weight_repository import weight_repository
from datetime import date, timedelta
from datetime import datetime

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
        kennel = Kennel(id =2, name = 'Les Gaulois')
    )

def test_get_all(weight_repo, test_dog):
    weight_entries = weight_repo.get_all(test_dog.kennel.id, filters=WeightQueryFilter())
    assert len(weight_entries) == 4
    assert all(x.dog.name in ('Milou', "Fido", "Idefix") for x in weight_entries)

def test_get_all_with_time_filter(weight_repo, test_dog):
    filters = WeightQueryFilter(
        start_date=date(2025,1,3)
    )
    weight_entries = weight_repo.get_all(test_dog.kennel.id, filters)
    print(weight_entries)
    assert len(weight_entries) == 3
    assert all(x.dog.name in ('Milou', "Fido") for x in weight_entries)

def test_get_all_with_dog_filter(weight_repo, test_dog):
    filters = WeightQueryFilter(
       dog_id=2
    )
    weight_entries = weight_repo.get_all(test_dog.kennel.id, filters)
    assert len(weight_entries) == 1
    assert all(x.dog.name == "Fido" for x in weight_entries)

def test_get_count(weight_repo, test_dog):
    count = weight_repo.get_total_count(test_dog.kennel.id, filters=WeightQueryFilter(dog_id = 1))
    assert count == 3

def test_get_latest(weight_repo):
    latest_weights = weight_repo.get_latest(2)
    print(latest_weights)
    assert len(latest_weights) == 2
    assert latest_weights[0].dog_id == 1
    assert latest_weights[0].weight_change == pytest.approx(-1.4)
    assert latest_weights[0].latest_update == date(2025,3,5)
    assert latest_weights[1].dog_id == 2
    assert latest_weights[1].weight_change is None
    assert latest_weights[1].latest_update == date(2025,1,3)

def test_get_by_id(weight_repo):
    entry = weight_repo.get_by_id(4)
    assert entry.dog.name == 'Fido'
    assert entry.weight == 40.4
    assert entry.date == date(2025,1,3)

def test_create(weight_repo,test_dog):
    today = date.today()
    weight_entry = DogWeightIn(
        date = today,
        weight = 40.5,
        dog_id = 1
    )
    weight_repo.create(weight_entry, weight_entry.dog_id)
    with weight_repo._connection.cursor() as cur:
        cur.execute("""SELECT * FROM weight_entries WHERE date = %s AND dog_id = %s;""", (today, weight_entry.dog_id,))
        entry = cur.fetchall()
    assert len(entry) == 1
    assert entry[0][1]==1
    assert entry[0][3] == 40.5

def test_delete(weight_repo, test_dog):
    today = date.today()
    weight_entry = DogWeightEntry(
        id=5,
        date = today,
        weight = 40.5,
        dog = test_dog
    )
    weight_repo.delete(weight_entry.id)
    with weight_repo._connection.cursor() as cur:
        cur.execute("""SELECT * FROM weight_entries WHERE id = %s;""", (weight_entry.id,))
        entry = cur.fetchall()
    assert len(entry) == 0

def test_update_base_fields(weight_repo):
    fields = {
        "weight": 30.4,
        "date": '2025-06-10'
    }
    weight_repo.update(1, fields)

    with weight_repo._connection.cursor() as cur:
        cur.execute("SELECT weight, date FROM weight_entries WHERE id = 1")
        result = cur.fetchone()
        assert result[0] == 30.4
        assert result[1] == date(2025, 6, 10)