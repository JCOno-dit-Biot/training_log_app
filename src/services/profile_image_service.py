# app/services/profile_image_service.py
from fastapi import HTTPException, UploadFile, status

from src.models.images import ImageResponse
from src.utils.image_processing import ImageValidationError, validate_and_normalize_image


class ProfileImageService:
    def __init__(
        self,
        *,
        connection,
        dog_repository,
        runner_repository,
        image_repository,
        image_storage,
    ) -> None:
        self._connection = connection
        self._dog_repository = dog_repository
        self._runner_repository = runner_repository
        self._image_repository = image_repository
        self._image_storage = image_storage

    async def upload_dog_image(
        self,
        *,
        dog_id: int,
        kennel_id: int,
        image: UploadFile,
    ) -> ImageResponse:
        if not self._dog_repository.exists_for_kennel(dog_id, kennel_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dog not found")

        raw_bytes = await image.read()

        try:
            normalized_bytes, normalized_content_type = validate_and_normalize_image(
                raw_bytes=raw_bytes,
                content_type=image.content_type or "",
            )
        except ImageValidationError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

        try:
            storage_key = self._image_storage.upload_profile_image(
                owner_type="dogs",
                owner_id=dog_id,
                content=normalized_bytes,
                content_type=normalized_content_type,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload image to storage",
            ) from exc

        try:
            self._image_repository.deactivate_active_dog_image(dog_id)
            created = self._image_repository.create_dog_image(dog_id, storage_key)
            self._connection.commit()
        except Exception as exc:
            self._connection.rollback()
            self._image_storage.delete(storage_key)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save image record",
            ) from exc

        created["image_url"] = self._image_storage.get_presigned_url(created["image_path"])
        return ImageResponse(**created)

    async def upload_runner_image(
        self,
        *,
        runner_id: int,
        kennel_id: int,
        image: UploadFile,
    ) -> ImageResponse:
        if not self._runner_repository.exists_for_kennel(runner_id, kennel_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Runner not found")

        raw_bytes = await image.read()

        try:
            normalized_bytes, normalized_content_type = validate_and_normalize_image(
                raw_bytes=raw_bytes,
                content_type=image.content_type or "",
            )
        except ImageValidationError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

        try:
            storage_key = self._image_storage.upload_profile_image(
                owner_type="runners",
                owner_id=runner_id,
                content=normalized_bytes,
                content_type=normalized_content_type,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload image to storage",
            ) from exc

        try:
            self._image_repository.deactivate_active_runner_image(runner_id)
            created = self._image_repository.create_runner_image(runner_id, storage_key)
            self._connection.commit()
        except Exception as exc:
            self._connection.rollback()
            self._image_storage.delete(storage_key)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save image record",
            ) from exc

        created["image_url"] = self._image_storage.get_presigned_url(created["image_path"])
        return ImageResponse(**created)