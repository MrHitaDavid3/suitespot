from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import decode_token, issue_tokens

router = APIRouter(prefix="/auth", tags=["auth"])


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh")
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    """Trade a valid refresh token for a fresh access + refresh pair."""
    payload = decode_token(body.refresh_token, "refresh")
    user = db.get(User, payload["sub"])
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid session token.")
    return issue_tokens(user.id)
