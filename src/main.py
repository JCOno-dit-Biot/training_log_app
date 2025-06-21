from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .utils.db import get_connection
from src.api.dog_controller import router as dog_router
from src.api.runner_controller import router as runner_router
from src.api.activity_controller import router as activity_router
from src.api.weight_controller import router as weight_router
from src.api.sport_controller import router as sport_router
from src.api.comment_controller import router as comment_router
from src.deps import verify_jwt

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
    "http://fastapi-auth:8001",
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


app.include_router(dog_router, tags=["Dogs"], dependencies=[Depends(verify_jwt)])
app.include_router(runner_router, tags=["Runners"], dependencies=[Depends(verify_jwt)])
app.include_router(activity_router, tags=["Activities"], dependencies=[Depends(verify_jwt)])
app.include_router(sport_router, tags=["Sport"])
app.include_router(weight_router, tags=["Weights"], dependencies=[Depends(verify_jwt)])
app.include_router(comment_router, tags = ["Comments"], dependencies=[Depends(verify_jwt)])