from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import ConfigDict
import os
from dotenv import load_dotenv

if os.getenv("ENV") != "test":
    load_dotenv(dotenv_path='config/.env')
    
class Settings(BaseSettings):
    ENV: str = "dev"
    DATABASE_URL: str = ""
    TEST_DATABASE_URL: str = ""
    AUTH_SERVICE_URL: str = "http://fastapi-auth:8001/auth"
    ALGORITHM: str = ""
    SECRET_KEY: str = ""
    model_config = SettingsConfigDict(extra="ignore")
        
settings = Settings()