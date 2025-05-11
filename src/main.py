from fastapi import FastAPI, Security, HTTPException, APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, HTTPAuthorizationCredentials
import httpx
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .utils import get_connection
from src.api.dog_controller import router as dog_router
from src.api.runner_controller import router as runner_router
from src.api.activity_controller import router as activity_router
from src.api.weight_controller import router as weight_controler
from .config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/token")

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

async def verify_jwt(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{settings.AUTH_SERVICE_URL}/validate", json={"token": token})
            res.raise_for_status()
            return res.json()
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=401, detail="Invalid token")

app.include_router(dog_router, tags=["Dogs"], dependencies=[Depends(verify_jwt)])
app.include_router(runner_router, tags=["Runners"], dependencies=[Depends(verify_jwt)])
app.include_router(activity_router, tags=["Activities"], dependencies=[Depends(verify_jwt)])
app.include_router(weight_controler, tags=["Weights"], dependencies=[Depends(verify_jwt)])