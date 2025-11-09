import pytest
from unittest.mock import Mock
from fastapi import FastAPI, Request, Depends
from fastapi.testclient import TestClient
from src.api.weight_controller import router as weight_router
from src.repositories.weight_repository import weight_repository
from src.models.dog_weight import DogWeightEntry, DogWeightUpdate, DogWeightIn, DogWeightLatest
from src.models.common import WeightQueryFilter
from datetime import date


@pytest.fixture
def mock_repo(dog_fixture):
    mock = Mock(spec=weight_repository)
    mock.get_all.return_value = [
        DogWeightEntry(date= date(2025,1,1),
                       dog = dog_fixture,
                       weight = 20.1),
        DogWeightEntry(date= date(2025,2,1),
                       dog = dog_fixture,
                       weight = 20.4),
        DogWeightEntry(date= date(2025,3,1),
                       dog = dog_fixture,
                       weight = 19.9),
    ]
    mock.get_latest.return_value = [
        DogWeightLatest(
            dog_id = 1,
            latest_update=date.today(),
            latest_weight = 20.1,
            weight_change=0.5
        )
    ]
    mock.create.return_value = 10

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

    from src.deps import get_weight_repo, verify_jwt
    app.dependency_overrides[get_weight_repo] = override_repo
    app.dependency_overrides[verify_jwt] = fake_jwt_verify
    app.include_router(weight_router, dependencies=[Depends(verify_jwt)])

    return app

def test_get_weight_called(test_app, mock_repo):
    client = TestClient(test_app)

    response = client.get("/dogs/weights")

    assert response.status_code == 200
    assert DogWeightEntry(**response.json()[0]).dog.name == "Milou"
    mock_repo.get_all.assert_called_once()
    mock_repo.get_all.assert_called_with(1, WeightQueryFilter())

def test_get_latest_called(test_app, mock_repo):
    client = TestClient(test_app)

    response = client.get("/dogs/latest")
    assert response.status_code == 200
    assert DogWeightLatest(**response.json()[0]).dog_id == 1
    mock_repo.get_latest.assert_called_once()
    mock_repo.get_latest.assert_called_with(1)


def test_create_weight_entry(test_app, mock_repo, dog_fixture):
    client = TestClient(test_app)

    dog_weight_entry = DogWeightIn(
        date= date(2025,1,1),
        weight = 20.1
    )
    payload = dog_weight_entry.model_dump_json()
    response = client.post(url="/dogs/2/weights", data = payload)
    assert response.status_code == 200
    assert response.json()==10
    mock_repo.create.assert_called_once()
    mock_repo.create.assert_called_with(dog_weight_entry, 2)


def test_delete_comment(test_app, mock_repo):
    client = TestClient(test_app)

    client.delete("/dogs/weights/3")
    mock_repo.delete.assert_called_once()
    mock_repo.delete.assert_called_with(3)

def test_update_weight(test_app, mock_repo):
    client = TestClient(test_app)
    payload= DogWeightUpdate(date = date(2025,2,25)).model_dump_json()
    response = client.put("/dogs/weights/10", data = payload)
    mock_repo.update.assert_called_once()
    mock_repo.update.assert_called_with(10, DogWeightUpdate(date = date(2025,2,25)).model_dump(exclude_none=True))
    assert response.json()["success"] == True

def test_update_no_fields_raise(test_app, mock_repo):
    client = TestClient(test_app)
    payload= DogWeightUpdate().model_dump_json()
    response = client.put("/dogs/weights/10", data = payload)
    assert response.status_code == 400
    assert response.json()["detail"] == 'No data to update'
    