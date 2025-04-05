from fastapi import Depends, APIRouter
from fastapi_utils.cbv import cbv


from src.repositories.dog_repository import dog_repository
from src.models.dog import Dog

router = APIRouter()

@cbv(router)
class DogController:
    def __init__(self, dog_repo: dog_repository = Depends()):
        self.repo = dog_repo

    @router.get("/dogs", response_model=list[Dog])
    def list_dogs(self, kennel_id: int):
        return self.repo.get_all(kennel_id)

    @router.post("/dogs")
    def create_dog(self, dog: Dog):
        return self.repo.create(dog)
