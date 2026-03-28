from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import ConfigDict
import os
from dotenv import load_dotenv

if os.getenv("ENV") != "test":
    load_dotenv(dotenv_path='config/.env')
    
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        extra="ignore",
          env_ignore_empty=True
    )

    ENV: str = "dev"
    DATABASE_URL: str = ""
    TEST_DATABASE_URL: str = ""
    AUTH_SERVICE_URL: str = "http://fastapi-auth:8001/auth"
    ALGORITHM: str = ""
    SECRET_KEY: str = ""
    
    #AWS configs
    AWS_REGION: str = ""
    AWS_S3_BUCKET_NAME: str = ""
    AWS_S3_PUBLIC_BASE_URL: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
        
settings = Settings()