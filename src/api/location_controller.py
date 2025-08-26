from fastapi import Depends, APIRouter, Request, HTTPException
from fastapi_utils.cbv import cbv
from src.repositories.location_repository import location_repository
from src.models.location import Location
from src.deps import (
    get_location_repo
)
from src.repositories.location_repository import DuplicateLocationError

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
        try:
            loc = self.repo.create(location.name, kennel_id)
            return loc  # {id, name}
        except DuplicateLocationError as e:
            # Return 409 and a clear message. Optionally include the existing resource info if you fetch it.
            raise HTTPException(status_code=409, detail=str(e))

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
