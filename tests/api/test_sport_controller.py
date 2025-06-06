import pytest
from unittest.mock import Mock
from fastapi import FastAPI, Request, Depends
from fastapi.testclient import TestClient
from datetime import date
from src.api.sport_controller import router as sport_router
from src.repositories.sport_repository import sport_repository
from src.models.sport import Sport


@pytest.fixture
def mock_repo():
    mock = Mock(spec=sport_repository)
    mock.get_all.return_value = [Sport(
        name = 'Canicross', type = 'dryland', display_mode= 'pace'
    ),
    Sport(
        name = 'Bikejoring', type = 'dryland', display_mode= 'speed'
    )
    ]
    mock.get_by_name.return_value = Sport(
        name = 'Canicross', type = 'dryland', display_mode= 'pace'
    )
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

    from src.deps import get_sport_repo, verify_jwt
    app.dependency_overrides[get_sport_repo] = override_repo
    app.dependency_overrides[verify_jwt] = fake_jwt_verify
    app.include_router(sport_router, dependencies=[Depends(verify_jwt)])

    return app

def test_list_sports_called(test_app, mock_repo):
    client = TestClient(test_app)

    response = client.get("/sports")

    expected_response = Sport(
        name = 'Canicross', type = 'dryland', display_mode= 'pace'
    )
    assert response.status_code == 200
    assert Sport(**response.json()[0]) == expected_response
    mock_repo.get_all.assert_called_once()

def test_get_sport_by_name(test_app, mock_repo):
    client = TestClient(test_app)

    response = client.get("/sports/canicross")
    expected_response = Sport(
        name = 'Canicross', type = 'dryland', display_mode= 'pace'
    )
    assert response.status_code == 200
    assert Sport(**response.json()) == expected_response
    mock_repo.get_by_name.assert_called_once()