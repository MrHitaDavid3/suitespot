"""5.2.2 Session tokens: issue and refresh.

A short-lived access token (sent on every API call) and a longer-lived refresh
token (traded for a new pair at POST /auth/refresh). Both are signed JWTs
carrying the user id in `sub` and a `type` claim so one can't stand in for
the other.

5.2.3 (protected-route guard) builds get_current_user on decode_token().
"""
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException

from app.config import settings

ALGORITHM = "HS256"
ACCESS_TTL = timedelta(minutes=15)
REFRESH_TTL = timedelta(days=7)


def _make_token(user_id: str, kind: str, ttl: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": user_id, "type": kind, "iat": now, "exp": now + ttl}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def issue_tokens(user_id: str) -> dict[str, str]:
    return {
        "access_token": _make_token(user_id, "access", ACCESS_TTL),
        "refresh_token": _make_token(user_id, "refresh", REFRESH_TTL),
        "token_type": "bearer",
    }


def decode_token(token: str, expected_type: str) -> dict:
    """Return the token payload, or raise 401 if it is expired, forged or the wrong type."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid session token.")
    if payload.get("type") != expected_type:
        raise HTTPException(status_code=401, detail="Invalid session token.")
    return payload
