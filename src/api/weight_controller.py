from fastapi import Depends, APIRouter
from fastapi_utils.cbv import cbv


from src.repositories.weight_repository import weight_repository
from src.models.dog_weight import DogWeightEntry

router = APIRouter()

@cbv(router)
class DogController:
    def __init__(self, weight_repo: weight_repository = Depends()):
        self.repo = weight_repo

    @router.get("/dogs/{dog_id}/weights", response_model=list[DogWeightEntry])
    def list_dogs(self, dog_id: int):
        return self.repo.get_all(dog_id)

    @router.post("/dog-weights")
    def create_dog(self, weight_entry: DogWeightEntry):
        return self.repo.create(weight_entry)
