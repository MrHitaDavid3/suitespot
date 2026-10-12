from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.register import RegisterResponse
from app.services.passwords import hash_password

router = APIRouter()

EMAIL_TAKEN = [
    {
        "type": "email_taken",
        "loc": ["body", "email"],
        "msg": "An account with this email already exists.",
    }
]


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    body: RegisterRequest,
    db: Session = Depends(get_db),
) -> User:
    existing = db.execute(
        select(User).where(User.email == body.email)
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=EMAIL_TAKEN,
        )

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        first_name=body.first_name or "",
        last_name=body.last_name or "",
        phone=body.phone or None,
        role="guest",
    )

    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=EMAIL_TAKEN,
        )

    db.refresh(user)

    return user
