from pydantic import BaseModel
from typing import Optional

class Sport(BaseModel):
    id: Optional[int]
    name: str


