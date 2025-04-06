from fastapi import Depends, APIRouter
from fastapi_utils.cbv import cbv


from src.repositories.dog_repository import dog_repository
from src.models.dog import Dog
from src.deps import (
    get_dog_repo
)

router = APIRouter()

@cbv(router)
class DogController:
    def __init__(self, dog_repo: dog_repository = Depends(get_dog_repo)):
        self.repo = dog_repo

    @router.get("/dogs", response_model=list[Dog])
    def list_dogs(self):
        #for now hard code kennel_id, will get from JWT later
        kennel_id = 1
        return self.repo.get_all(kennel_id)

    @router.post("/dogs")
    def create_dog(self, dog: Dog):
        return self.repo.create(dog)
