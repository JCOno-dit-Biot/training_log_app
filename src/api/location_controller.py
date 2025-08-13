from fastapi import Depends, APIRouter, Request, HTTPException
from fastapi_utils.cbv import cbv
from src.repositories.location_repository import location_repository
from src.models.location import Location
from src.deps import (
    get_location_repo
)

router = APIRouter()

@cbv(router)
class LocationController:
    def __init__(self, comment_repo: location_repository = Depends(get_location_repo)):
        self.repo = comment_repo

    @router.get("/locations", response_model=list[Location])
    def list_comments(self, request: Request):
        kennel_id = request.state.kennel_id
        return self.repo.get_all(kennel_id)

    @router.post("/locations")
    def create_location(self, request: Request, location: Location):
        kennel_id = request.state.kennel_id
        return self.repo.create(location.name, kennel_id)

    @router.put("/locations/{location_id}")
    def update_location(self, location: Location, location_id: int):
        if location_id is not None:
            res = self.repo.update(update_name=location.name, id=location_id)
        return {"success": res}
        

    @router.delete("/locations/{location_id}")
    def delete_location(self, request: Request, location_id: int):
        kennel_id = request.state.kennel_id
        res = self.repo.delete(location_id, kennel_id)
        if not res:
            raise HTTPException(status_code=404, detail="Location could not be deleted")
        else:
            return {"success": True}
