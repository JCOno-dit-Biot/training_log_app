from pydantic import BaseModel
from typing import Optional

class Location(BaseModel):
    id: Optional[int] = None
    name: str
    # In the future potentially add GPS coordinate for Map
    # latitude: float
    # longitude: float