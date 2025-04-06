# deps.py
from fastapi import Request, Depends
from src.repositories import (
    dog_repository,
    runner_repository,
    activity_repository,
    weight_repository
)

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
