from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Allow requests from frontend dev server
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # frontend URLs allowed
    allow_credentials=True,
    allow_methods=["*"],             # allow all HTTP methods
    allow_headers=["*"],             # allow all headers
)
app.include_router(dog_router, tags=["Dogs"])
app.include_router(runner_router, tags=["Runners"])
app.include_router(activity_router, tags=["Activities"])
app.include_router(weight_controler, tags=["Weights"])