import pytest
from unittest.mock import Mock, MagicMock
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.testclient import TestClient
from src.api.activity_controller import router as activity_router
from src.repositories.activity_repository import activity_repository
from src.models.activity import Activity, ActivityCreate, ActivityUpdate
from src.models.common import ActivityQueryFilters
from datetime import datetime



@pytest.fixture(scope="function")
def mock_repo(test_activity):
    mock = Mock(spec=activity_repository)
    mock_activity = [test_activity, test_activity]
    mock.get_all.return_value = mock_activity
    mock.create.return_value = 3
    mock.get_total_count.return_value = 10
    mock.delete.retrun_value = True

    return mock

@pytest.fixture
def test_app(mock_repo):
    app = FastAPI()

    # Override the repository dependency
    def override_repo():
        return mock_repo

    #even though kennel id is not needed, the route is behind jwt so this is tested here
    async def fake_jwt_verify(request: Request):
        request.state.kennel_id = 1

    from src.deps import get_activity_repo, verify_jwt
    app.dependency_overrides[get_activity_repo] = override_repo
    app.dependency_overrides[verify_jwt] = fake_jwt_verify
    app.include_router(activity_router, dependencies=[Depends(verify_jwt)])

    return app

def test_get_activities(test_app, mock_repo):
    client = TestClient(test_app)

    response=client.get("/activities")
    assert response.status_code == 200
    assert len(response.json()["data"]) == 2
    mock_repo.get_all.assert_called_once()
    mock_repo.get_all.assert_called_with(1, 10, 0, ActivityQueryFilters())

def test_create_activity(test_app, mock_repo, test_activity_create):
    client = TestClient(test_app)

    response=client.post("/activities", 
                         data=test_activity_create.model_dump_json(),
                         headers={"Content-Type": "application/json"})
    assert response.status_code == 201
    mock_repo.create.assert_called_once()
    mock_repo.create.assert_called_with(test_activity_create)

def test_update_activity(test_app, mock_repo):
    client = TestClient(test_app)
    payload = {'speed':13.5}
    response =  client.put("/activities/2", json=payload)
    assert response.status_code == 200
    mock_repo.update.assert_called_once()
    mock_repo.update.assert_called_with(2, payload)

def test_create_bad_request(test_app, mock_repo,test_activity_create):
    mock_repo.create.return_value = None
    client = TestClient(test_app)
    response=client.post("/activities", 
                         content=test_activity_create.model_dump_json(),
                         headers={"Content-Type": "application/json"})
    
    assert response.status_code == 400
    assert response.json() == {"detail": "Bad request, activity could not be created"}

def test_update_activity_no_update_field(test_app):
    update = ActivityUpdate()
    client=TestClient(test_app)
    response = client.put("/activities/2",
                data = update.model_dump_json())
    
    assert response.status_code == 400
    assert response.json() == {"detail": "No data to update"}

def test_delete_activity(test_app, mock_repo):
    client = TestClient(test_app)
    response =  client.delete("/activities/2")
    assert response.status_code == 200
    mock_repo.delete.assert_called_once()
    mock_repo.delete.assert_called_with(2)