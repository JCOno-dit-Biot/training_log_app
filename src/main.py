from fastapi import FastAPI
from contextlib import asynccontextmanager
from .utils import get_connection
from src.api.dog_controller import router as dog_router
from src.api.runner_controller import router as runner_router
from src.api.activity_controller import router as activity_router
from src.api.weight_controller import router as weight_controler

@asynccontextmanager
async def lifespan(app: FastAPI):
    db_conn = get_connection()
    app.state.db = db_conn
    yield  # app runs
    db_conn.close()

app = FastAPI(lifespan=lifespan)

app.include_router(dog_router, tags=["Dogs"])
app.include_router(runner_router, tags=["Runners"])
app.include_router(activity_router, tags=["Activities"])
app.include_router(weight_controler, tags=["Weights"])