from pydantic import BaseModel, Field
from typing import Optional

class Weather(BaseModel):
    id: Optional[int] = None
    temperature: Optional[float] = Field(None) # temperature in celcius
    humidity: Optional[float] = Field(None, ge =0, le=1)
    condition: Optional[str] = Field(None)