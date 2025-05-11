from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from pathlib import Path
from dotenv import load_dotenv


load_dotenv(dotenv_path='.env', override=False)

class Settings(BaseSettings):
    ENV: str = "dev"
    DATABASE_URL: str = ""
    TEST_DATABASE_URL: str = ""

    model_config = ConfigDict(extra="ignore")

settings = Settings()