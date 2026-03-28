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
    id = runner_repo.create(runner, 1)
    
    with runner_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM runners WHERE id = %s """, (id,))
        results = cur.fetchall()

    assert runner.id is None
    assert id == 4
    assert len(results) == 1
    assert results[0][1] == "John"
    assert results[0][-1] == 1

def test_get_runner_by_name(runner_repo):
    asterix = runner_repo.get_by_name("Asterix")
    assert asterix.id == 3
    assert asterix.name == "Asterix"
    assert asterix.kennel.name == 'Les Gaulois'
    
def test_get_runner_by_id(runner_repo):
    obelix = runner_repo.get_by_id(2)
    assert obelix.id == 2
    assert obelix.name == 'Obelix'
    assert obelix.kennel.name == 'Les Gaulois'

def test_get_all_runners(runner_repo):
    runner_list = runner_repo.get_all(2)
    assert len(runner_list) == 2
    assert runner_list[1].image_url is not None
    assert runner_list[1].name == "Asterix"
    assert runner_list[1].kennel.name == "Les Gaulois"

def test_get_all_runners_empty(runner_repo):
    runner_empty_list = runner_repo.get_all(100)
    assert len(runner_empty_list) == 0

def test_check_runner_exists_for_kennel(runner_repo):
    assert runner_repo.exists_for_kennel(2,2)

def test_does_not_delete_if_wrong_kennel(runner_repo, test_kennel):
    runner = Runner(
        name = "Obelix",
        kennel = test_kennel
    )
    runner_repo.delete(runner)

    with runner_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM runners WHERE name = 'Obelix' """)
        results = cur.fetchall()

    assert len(results) == 1 

def test_delete_runner(runner_repo):
    runner = Runner(
        name = "Asterix",
        kennel = Kennel(name = 'Les Gaulois')
    )
    runner_repo.delete(runner)

    with runner_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM runners WHERE name = 'Asterix' """)
        results = cur.fetchall()

    assert len(results) == 0    

def test_update_runner(runner_repo):

    fields={'name': 'Asterix-updated'}

    runner_repo.update(fields, 2)
    with runner_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM runners WHERE id=2 """)
        results = cur.fetchone()
    
    assert results[1] == 'Asterix-updated'

def test_update_runner_ignores_invalid_fields(runner_repo):

    updated = runner_repo.update({"not_a_real_column": "Tintin-updated"}, 1)

    with runner_repo._connection.cursor() as cur:
        cur.execute("SELECT name FROM runners WHERE id = %s", (1,))
        result = cur.fetchone()

    assert updated is False
    assert result[0] == "Tintin"