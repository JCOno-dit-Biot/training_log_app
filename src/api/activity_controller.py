from fastapi import Depends, APIRouter, Request, HTTPException, Body
from fastapi.requests import Request
from fastapi_utils.cbv import cbv
from src.repositories.activity_repository import activity_repository
from src.models.activity import Activity, ActivityCreate, ActivityUpdate
from src.deps import get_activity_repo
from src.utils.pagination import paginate_results
from src.models.common import PaginationParams, ActivityQueryFilters

router = APIRouter()

@cbv(router)
class ActivityController:
    def __init__(self, activity_repo: activity_repository = Depends(get_activity_repo)):
        self.repo = activity_repo

    @router.get("/activities", response_model=dict, status_code=200)
    def list_activities(self, request: Request, pagination: PaginationParams = Depends(), filters: ActivityQueryFilters = Depends()):
        kennel_id = request.state.kennel_id
        activities = self.repo.get_all(kennel_id, filters, pagination.limit, pagination.offset)
        entry_count = self.repo.get_total_count(kennel_id, filters)

        return paginate_results(activities, entry_count, request, pagination.limit, pagination.offset)

    @router.post("/activities", status_code=201)
    def create_activity(self, activity_entry: ActivityCreate):
        activity_id = self.repo.create(activity_entry)
        if activity_id is None: 
            raise HTTPException(status_code=400, detail ='Bad request, activity could not be created')
        return {"id": activity_id}
    
    @router.put("/activities/{activity_id}", status_code=200)
    def update_activity(self, request: Request, activity_id: int, activity_update: ActivityUpdate):
        updated_fields = activity_update.model_dump(exclude_none=True)
        print(not updated_fields)
        if not updated_fields:
            raise HTTPException(status_code=400, detail="No data to update")

        self.repo.update(activity_id, updated_fields)
        return {"success": True}

    @router.delete("/activities/{activity_id}", status_code=200)
    def delete_activity(self, activity_id: int):
        self.repo.delete(activity_id)
        return {"success": True}
