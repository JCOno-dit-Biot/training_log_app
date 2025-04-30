from pydantic import BaseModel
from typing import Optional

class sessionTokenResponse(BaseModel):
    access_token = Optional[str] = None
    token_type: str = "bearer"
    expires_in = Optional[int] = 3600
    refresh_token: Optional[str] = None