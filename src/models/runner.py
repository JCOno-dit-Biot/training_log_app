from pydantic import BaseModel
from typing import Optional
from .kennel import Kennel

class Runner(BaseModel):
    id: Optional[int] = None
    name: str
    kennel: Optional[Kennel] = None
    image_url: Optional[str] = ""