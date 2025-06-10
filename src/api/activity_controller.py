from fastapi import Depends, APIRouter, Request
from fastapi_utils.cbv import cbv
from src.repositories.activity_repository import activity_repository
from src.models.activity import Activity, ActivityCreate
from src.deps import get_activity_repo

router = APIRouter()

@cbv(router)
class ActivityController:
    def __init__(self, activity_repo: activity_repository = Depends(get_activity_repo)):
        self.repo = activity_repo

    @router.get("/activities", response_model=list[Activity])
    def list_dogs(self, request: Request):
        kennel_id = request.state.kennel_id
        return self.repo.get_all(kennel_id)

    @router.post("/activities")
    def create_dog(self, activity_entry: ActivityCreate):
        return self.repo.create(activity_entry)
