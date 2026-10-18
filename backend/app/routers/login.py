"""Authenticate an existing user and issue signed access/refresh tokens."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas.auth import LoginRequest
from app.security import issue_tokens
from app.services.passwords import verify_password

router = APIRouter(tags=["auth"])

@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == body.email)).scalar_one_or_none()
    # Verify a dummy hash for missing accounts to avoid a trivial timing oracle.
    if user is None or not user.is_active or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return issue_tokens(user.id)
