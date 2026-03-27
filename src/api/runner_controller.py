from fastapi_utils.cbv import cbv
from fastapi import APIRouter, HTTPException, UploadFile, File
from src.repositories.runner_repository import runner_repository
from src.models.runner import Runner, RunnerUpdate
from src.models.images import ImageResponse
from fastapi import Depends, Request
from src.deps import (
    get_runner_repo,
    get_profile_image_service,
    get_runner_service
)

router = APIRouter()

@cbv(router)
class RunnerController:
    def __init__(self, repo: runner_repository = Depends(get_runner_repo)):
        self.repo = repo

    @router.get("/runners", response_model=list[Runner])
    def list_runners(self, request: Request, service=Depends(get_runner_service)):
        kennel_id = request.state.kennel_id
        return service.get_all(kennel_id)

    @router.post("/runners")
    def create_runner(self, runner: Runner):
        return self.repo.create(runner)

    @router.post("/runners/{runner_id}/image", response_model=ImageResponse)
    async def upload_runner_image(
        self,
        runner_id: int,
        request: Request,
        image: UploadFile = File(...),
        service=Depends(get_profile_image_service),
    ):
        return await service.upload_runner_image(
            runner_id=runner_id,
            kennel_id=request.state.kennel_id,
            image=image
        )
    
    @router.put("/runners/{runner_id}")
    def update_runner(self, runner: RunnerUpdate, runner_id: int):
        updated_fields = runner.model_dump(exclude_none=True)
        if not updated_fields:
            raise HTTPException(status_code=400, detail="No data to update")

        self.repo.update(updated_fields, runner_id)
        return {"success": True}