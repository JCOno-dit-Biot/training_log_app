from pydantic import BaseModel, Field
from fastapi import Query
from typing import Optional, List
from datetime import date

class PaginationParams(BaseModel):
    limit: int = Field(10, gt=0, le=20)
    offset: int = Field(0, ge=0)

class Filter(BaseModel):
    start_date: Optional[date] = Query( default = None)
    end_date: Optional[date] = Query( default = None)

    def is_empty(self) -> bool:
        return not any(self.model_dump(exclude_none=True).values())

class ActivityQueryFilters(Filter):
    dog_id: Optional[int] = Query( default = None)
    runner_id:Optional[int] = Query( default = None)
    sport_id: Optional[int] = Query( default = None)
    location: Optional[str] =  Query( default = None)
    workout: Optional[bool] = Query( default = None)
    
class WeightQueryFilter(Filter):
    dog_id: Optional[int]= Query( default = None)



