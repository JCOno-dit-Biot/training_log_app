from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENV: str = "dev"
    DATABASE_URL: str = ""
    TEST_DATABASE_URL: str = ""

    class Config:
        env_file = "./.env"
        extra = "ignore"

settings = Settings()