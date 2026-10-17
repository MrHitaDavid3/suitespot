"""POST /reservations/{id}/cancel: cancel my reservation (US2.2, task 2.2.1)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas.cancel import CancelResponse
from app.services.cancellation import (
    NotCancellable,
    ReservationNotFound,
    cancel_reservation,
)

router = APIRouter(prefix="/reservations", tags=["reservations"])


def _error(kind: str, message: str) -> list[dict]:
    # Same shape as FastAPI's 422 errors, so the frontend handles all errors alike.
    return [{"type": kind, "loc": ["path", "reservation_id"], "msg": message}]


@router.post("/{reservation_id}/cancel", response_model=CancelResponse)
def cancel(
    reservation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return cancel_reservation(db, reservation_id=reservation_id, user_id=user.id)
    except ReservationNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=_error("not_found", "Reservation not found."),
        )
    except NotCancellable as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=_error("not_cancellable", error.message),
        )
