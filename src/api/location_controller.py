from fastapi import Depends, APIRouter, Request, HTTPException
from fastapi_utils.cbv import cbv
from typing import Optional
from src.repositories.location_repository import location_repository
from src.models.location import Location, LocationUpdate, LocationWithUsage
from src.deps import (
    get_location_repo
)
from psycopg2.errors import ForeignKeyViolation
from src.repositories.location_repository import DuplicateLocationError

router = APIRouter()

@cbv(router)
class LocationController:
    def __init__(self, comment_repo: location_repository = Depends(get_location_repo)):
        self.repo = comment_repo

    @router.get("/locations", response_model=list[Location])
    def list_location(self, request: Request, search: Optional[str] = None):
        kennel_id = request.state.kennel_id
        return self.repo.get_all(kennel_id, search)
    
    @router.get("/locations/manage", response_model=list[LocationWithUsage])
    def list_location_with_usage(self, request: Request, search: Optional[str] = None):
        kennel_id = request.state.kennel_id
        return self.repo.get_all_with_usage(kennel_id, search)

    @router.post("/locations")
    def create_location(self, request: Request, location: Location):
        kennel_id = request.state.kennel_id
        try:
            loc = self.repo.create(
            location_name=location.name,
            kennel_id=kennel_id,
            latitude=location.latitude,
            longitude=location.longitude,
        )
            return loc  # {id, name}
        except DuplicateLocationError as e:
            # Return 409 and a clear message. Optionally include the existing resource info if you fetch it.
            raise HTTPException(status_code=409, detail=str(e))

    @router.patch("/locations/{location_id}")
    def update_location(self, location: LocationUpdate, location_id: int):
        updated_fields = location.model_dump(exclude_none=True)
        if not updated_fields:
            return {"success": True, "updated": 0}
        if location_id is not None:
            res = self.repo.update(fields = updated_fields, id=location_id)
        return {"success": res}
        

    @router.delete("/locations/{location_id}")
    def delete_location(self, request: Request, location_id: int):
        kennel_id = request.state.kennel_id
        try:
            deleted = self.repo.delete(location_id, kennel_id)
        except ForeignKeyViolation:
            raise HTTPException(status_code=409, detail="Location is used by activities and cannot be deleted.")
        if not deleted:
            raise HTTPException(status_code=404, detail="Location could not be deleted")
        else:
            return {"success": True}
