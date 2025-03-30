from pydantic import BaseModel
from typing import Optional

class Kennel(BaseModel):
    id: Optional[int] = None
    name: str