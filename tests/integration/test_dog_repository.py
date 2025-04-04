from src.models.dog import Dog
from src.models.kennel import Kennel
import pytest
from src.repositories.dog_repository import dog_repository
from datetime import date, timedelta

@pytest.fixture
def dog_repo(test_db_conn):
    print(test_db_conn)
    return dog_repository(test_db_conn)

@pytest.fixture()
def test_kennel():
    return Kennel(name = "Test Kennel")

def test_create_dog(dog_repo, test_kennel):
    dog = Dog(
        name = "Buddy",
        breed = "Labrador",
        date_of_birth = date.today() - timedelta(weeks = 52),
        kennel = test_kennel
    )
    
    id = dog_repo.create(dog, 1)
    with dog_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM dogs WHERE name = 'Buddy' """)
        results = cur.fetchall()

    assert dog.id is None
    assert id == 4
    #update dog
    dog.id = id
    assert dog.id is not None
    assert len(results) == 1
    assert results[0][1] == "Buddy"
    assert results[0][-1] == 1

def test_get_dog_by_name(dog_repo):
    Idefix = dog_repo.get_by_name("Milou")[0]
    assert Idefix.name == "Milou"
    assert Idefix.breed == "Terrier"
    assert Idefix.date_of_birth == date(2023, 1, 1)

def test_get_dog_by_id(dog_repo):
    dog = dog_repo.get_by_id(2)
    assert dog.id == 2
    assert dog.name == 'Fido'
    assert dog.kennel.name== 'Les Gaulois'

def test_get_all_dogs(dog_repo):
    dog_list = dog_repo.get_all(2)
    assert len(dog_list) == 2

def test_get_all_dogs_empty(dog_repo):
    dog_empty_list = dog_repo.get_all(100)
    assert len(dog_empty_list) == 0

# Not ideal as this means tests depend on each other but it prevents issues when running 
# tests multiple times
def test_delete_dog(dog_repo, test_kennel):
    dog = Dog(
        name = "Buddy",
        breed = "Labrador",
        date_of_birth = date.today() - timedelta(weeks = 52),
        kennel = test_kennel
    )
    dog_repo.delete(dog)

    with dog_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM dogs WHERE name = %s """, (dog.name,))
        results = cur.fetchall()

    assert len(results) == 0    