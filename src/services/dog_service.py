from src.models.dog import Dog
from src.models.kennel import Kennel

from typing import List, Optional


class DogService:
    def __init__(self, dog_repository, image_storage):
        self._dog_repository = dog_repository
        self._image_storage = image_storage

    def get_all(self, kennel_id: int) -> list[Dog]:
        dogs = self._dog_repository.get_all(kennel_id)

        for dog in dogs:
            dog.image_url = (
                self._image_storage.get_presigned_url(dog.image_url)
                if dog.image_url
                else None
            )
            
        return dogs