from pydantic import BaseModel
from typing import Optional
from .kennel import Kennel

class Runner(BaseModel):
    name: str
    kennel: Optional[Kennel]