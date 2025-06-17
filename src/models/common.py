from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class PaginationParams(BaseModel):
    limit: int = Field(10, gt=0, le=20)
    offset: int = Field(0, ge=0)

class ActivityQueryFilters(BaseModel):
    dog_id: Optional[int] = None
    runner_id:Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    sport_id: Optional[int] = None
    location: Optional[str] =  None

class WeightQueryFilter(BaseModel):
    dog_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


