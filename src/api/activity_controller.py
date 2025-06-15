from fastapi import Depends, APIRouter, Request, HTTPException
from fastapi_utils.cbv import cbv
from src.repositories.activity_repository import activity_repository
from src.models.activity import Activity, ActivityCreate, ActivityUpdate
from src.deps import get_activity_repo

router = APIRouter()

@cbv(router)
class ActivityController:
    def __init__(self, activity_repo: activity_repository = Depends(get_activity_repo)):
        self.repo = activity_repo

    @router.get("/activities", response_model=list[Activity], status_code=200)
    def list_dogs(self, request: Request):
        kennel_id = request.state.kennel_id
        return self.repo.get_all(kennel_id)

    @router.post("/activities", status_code=201)
    def create_dog(self, activity_entry: ActivityCreate):
        activity_id = self.repo.create(activity_entry)
        if activity_id is None: 
            return HTTPException(status_code=400, detail ='Bad request, activity could not be created')

    @router.put("/activities/{activity_id}", status_code=200)
    def update_activity(self, activity_id: int, payload: ActivityUpdate):
        updated_fields = payload.model_dump(exclude_none=True)
        if not updated_fields:
            raise HTTPException(status_code=400, detail="No data to update")

        self.repo.update(activity_id, updated_fields)
        return {"success": True}

