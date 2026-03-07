from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_path: str
    image_url: str
    dog_id: Optional[int] = None
    runner_id: Optional[int] = None
    is_active: bool
    created_at: datetime