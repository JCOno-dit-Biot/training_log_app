from fastapi import Depends, APIRouter, Request, HTTPException, Body, Query
from fastapi.requests import Request
from fastapi_utils.cbv import cbv
from typing import List
from src.repositories.analytics_repository import analytics_repository
from src.models.analytics import WeeklyStats, WeeklyDogDistance, DogCalendarDay, AnalyticSummary, LocationHeatPoint, SportCount
from src.models import Filter
from src.deps import get_analytics_repo
from src.utils.calculation_helpers import get_month_range
from datetime import datetime, date
router = APIRouter()

@cbv(router)
class AnalyticsController:
    def __init__(self, analytics_repo: analytics_repository = Depends(get_analytics_repo)):
        self.repo = analytics_repo

    @router.get("/weekly-stats", response_model=List[WeeklyStats])
    def weekly_stats_route(
        self, request: Request,
        ts: datetime
    ):
        
        """
        Return the latest weekly stats per dog, including distance, average rating, and trends.
        """
        kennel_id = request.state.kennel_id
        return self.repo.get_weekly_stats(kennel_id, ts)

    #does this need the kennel id?
    @router.get("/dog-calendar", response_model=List[DogCalendarDay])
    def dog_calendar_route(
        self,
        request: Request,
        year: int = Query(..., ge=2000),
        month: int = Query(..., ge=1, le=12)
    ):
        """
        Return which dogs ran on each day of the specified month.
        """
        kennel_id = request.state.kennel_id
        start_date, end_date = get_month_range(year, month)
        return self.repo.get_dog_running_per_day(start_date, end_date, kennel_id)
    
    @router.get("/summary", response_model=AnalyticSummary)
    def summary_all_dogs(
        self,
        request: Request,
        filters: Filter = Depends()
    ):  
        kennel_id = request.state.kennel_id
        return self.repo.get_analytic_summary_per_dog(filters, kennel_id)

    @router.get("/activities/sport-distribution", response_model=list[SportCount])
    def sport_distribution(
        self,
        request: Request,
        filters: Filter = Depends()
    ):
        kennel_id = request.state.kennel_id
        return self.repo.get_sport_counts(filters, kennel_id)
    
    @router.get("/activities/weekly-distance", response_model=list[WeeklyDogDistance])
    def get_weekly_distance(
        self,
        request: Request,
        filters: Filter = Depends()
    ):
        kennel_id = request.state.kennel_id
        return self.repo.get_weekly_mileage(filters, kennel_id)
    
    @router.get("activities/locations/heatmap", response_model = list[LocationHeatPoint])
    def actitivities_heat_map(
        self,
        request: Request,
        filters: Filter = Depends()
    ):
        kennel_id = request.state.kennel_id
        return self.repo.get_activity_heat_map(filters, kennel_id)
    
