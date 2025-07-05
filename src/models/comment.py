from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional

class commentCreate(BaseModel):
    activity_id: int
    user_id: Optional[int] 
    comment: str

class commentOut(BaseModel):
    id: int
    activity_id: int
    user_id: int
    comment: str
    created_at: datetime
    updated_at: Optional[datetime] = None