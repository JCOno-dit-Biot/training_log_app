from src.models.dog import Dog
from src.models.kennel import Kennel

from typing import List, Optional


class RunnerService:
    def __init__(self, runner_repository, image_storage):
        self._runner_repository = runner_repository
        self._image_storage = image_storage

    def get_all(self, kennel_id: int) -> list[Dog]:
        runners = self._runner_repository.get_all(kennel_id)

        for runner in runners:
            runner.image_url = (
                self._image_storage.get_presigned_url(runner.image_url)
                if runner.image_url
                else None
            )
            
        return runners