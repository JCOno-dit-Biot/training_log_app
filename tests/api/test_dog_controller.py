import pytest
from unittest.mock import Mock
from fastapi import FastAPI, Request, Depends
from fastapi.testclient import TestClient
from datetime import date
from src.api.dog_controller import router as dog_router
from src.repositories.dog_repository import dog_repository
from src.models.dog import Dog
from src.models.kennel import Kennel

@pytest.fixture
def mock_repo():
    mock = Mock(spec=dog_repository)
    mock.get_all.return_value = [Dog(
        name='Fido',
        breed='labrador',
        date_of_birth=date(2024,1,1),
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

    from src.deps import get_dog_repo, verify_jwt
    app.dependency_overrides[get_dog_repo] = override_repo
    app.dependency_overrides[verify_jwt] = fake_jwt_verify
    app.include_router(dog_router, dependencies=[Depends(verify_jwt)])

    return app

def test_list_dogs_called(test_app, mock_repo):
    client = TestClient(test_app)

    response = client.get("/dogs")

    expected_response = Dog(
        name='Fido',
        breed='labrador',
        date_of_birth=date(2024,1,1),
        kennel = Kennel(name='test_kennel')
    )
    assert response.status_code == 200
    assert Dog(**response.json()[0]) == expected_response
    mock_repo.get_all.assert_called_once()

def test_create_dog(test_app, mock_repo):
    client = TestClient(test_app)

    # Fake input payload
    input_data = {
        "name": "Fido",
        "breed": "Labrador",
        'date_of_birth' : '2024-01-01',
        'kennel': {'name': 'test_kennel'}
    }

    # What the repo will return (with an ID)
    returned_dog = Dog(**input_data)
    mock_repo.create.return_value = returned_dog

    response = client.post("/dogs", json=input_data)

    assert response.status_code == 200
    assert Dog(**response.json()) == returned_dog
    mock_repo.create.assert_called_once_with(Dog(**input_data))

def test_update_dog(test_app, mock_repo):
    client = TestClient(test_app)

    # Fake input payload
    input_data = {
        "name": "Fido",
        "breed": "Labrador"
    }

    dog_id = 1
    response = client.put(f"/dogs/{dog_id}", json=input_data)

    assert response.status_code == 200
    mock_repo.update.assert_called_once_with(input_data, dog_id)
