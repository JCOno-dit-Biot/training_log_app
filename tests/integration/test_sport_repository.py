from src.models.sport import Sport
import pytest
from src.repositories.sport_repository import sport_repository
from datetime import date, timedelta


@pytest.fixture
def sport_repo(test_db_conn):
    return sport_repository(test_db_conn)

def test_get_all_sports(sport_repo):
    sports = sport_repo.get_all()
    assert len(sports) == 2
    assert all([sport.name.lower() in ['canicross', 'bikejoring'] for sport in sports])

@pytest.mark.parametrize("sport_name, expected", 
                         [
                             ('canicross', 'Canicross'),
                             ('Canicross', 'Canicross'),
                             ('CaNiCross', 'Canicross'),
                             ('cani', None)
                         ])
def test_get_sport_by_name(sport_repo, sport_name, expected):
    sport = sport_repo.get_by_name(sport_name)
    if expected is not None:
        assert sport.name == expected
        assert sport.id == 1
        assert sport.type == "dryland"
        assert sport.display_mode == 'pace'
    else:
        assert sport is None


def test_get_by_id(sport_repo):
    sport = sport_repo.get_by_id(2)
    assert sport is not None
    assert sport.name.lower() == 'bikejoring'
    assert sport.id == 2

def test_non_implemented_methods(sport_repo):
    with pytest.raises(NotImplementedError):
        sport_repo.create()
    with pytest.raises(NotImplementedError):
        sport_repo.delete()