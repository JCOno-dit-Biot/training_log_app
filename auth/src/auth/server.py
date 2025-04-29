from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.api.userController import user_controller_router
import uvicorn

app = FastAPI()

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
app.include_router(user_controller_router, tags=["Users"])

def main():
    uvicorn.run(
        "auth.server:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

if __name__ == "__main__":
    main()