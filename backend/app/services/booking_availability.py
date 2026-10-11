from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.models.room import Room
from app.services.availability import FREE_STATUSES, is_room_available

HOLD_MINUTES = 15
STATUS_PENDING = "pending"
STATUS_CANCELLED = FREE_STATUSES[0]  # "cancelled"


class BookingError(Exception):
    """Base class. Routers should map each subclass to an HTTP error."""


class RoomNotFound(BookingError):  # -> 404
    pass


class InvalidStay(BookingError):  # -> 422
    def __init__(self, field: str, message: str):
        super().__init__(message)
        self.field = field
        self.message = message


class RoomUnavailable(BookingError):  # -> 409
    pass


def _utc(value: datetime) -> datetime:
    """SQLite returns naive datetimes; treat them as UTC so comparisons work."""
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def release_expired_holds(db: Session, *, now: datetime | None = None) -> int:
    """Cancel pending reservations older than HOLD_MINUTES. Returns how many."""
    now = now or datetime.now(timezone.utc)
    cutoff = timedelta(minutes=HOLD_MINUTES)
    pending = db.execute(
        select(Reservation).where(Reservation.status == STATUS_PENDING)
    ).scalars()
    released = 0
    for reservation in pending:
        if reservation.created_at and now - _utc(reservation.created_at) >= cutoff:
            reservation.status = STATUS_CANCELLED
            released += 1
    if released:
        db.commit()
    return released


def place_hold(
    db: Session,
    *,
    user_id: str,
    room_id: str,
    check_in: date,
    check_out: date,
    num_guests: int = 1,
    special_requests: