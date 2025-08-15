from fastapi import Depends, APIRouter, Request, HTTPException
from fastapi_utils.cbv import cbv
from src.repositories.dog_repository import dog_repository
from src.models.dog import Dog, DogUpdate
from src.deps import (
    get_dog_repo
)

router = APIRouter()

@cbv(router)
class DogController:
    def __init__(self, dog_repo: dog_repository = Depends(get_dog_repo)):
        self.repo = dog_repo

    @router.get("/dogs", response_model=list[Dog])
    def list_dogs(self, request: Request):
        kennel_id = request.state.kennel_id
        return self.repo.get_all(kennel_id)

    @router.post("/dogs")
    def create_dog(self, dog: Dog):
        return self.repo.create(dog)
    
    @router.put("/dogs/{dog_id}")
    def update_dog(self, dog: DogUpdate, dog_id: int):
        updated_fields = dog.model_dump(exclude_none=True)
        if not updated_fields:
            raise HTTPException(status_code=400, detail="No data to update")

        self.repo.update(updated_fields, dog_id)
        return {"success": True}