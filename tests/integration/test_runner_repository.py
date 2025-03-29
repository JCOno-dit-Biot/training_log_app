from src.models.runner import Runner
from src.models.kennel import Kennel
import pytest
from src.repositories.runner_repository import runner_repository
from datetime import date, timedelta

@pytest.fixture
def runner_repo(test_db_conn):
    print(test_db_conn)
    return runner_repository(test_db_conn)

@pytest.fixture()
def test_kennel():
    return Kennel(name = "Test Kennel")

def test_create_runner(runner_repo, test_kennel):
    runner = Runner(
        name = "John",
        kennel = test_kennel
    )
    runner_repo.create(runner, 1)
    
    with runner_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM runner WHERE name = 'John' """)
        results = cur.fetchall()

    print(results)
    assert len(results) == 1
    assert results[0][1] == "John"
    assert results[0][-1] == 1

def test_get_dog_by_name(runner_repo):
    asterix = runner_repo.get_by_name("Asterix")
    assert asterix.name == "Asterix"
    assert asterix.kennel == 'Gaulois'
    

def test_get_all_dogs(runner_repo):
    runner_list = runner_repo.get_all(2)
    assert len(runner_list) == 2

def test_get_all_dogs_empty(runner_repo):
    runner_empty_list = runner_repo.get_all(100)
    assert len(runner_empty_list) == 0

def test_delete_dog(runner_repo, test_kennel):
    runner = Runner(
        name = "Asterix",
        kennel = test_kennel
    )
    runner_repo.delete(runner)

    with runner_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM runners WHERE name = 'Asterix' """)
        results = cur.fetchall()

    assert len(results) == 0    