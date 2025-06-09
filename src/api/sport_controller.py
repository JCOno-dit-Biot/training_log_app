from fastapi import Depends, APIRouter, Request
from fastapi_utils.cbv import cbv
from src.repositories.sport_repository import sport_repository
from src.models.sport import Sport
from src.deps import (
    get_sport_repo
)

router = APIRouter()

@cbv(router)
class SportController:
    def __init__(self, sport_repo: sport_repository = Depends(get_sport_repo)):
        self.repo = sport_repo

    @router.get("/sports", response_model=list[Sport])
    def list_sports(self):
        return self.repo.get_all()

    @router.get("/sports/{sport_name}", response_model = Sport)
    def get_sport(self, sport_name: str):
        return self.repo.get_by_name(sport_name)