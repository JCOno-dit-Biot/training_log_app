from fastapi import Depends, APIRouter, Request
from fastapi_utils.cbv import cbv
from src.repositories.weight_repository import weight_repository
from src.models.dog_weight import DogWeightEntry
from src.deps import (
    get_weight_repo
)
from src.models.common import WeightQueryFilter

router = APIRouter()

@cbv(router)
class WeightController:
    def __init__(self, weight_repo: weight_repository = Depends(get_weight_repo)):
        self.repo = weight_repo

    @router.get("/dogs/weights", response_model=list[DogWeightEntry])
    def list_dog_weight(self, request: Request, filters: WeightQueryFilter = Depends()):
        kennel_id= request.state.kennel_id
        return self.repo.get_all(kennel_id, filters)

    @router.post("/dogs/{dog_id}/weights")
    def add_weight_entry(self, dog_id: int, weight_entry: DogWeightEntry):
        return self.repo.create(weight_entry, dog_id)
