import pytest
from src.repositories.location_repository import location_repository, DuplicateLocationError
from src.models import Location, LocationUpdate
from datetime import datetime

@pytest.fixture
def location_repo(test_db_conn):
    return location_repository(test_db_conn)

@pytest.fixture
def test_location_no_id():
    return Location(
        name = "Forest Loop",
        latitude = 53.5501,
        longitude =  -113.469
    )

@pytest.fixture
def test_location():
    return Location(
        id = 1,
        name = "Forest Loop"
    )


def test_get_all(location_repo):
    locations = location_repo.get_all(kennel_id = 1)
    assert len(locations) == 2
    assert all([isinstance(location, Location) for location in locations])

def test_get_by_id(location_repo):
    loc = location_repo.get_by_id(1, kennel_id = 1)
    assert isinstance(loc, Location)
    assert loc.name == "Forest Loop"
    assert loc.id == 1

def test_get_by_name(location_repo):
    loc = location_repo.get_by_name("Forest Loop", kennel_id = 1)
    assert isinstance(loc, Location)
    assert loc.name == "Forest Loop"
    assert loc.id == 1

def test_create(test_location_no_id, location_repo):
    location = location_repo.create(test_location_no_id.name, kennel_id = 2)
   
    with location_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_locations WHERE id = %s """, (location.id,))
        result = cur.fetchone()


    assert result is not None
    assert result[0] == location.id
    assert result[2] == test_location_no_id.name.lower()

def test_create_already_exists(location_repo):
    with pytest.raises(DuplicateLocationError, match = 'Location: Mountain Trail already exists for this kennel'):
        location_repo.create('Mountain Trail', 2)

def test_update_location(location_repo):
    with location_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_locations WHERE id = 1""")
        result = cur.fetchone()

    assert result[1] == 1
    assert result[2] == 'Forest Loop'
  
    location_repo.update({'name':'Forest Loop modified'}, 1)
    with location_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_locations WHERE id = 1""")
        result = cur.fetchone()

    assert result[1] == 1
    assert result[2] == 'Forest Loop modified'

def test_update_gps_coord(location_repo):
    with location_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_locations WHERE id = 2""")
        result = cur.fetchone()

        assert result[-1] == -114.469
        assert result[-2] == 53.5001

    location_update=LocationUpdate(latitude=53.5005, longitude=-114.5)

    location_repo.update(location_update.model_dump(exclude_none=True), 2)
    with location_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_locations WHERE id = 2""")
        result = cur.fetchone()

    assert result[-1] == -114.5
    assert result[-2] == 53.5005


def test_delete_location(location_repo):
    res = location_repo.delete(4, 2)
    with location_repo._connection.cursor() as cur:
        cur.execute(""" SELECT * FROM activity_locations WHERE id = 4""")
        result = cur.fetchone()
    assert res == True
    assert result is None


