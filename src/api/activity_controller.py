from fastapi import Depends, APIRouter, Request, HTTPException, Body
from fastapi.requests import Request
from fastapi_utils.cbv import cbv
from src.repositories.activity_repository import activity_repository
from src.models.activity import Activity, ActivityCreate, ActivityUpdate
from src.deps import get_activity_repo
from src.utils import paginate_results
from src.models.pagination import PaginationParams

router = APIRouter()

@cbv(router)
class ActivityController:
    def __init__(self, activity_repo: activity_repository = Depends(get_activity_repo)):
        self.repo = activity_repo

    @router.get("/activities", response_model=dict, status_code=200)
    def list_dogs(self, request: Request, pagination: PaginationParams = Depends()):
        kennel_id = request.state.kennel_id
        activities = self.repo.get_all(kennel_id, pagination.limit, pagination.offset)
        entry_count = self.repo.get_total_count(kennel_id)

        return paginate_results(activities, entry_count, request, pagination.limit, pagination.offset)

    @router.post("/activities", status_code=201)
    def create_dog(self, activity_entry: ActivityCreate):
        activity_id = self.repo.create(activity_entry)
        if activity_id is None: 
            return HTTPException(status_code=400, detail ='Bad request, activity could not be created')

    @router.put("/activities/{activity_id}", status_code=200)
    async def update_activity(self, request: Request, activity_id: int, activity_update: ActivityUpdate):
        body = await request.body()
        print("RAW BODY:", body)
        print(activity_id)
        print(f"payload:{activity_update}")
        updated_fields = activity_update.model_dump(exclude_none=True)
        if not updated_fields:
            raise HTTPException(status_code=400, detail="No data to update")

        self.repo.update(activity_id, updated_fields)
        return {"success": True}

