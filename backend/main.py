from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth_tokens, health, search

app = FastAPI(title="SuiteSpot API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(register.router)
app.include_router(search.router)
app.include_router(auth_tokens.router)
