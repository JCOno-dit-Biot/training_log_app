from pydantic import BaseModel, Field

class PaginationParams(BaseModel):
    limit: int = Field(10, gt=0, le=20)
    offset: int = Field(0, ge=0)
