import pytest
from auth.models.kennel import Kennel
from auth.repositories.kennelRepository import KennelRepository

@pytest.fixture
def kennel_repo():
    return KennelRepository()

def test_get_all(kennel_repo):
    kennel_list = kennel_repo.get_all()
    assert len(kennel_list) == 2
    assert isinstance(kennel_list[0], Kennel)
    assert kennel_list[0].name in ('Test Kennel', 'Les Gaulois')

def test_get_by_name(kennel_repo):
    kennel_id = kennel_repo.get_by_name('Test Kennel')
    assert kennel_id == 1

def test_create_kennel(kennel_repo):
    new_kennel_id = kennel_repo.create('New kennel')
    assert new_kennel_id == 3