import pytest
from unittest.mock import Mock, MagicMock
from fastapi import FastAPI, Request, Depends
from fastapi.testclient import TestClient
from src.api.activity_controller import router as activity_router
from src.repositories.activity_repository import activity_repository
from src.models.activity import Activity, ActivityCreate, ActivityUpdate
from datetime import datetime



@pytest.fixture
def mock_repo(test_activity):
    mock = Mock(spec=activity_repository)
    mock_activity = [test_activity, test_activity]
    mock.get_all.return_value = mock_activity
    mock.create.return_value = 3

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
    assert len(response.json()) == 2
    mock_repo.get_all.assert_called_once()
    mock_repo.get_all.assert_called_with(1)

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
    payload = {'id': 2, 'location':'Beach'}
    response =  client.put("/activities/2", json=payload)
    print(response)
    assert response.status_code == 200
    mock_repo.update.assert_called_once()
    mock_repo.update.assert_called_with(ActivityUpdate(**payload),2)

