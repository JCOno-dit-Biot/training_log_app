import pytest
from unittest.mock import Mock
from fastapi import FastAPI, Request, Depends
from fastapi.testclient import TestClient
from src.api.location_controller import router as location_router
from src.repositories.location_repository import location_repository
from src.models.location import Location
from datetime import datetime


@pytest.fixture
def mock_repo():
    mock = Mock(spec=location_repository)
    mock.get_all.return_value = [
        Location(id = 1, kennel_id =2, name='Mock Location'),
        Location(id = 2, kennel_id =2, name='Mock Location 2'),
        Location(id = 3, kennel_id =2, name='Mock Location 3')
    ]
    mock.create.return_value = Location(id = 4, name = "Created New location")
    mock.update.return_value = True


    return mock

@pytest.fixture
def test_app(mock_repo):
    app = FastAPI()

    # Override the repository dependency
    def override_repo():
        return mock_repo

    #even though kennel id is not needed, the route is behind jwt so this is tested here
    async def fake_jwt_verify(request: Request):
        request.state.kennel_id = 2
        request.state.user_id = 1

    from src.deps import get_location_repo, verify_jwt
    app.dependency_overrides[get_location_repo] = override_repo
    app.dependency_overrides[verify_jwt] = fake_jwt_verify
    app.include_router(location_router, dependencies=[Depends(verify_jwt)])

    return app

def test_get_locations_called(test_app, mock_repo):
    client = TestClient(test_app)

    response = client.get("/locations")

    assert response.status_code == 200
    assert len(response.json()) == 3
    assert Location(**response.json()[0]).name == "Mock Location"
    mock_repo.get_all.assert_called_once()
    mock_repo.get_all.assert_called_with(2)


def test_create_location(test_app, mock_repo):
    client = TestClient(test_app)

    payload = {
            "name": "Inserted location"
        }
    
    response = client.post(url="/locations", json = payload)
    assert response.status_code == 200
    assert Location(**response.json()).id == 4
    mock_repo.create.assert_called_once()
    mock_repo.create.assert_called_with("Inserted location",2)


def test_delete_location(test_app, mock_repo):
    client = TestClient(test_app)

    res = client.delete("/locations/4")
    mock_repo.delete.assert_called_once()
    mock_repo.delete.assert_called_with(4, 2)

def test_delete_location_wrong_kennel(test_app, mock_repo):
    client = TestClient(test_app)
    mock_repo.delete.return_value = False
    response = client.delete('/locations/3')
    assert response.status_code == 404
    assert 'Location could not be deleted' in response.json()["detail"]

def test_update_locations(test_app, mock_repo):
    client = TestClient(test_app)

    payload = {
        "name": "updated location"
    }
    location = Location(**payload)
    response = client.put("/locations/2", json =location.model_dump())
    mock_repo.update.assert_called_once()
    assert response.status_code == 200
    assert response.json() == {"success": True}
    mock_repo.update.assert_called_with(update_name='updated location', id=2)

def test_update_location_update_fails(test_app, mock_repo):
    client = TestClient(test_app)
    mock_repo.update.return_value = False
    
    payload = {
        "name": "updated location"
    }
    location = Location(**payload)
    response = client.put("/locations/2", json=location.model_dump())

    assert response.status_code == 200
    assert response.json() == {"success": False}