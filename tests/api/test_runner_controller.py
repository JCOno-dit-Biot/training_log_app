import pytest
from unittest.mock import Mock
from fastapi import FastAPI, Request, Depends
from fastapi.testclient import TestClient
from datetime import date
from src.api.runner_controller import router as runner_router
from src.repositories.runner_repository import runner_repository
from src.models.runner import Runner
from src.models.kennel import Kennel

@pytest.fixture
def mock_repo():
    mock = Mock(spec=runner_repository)
    mock.get_all.return_value = [Runner(
        name='John',
        kennel = Kennel(name='test_kennel')
    )]
    return mock

@pytest.fixture
def test_app(mock_repo):
    app = FastAPI()

    async def fake_jwt_verify(request: Request):
        request.state.kennel_id = 1

    # Override the repository dependency
    def override_repo():
        return mock_repo
    
    from src.deps import get_runner_repo, verify_jwt
    app.dependency_overrides[get_runner_repo] = override_repo
    app.dependency_overrides[verify_jwt] = fake_jwt_verify
    app.include_router(runner_router, dependencies=[Depends(verify_jwt)])
    
    return app

def test_list_runners_called(test_app, mock_repo):
    client = TestClient(test_app)

    response = client.get("/runners")

    expected_response = Runner(
        name='John',
        kennel = Kennel(name='test_kennel')
    )
    assert response.status_code == 200
    assert Runner(**response.json()[0]) == expected_response
    mock_repo.get_all.assert_called_once()

def test_create_runner(test_app, mock_repo):
    client = TestClient(test_app)

    # Fake input payload
    input_data = {
        "name": "John",
        'kennel': {'name': 'test_kennel'}
    }

    # What the repo will return (with an ID)
    returned_runner = Runner(**input_data)
    mock_repo.create.return_value = returned_runner

    response = client.post("/runners", json=input_data)

    assert response.status_code == 200
    assert Runner(**response.json()) == returned_runner
    mock_repo.create.assert_called_once_with(Runner(**input_data))
