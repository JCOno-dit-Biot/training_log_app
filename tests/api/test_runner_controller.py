import pytest
from unittest.mock import Mock, AsyncMock
from io import BytesIO
from fastapi import FastAPI, Request, Depends
from fastapi.testclient import TestClient
from datetime import date
from src.api.runner_controller import router as runner_router
from src.repositories.runner_repository import runner_repository
from src.models.runner import Runner
from src.models.kennel import Kennel
from src.models.images import ImageResponse

@pytest.fixture
def mock_repo():
    mock = Mock(spec=runner_repository)
    mock.get_all.return_value = [Runner(
        name='John',
        kennel = Kennel(name='test_kennel')
    )]
    return mock

@pytest.fixture
def mock_service():
    mock_service = Mock()
    mock_service.upload_runner_image = AsyncMock(
        return_value=ImageResponse(
            id=1,
            image_path="profile-pictures/runners/10/abc.jpg",
            image_url="https://cdn.example.com/profile-pictures/runners/10/abc.jpg",
            runner_id=10,
            dog_id=None,
            is_active=True,
            created_at="2026-03-07T12:00:00Z",
        )
    )
    return mock_service

@pytest.fixture
def mock_runner_service():
    mock_service = Mock()
    mock_service.get_all.return_value = [Runner(
        name='John',
        kennel = Kennel(name='test_kennel'),
        image_url="https://cdn.example.com/profile-pictures/runners/10/abc.jpg"
    )]

    return mock_service


@pytest.fixture
def test_app(mock_repo, mock_service, mock_runner_service):
    app = FastAPI()

    async def fake_jwt_verify(request: Request):
        request.state.kennel_id = 1

    # Override the repository dependency
    def override_repo():
        return mock_repo
    
    def override_get_profile_image_service():
        return mock_service
    
    def override_get_runner_service():
        return mock_runner_service
    
    from src.deps import get_runner_repo, verify_jwt, get_profile_image_service, get_runner_service
    app.dependency_overrides[get_runner_repo] = override_repo
    app.dependency_overrides[verify_jwt] = fake_jwt_verify
    app.include_router(runner_router, dependencies=[Depends(verify_jwt)])
    app.dependency_overrides[get_profile_image_service] = override_get_profile_image_service
    app.dependency_overrides[get_runner_service] = override_get_runner_service
    return app

def test_list_runners_called(test_app, mock_runner_service):
    client = TestClient(test_app)

    response = client.get("/runners")

    expected_response = Runner(
        name='John',
        kennel = Kennel(name='test_kennel'),
        image_url="https://cdn.example.com/profile-pictures/runners/10/abc.jpg"
    )
    assert response.status_code == 200
    assert Runner(**response.json()[0]) == expected_response
    mock_runner_service.get_all.assert_called_once()

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

def test_update_runner(test_app, mock_repo):
    client = TestClient(test_app)

    # Fake input payload
    input_data = {
        "name": "new-name"
    }

    runner_id = 1
    response = client.put(f"/runners/{runner_id}", json=input_data)

    assert response.status_code == 200
    mock_repo.update.assert_called_once_with(input_data, runner_id)

def test_upload_runner_image_route_calls_service(test_app, mock_service):

    client = TestClient(test_app)

    response = client.post(
        "/runners/10/image",
        files={"image": ("runner.jpg", BytesIO(b"fake-image-bytes"), "image/jpeg")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["runner_id"] == 10
    assert body["image_url"] == "https://cdn.example.com/profile-pictures/runners/10/abc.jpg"
    mock_service.upload_runner_image.assert_awaited_once()