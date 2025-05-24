from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    ENV: str = "dev"
    DATABASE_URL: str = ""
    TEST_DATABASE_URL: str = ""
    AUTH_SERVICE_URL: str = "http://fastapi-auth:8001/auth"
    ALGORITHM: str = ""
    SECRET_KEY: str = ""
    model_config = ConfigDict(env_file="config/.env", extra="ignore")
        
settings = Settings()