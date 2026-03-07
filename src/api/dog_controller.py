from fastapi import Depends, APIRouter, Request, HTTPException, UploadFile, File
from fastapi_utils.cbv import cbv
from src.repositories.dog_repository import dog_repository
from src.models.dog import Dog, DogUpdate
from src.models.images import ImageResponse
from src.deps import (
    get_dog_repo,
    get_profile_image_service
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
    
    @router.post("/dogs/{dog_id}/image", response_model=ImageResponse)
    async def upload_dog_image(
        dog_id: int,
        request: Request,
        image: UploadFile = File(...),
        service=Depends(get_profile_image_service),
    ):
        return await service.upload_dog_image(
            dog_id=dog_id,
            kennel_id=request.state.kennel_id,
            image=image
        )
    
    @router.put("/dogs/{dog_id}")
    def update_dog(self, dog: DogUpdate, dog_id: int):
        updated_fields = dog.model_dump(exclude_none=True)
        if not updated_fields:
            raise HTTPException(status_code=400, detail="No data to update")

        self.repo.update(updated_fields, dog_id)
        return {"success": True}