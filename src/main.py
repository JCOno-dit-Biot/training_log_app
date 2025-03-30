from fastapi import FastAPI
from src.api.dog_controller import router as dog_router
from src.api.runner_controller import router as runner_router

app = FastAPI()

app.include_router(dog_router, tags=["Dogs"])
app.include_router(runner_router, tags=["Runners"])
