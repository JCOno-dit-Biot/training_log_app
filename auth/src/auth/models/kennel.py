# As the auth module should be able to run independently the kennel model file is duplicated

from pydantic import BaseModel
from typing import Optional

class Kennel(BaseModel):
    id: Optional[int] = None
    name: str