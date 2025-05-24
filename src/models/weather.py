from pydantic import BaseModel, Field, model_validator
from typing import Optional

class Weather(BaseModel):
    id: Optional[int] = None
    temperature: Optional[float] = Field(None) # temperature in celcius
    humidity: Optional[float] = Field(None, ge =0, le=1)
    condition: Optional[str] = Field(None)

    @model_validator(mode="after")
    def ensure_at_least_one_metric(cls, values):
        if values.temperature is None and values.humidity is None:
            raise ValueError(f"At least one of 'humidity' or 'temperature' must be provided the activity")
        return values