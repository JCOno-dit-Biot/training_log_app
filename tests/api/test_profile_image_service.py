from io import BytesIO
from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException, UploadFile

from src.services.profile_image_service import ProfileImageService


@pytest.fixture
def connection():
    return Mock()


@pytest.fixture
def dog_repository():
    return Mock()


@pytest.fixture
def runner_repository():
    return Mock()


@pytest.fixture
def image_repository():
    return Mock()


@pytest.fixture
def image_storage():
    return Mock()


@pytest.fixture
def service(connection, dog_repository, runner_repository, image_repository, image_storage):
    return ProfileImageService(
        connection=connection,
        dog_repository=dog_repository,
        runner_repository=runner_repository,
        image_repository=image_repository,
        image_storage=image_storage,
    )


def make_upload_file(filename="test.jpg", content=b"abc", content_type="image/jpeg"):
    file = UploadFile(filename=filename, file=BytesIO(content))
    file.headers = {"content-type": content_type}
    return file


@pytest.mark.asyncio
@patch("src.services.profile_image_service.validate_and_normalize_image")
async def test_upload_dog_image_success(
    mock_validate,
    service,
    dog_repository,
    image_repository,
    image_storage,
    connection,
):
    dog_repository.exists_for_kennel.return_value = True
    mock_validate.return_value = (b"normalized-bytes", "image/jpeg")
    image_storage.upload_profile_image.return_value = "profile-pictures/dogs/10/abc.jpg"
    image_storage.get_public_url.return_value = "https://cdn.example.com/profile-pictures/dogs/10/abc.jpg"
    image_repository.create_dog_image.return_value = {
        "id": 1,
        "image_path": "profile-pictures/dogs/10/abc.jpg",
        "dog_id": 10,
        "runner_id": None,
        "is_active": True,
        "created_at": "2026-03-07T12:00:00Z",
    }

    upload = make_upload_file()

    result = await service.upload_dog_image(
        dog_id=10,
        kennel_id=99,
        image=upload,
    )

    dog_repository.exists_for_kennel.assert_called_once_with(10, 99)
    image_storage.upload_profile_image.assert_called_once_with(
        owner_type="dogs",
        owner_id=10,
        content=b"normalized-bytes",
        content_type="image/jpeg",
    )
    image_repository.deactivate_active_dog_image.assert_called_once_with(10)
    image_repository.create_dog_image.assert_called_once_with(10, "profile-pictures/dogs/10/abc.jpg")
    connection.commit.assert_called_once()
    connection.rollback.assert_not_called()

    assert result.id == 1
    assert result.dog_id == 10
    assert result.image_path == "profile-pictures/dogs/10/abc.jpg"
    assert result.image_url == "https://cdn.example.com/profile-pictures/dogs/10/abc.jpg"


@pytest.mark.asyncio
async def test_upload_dog_image_raises_404_when_dog_not_found(service, dog_repository):
    dog_repository.exists_for_kennel.return_value = False

    upload = make_upload_file()

    with pytest.raises(HTTPException) as exc:
        await service.upload_dog_image(
            dog_id=10,
            kennel_id=99,
            image=upload,
        )

    assert exc.value.status_code == 404
    assert exc.value.detail == "Dog not found"


@pytest.mark.asyncio
@patch("src.services.profile_image_service.validate_and_normalize_image")
async def test_upload_dog_image_returns_400_for_invalid_image(
    mock_validate,
    service,
    dog_repository,
):
    from src.utils.image_processing import ImageValidationError

    dog_repository.exists_for_kennel.return_value = True
    mock_validate.side_effect = ImageValidationError("Unsupported image type")

    upload = make_upload_file(content_type="application/pdf")

    with pytest.raises(HTTPException) as exc:
        await service.upload_dog_image(
            dog_id=10,
            kennel_id=99,
            image=upload,
        )

    assert exc.value.status_code == 400
    assert exc.value.detail == "Unsupported image type"


@pytest.mark.asyncio
@patch("src.services.profile_image_service.validate_and_normalize_image")
async def test_upload_dog_image_rolls_back_and_deletes_s3_object_on_db_failure(
    mock_validate,
    service,
    dog_repository,
    image_repository,
    image_storage,
    connection,
):
    dog_repository.exists_for_kennel.return_value = True
    mock_validate.return_value = (b"normalized-bytes", "image/jpeg")
    image_storage.upload_profile_image.return_value = "profile-pictures/dogs/10/abc.jpg"
    image_repository.create_dog_image.side_effect = Exception("db insert failed")

    upload = make_upload_file()

    with pytest.raises(HTTPException) as exc:
        await service.upload_dog_image(
            dog_id=10,
            kennel_id=99,
            image=upload,
        )

    assert exc.value.status_code == 500
    assert exc.value.detail == "Failed to save image record"

    image_repository.deactivate_active_dog_image.assert_called_once_with(10)
    connection.rollback.assert_called_once()
    image_storage.delete.assert_called_once_with("profile-pictures/dogs/10/abc.jpg")
    connection.commit.assert_not_called()


@pytest.mark.asyncio
@patch("src.services.profile_image_service.validate_and_normalize_image")
async def test_upload_runner_image_success(
    mock_validate,
    service,
    runner_repository,
    image_repository,
    image_storage,
    connection,
):
    runner_repository.exists_for_kennel.return_value = True
    mock_validate.return_value = (b"normalized-bytes", "image/jpeg")
    image_storage.upload_profile_image.return_value = "profile-pictures/runners/11/abc.jpg"
    image_storage.get_public_url.return_value = "https://cdn.example.com/profile-pictures/runners/11/abc.jpg"
    image_repository.create_runner_image.return_value = {
        "id": 2,
        "image_path": "profile-pictures/runners/11/abc.jpg",
        "dog_id": None,
        "runner_id": 11,
        "is_active": True,
        "created_at": "2026-03-07T12:00:00Z",
    }

    upload = make_upload_file()

    result = await service.upload_runner_image(
        runner_id=11,
        kennel_id=99,
        image=upload,
    )

    runner_repository.exists_for_kennel.assert_called_once_with(11, 99)
    image_storage.upload_profile_image.assert_called_once_with(
        owner_type="runners",
        owner_id=11,
        content=b"normalized-bytes",
        content_type="image/jpeg",
    )
    image_repository.deactivate_active_runner_image.assert_called_once_with(11)
    image_repository.create_runner_image.assert_called_once_with(11, "profile-pictures/runners/11/abc.jpg")
    connection.commit.assert_called_once()

    assert result.runner_id == 11
    assert result.image_url == "https://cdn.example.com/profile-pictures/runners/11/abc.jpg"