from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.models.room import Room

HOLD_MINUTES = 15
STATUS_PENDING = "pending"
STATUS_CONFIRMED = "confirmed"


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


def _blocks(reservation: Reservation, now: datetime) -> bool:
    if reservation.status == STATUS_CONFIRMED:
        return True
    if reservation.status == STATUS_PENDING:
        created = _utc(reservation.created_at) if reservation.created_at else now
        return now - created < timedelta(minutes=HOLD_MINUTES)
    return False


def find_conflicts(
    db: Session,
    room_id: str,
    check_in: date,
    check_out: date,
    *,
    now: datetime | None = None,
) -> list[Reservation]:
    """Reservations that block this room for these dates.

    Stays overlap when each starts before the other ends, so a guest checking
    in on the day another checks out is allowed.
    """
    now = now or datetime.now(timezone.utc)
    candidates = db.execute(
        select(Reservation).where(
            Reservation.room_id == room_id,
            Reservation.check_in_date < check_out,
            Reservation.check_out_date > check_in,
        )
    ).scalars()
    return [r for r in candidates if _blocks(r, now)]


def is_room_available(
    db: Session,
    room_id: str,
    check_in: date,
    check_out: date,
    *,
    now: datetime | None = None,
) -> bool:
    room = db.get(Room, room_id)
    if room is None or not room.is_available:
        return False
    return not find_conflicts(db, room_id, check_in, check_out, now=now)


def place_hold(
    db: Session,
    *,
    user_id: str,
    room_id: str,
    check_in: date,
    check_out: date,
    num_guests: int = 1,
    special_requests: str | None = None,
    now: datetime | None = None,
) -> Reservation:
    """Re-check availability and create a pending reservation (the hold).

    Raises RoomNotFound, InvalidStay or RoomUnavailable. On success the hold is
    committed and returned.
    """
    now = now or datetime.now(timezone.utc)

    if check_out <= check_in:
        raise InvalidStay("check_out", "Check-out must be after check-in.")
    if check_in < now.date():
        raise InvalidStay("check_in", "Check-in can't be in the past.")
    if num_guests < 1:
        raise InvalidStay("num_guests", "At least one guest is required.")

    # FOR UPDATE locks the room row on PostgreSQL, so two guests submitting at
    # the same moment are checked one after the other. SQLite ignores it.
    room = db.execute(
        select(Room).where(Room.id == room_id).with_for_update()
    ).scalar_one_or_none()
    if room is None:
        raise RoomNotFound(f"Room {room_id} does not exist.")
    if num_guests > room.max_guests:
        raise InvalidStay(
            "num_guests", f"This room sleeps at most {room.max_guests} guests."
        )
    if not room.is_available or find_conflicts(db, room_id, check_in, check_out, now=now):
        db.rollback()  # release the room lock
        raise RoomUnavailable("This room is no longer available for those dates.")

    nights = (check_out - check_in).days
    hold = Reservation(
        user_id=user_id,
        room_id=room_id,
        check_in_date=check_in,
        check_out_date=check_out,
        num_guests=num_guests,
        total_price=Decimal(str(room.price_per_night)) * nights,
        status=STATUS_PENDING,
        special_requests=special_requests,
    )
    db.add(hold)
    db.commit()
    db.refresh(hold)
    return hold