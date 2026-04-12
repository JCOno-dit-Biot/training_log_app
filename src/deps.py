# deps.py
from fastapi import Request, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import httpx
from src.repositories import (
    dog_repository,
    runner_repository,
    activity_repository,
    weight_repository,
    sport_repository,
    comment_repository,
    analytics_repository,
    location_repository,
    ImageRepository
)
from src.services import (
    DogService,
    RunnerService,
    ProfileImageService,
    S3ImageStorage
)

from .config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/auth/token")

def get_db(request: Request):
    return request.app.state.db

def get_dog_repo(db=Depends(get_db)):
    return dog_repository(db)

def get_runner_repo(db=Depends(get_db)):
    return runner_repository(db)

def get_weight_repo(db=Depends(get_db)):
    return weight_repository(db)

def get_activity_repo(db=Depends(get_db)):
    return activity_repository(db)

def get_sport_repo(db=Depends(get_db)):
    return sport_repository(db)

def get_comment_repo(db=Depends(get_db)):
    return comment_repository(db)

def get_analytics_repo(db=Depends(get_db)):
    return analytics_repository(db)

def get_location_repo(db=Depends(get_db)):
    return location_repository(db)

def get_image_repo(db=Depends(get_db)):
    return ImageRepository(db)

async def verify_jwt(request: Request, token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{settings.AUTH_SERVICE_URL}/validate", json={"token": token})
            res.raise_for_status()
            payload = res.json()
            request.state.kennel_id = payload["kennel_id"]
            request.state.user_id = payload["user_id"]
            return res.json()
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
def get_profile_image_service(
        connection= Depends(get_db),
        dog_repository = Depends(get_dog_repo),
        runner_repository = Depends(get_runner_repo),
        image_repository = Depends(get_image_repo)
    ) -> ProfileImageService:

    image_storage = S3ImageStorage(
        bucket_name=settings.AWS_S3_BUCKET_NAME,
        region=settings.AWS_REGION
    )

    return ProfileImageService(
        connection=connection,
        dog_repository=dog_repository,
        runner_repository=runner_repository,
        image_repository=image_repository,
        image_storage=image_storage,
    )

def get_dog_service(dog_repository = Depends(get_dog_repo)):

    image_storage = S3ImageStorage(
        bucket_name=settings.AWS_S3_BUCKET_NAME,
        region=settings.AWS_REGION
    )

    return DogService(
        dog_repository=dog_repository,
        image_storage=image_storage
    )

def get_runner_service(runner_repository = Depends(get_runner_repo)):

    image_storage = S3ImageStorage(
        bucket_name=settings.AWS_S3_BUCKET_NAME,
        region=settings.AWS_REGION
    )

    return RunnerService(
        runner_repository=runner_repository,
        image_storage=image_storage
    )