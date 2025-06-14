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
    comment_repository
)
from .config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/token")

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

async def verify_jwt(request: Request, token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{settings.AUTH_SERVICE_URL}/validate", json={"token": token})
            res.raise_for_status()
            payload = res.json()
            request.state.kennel_id = payload["kennel_id"]
            return res.json()
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=401, detail="Invalid token")