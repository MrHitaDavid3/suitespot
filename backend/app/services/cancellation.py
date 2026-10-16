"""Cancel a reservation: the status transition (US2.2, task 2.2.1).

Cancelling flips the reservation's status to "cancelled". The availability rule
(app.services.availability) already treats "cancelled" as free, so the room
opens up again for those dates with no extra work.

Money is NOT handled here. Charging or refunding by cancellation tier
(free beyond 7 days, 50% inside 7 days, 100% inside 48 hours) is task 3.3.3,
which builds on this transition.
"""

from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.services.availability import FREE_STATUSES

STATUS_CANCELLED = FREE_STATUSES[0]  # "cancelled"
CANCELLABLE_STATUSES = ("pending", "confirmed")


class CancellationError(Exception):
    """Base class. Routers map each subclass to an HTTP error."""


class ReservationNotFound(CancellationError):  # -> 404
    pass


class NotCancellable(CancellationError):  # -> 409
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


def cancel_reservation(
    db: Session,
    *,
    reservation_id: str,
    user_id: str,
    today: date | None = None,
) -> Reservation:
    """Cancel one of the user's own reservations and return it.

    Raises ReservationNotFound if it doesn't exist or belongs to someone else
    (the two look identical, so a guest can't probe for other people's ids), and
    NotCancellable if the stay has already started or the status can't change.
    Cancelling an already-cancelled reservation succeeds and changes nothing,
    so a double click or a retry is harmless.
    """
    today = today or datetime.now(timezone.utc).date()

    # FOR UPDATE locks the row on PostgreSQL, so a cancel and a payment
    # confirmation (3.1.4) on the same reservation happen one after the other.
    reservation = db.execute(
        select(Reservation)
        .where(Reservation.id == reservation_id, Reservation.user_id == user_id)
        .with_for_update()
    ).scalar_one_or_none()
    if reservation is None:
        raise ReservationNotFound(reservation_id)

    if reservation.status == STATUS_CANCELLED:
        db.rollback()  # nothing to change; release the lock
        return reservation

    if reservation.status not in CANCELLABLE_STATUSES:
        db.rollback()
        raise NotCancellable("This reservation can no longer be cancelled.")
    if reservation.check_in_date < today:
        db.rollback()
        raise NotCancellable("A stay that has already started can't be cancelled.")

    reservation.status = STATUS_CANCELLED
    db.commit()
    db.refresh(reservation)
    return reservation