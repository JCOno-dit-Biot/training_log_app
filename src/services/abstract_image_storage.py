from abc import ABC, abstractmethod


class ImageStorage(ABC):
    @abstractmethod
    def upload_profile_image(
        self,
        *,
        owner_type: str,
        owner_id: int,
        content: bytes,
        content_type: str,
    ) -> str:
        """Uploads the image and returns the storage key."""
        raise NotImplementedError

    @abstractmethod
    def get_public_url(self, storage_key: str) -> str:
        raise NotImplementedError

    @abstractmethod
    def delete(self, storage_key: str) -> None:
        raise NotImplementedError