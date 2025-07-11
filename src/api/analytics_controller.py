from fastapi import Depends, APIRouter, Request, HTTPException, Body, Query
from fastapi.requests import Request
from fastapi_utils.cbv import cbv
from typing import List
from src.repositories.analytics_repository import analytics_repository
from src.models.analytics.dog_calendar_day import DogCalendarDay
from src.models.analytics.weekly_stats import WeeklyStats
from src.deps import get_analytics_repo
from src.utils.calculation_helpers import get_month_range

router = APIRouter()

@cbv(router)
class AnalyticsController:
    def __init__(self, analytics_repo: analytics_repository = Depends(get_analytics_repo)):
        self.repo = analytics_repo

    @router.get("/weekly-stats", response_model=List[WeeklyStats])
    def weekly_stats_route(
        self, request: Request
    ):
        
        """
        Return the latest weekly stats per dog, including distance, average rating, and trends.
        """
        kennel_id = request.state.kennel_id
        return self.repo.get_weekly_stats(kennel_id)


    @router.get("/dog-calendar", response_model=List[DogCalendarDay])
    def dog_calendar_route(
        self,
        year: int = Query(..., ge=2000),
        month: int = Query(..., ge=1, le=12)
    ):
        """
        Return which dogs ran on each day of the specified month.
        """
        start_date, end_date = get_month_range(year, month)
        return self.repo.get_dog_running_per_day(start_date, end_date)