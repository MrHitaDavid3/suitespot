from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.images import router as images
from app.images.resize import SIZED_DIR
from app.routers import auth_tokens, health, logout, register, search

app = FastAPI(title="SuiteSpot API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(search.router)
app.include_router(auth_tokens.router)
app.include_router(register.router)
app.include_router(logout.router)
app.include_router(images.router)

# Resized hotel photos (1.3.1), built by `python -m app.images` or the seed.
app.mount("/media", StaticFiles(directory=SIZED_DIR, check_dir=False), name="media")
