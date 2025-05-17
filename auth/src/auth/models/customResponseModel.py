from pydantic import BaseModel
from typing import Optional, Any


class CustomResponseModel (BaseModel):
    status_code: int
    message: Optional[str] = None 
    data: Optional [Any] =  None # main payload
    errors: Optional[Any] = None

class SessionTokenResponse(BaseModel):
    access_token: Optional[str] = None # JWT token
    token_type: str = "bearer"
    expires_in: Optional[int] = 3600

    